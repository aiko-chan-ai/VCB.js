/*
 * MIT License
 *
 * Copyright (c) 2024 aiko-chan-ai and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { createHash, randomUUID } from 'node:crypto';

import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import * as crc from 'crc';
import moment from 'moment';
import { CookieJar } from 'tough-cookie';

import { Endpoints, WEB } from './Constants.js';
import { VCBCryptoManager } from './Crypto.js';
import {
	ErrorCode,
	VCBAccountDetailResponse,
	VCBAllAccountDetailResponse,
	VCBGetTransactionsHistoryResponse,
	VCBLoginSuccessResponse,
} from './Interface.js';
import { Util } from './Util.js';

export class VCBRestClient {
	jar = new CookieJar();
	cryptoService!: VCBCryptoManager;
	client = wrapper(
		axios.create({
			jar: this.jar,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
				accept: 'application/json, text/plain, */*',
				'accept-language':
					'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5',
				'sec-ch-ua':
					'"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"Windows"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-site',
				'x-channel': 'Web',
				Referer: 'https://vcbdigibank.vietcombank.com.vn/',
				'Referrer-Policy': 'strict-origin-when-cross-origin',
			},
		}),
	);
	browserId: string;
	captchaToken = randomUUID();
	#username = '';
	#cif = '';
	#clientId = '';
	#mobileId = '';
	#sessionId = '';
	private generateHeader() {
		// Generate X-Request-ID
		const currentTime = String(Date.now());
		const randomValue = String(Math.floor(100 * Math.random()));
		const usernameCrc = crc.crc16(this.#username).toString(16);
		const requestID = `${currentTime}${randomValue}${usernameCrc}`;
		// Generate X-Lim-ID using SHA256
		const sha256 = createHash('sha256');
		const limID = sha256
			.update(this.#username + this.cryptoService.crcKey)
			.digest('hex');
		return {
			'X-Lim-Id': limID,
			'X-Request-Id': requestID,
		};
	}
	constructor(browserId: string) {
		if (browserId) {
			this.browserId = browserId;
		} else {
			throw new Error('INVALID_BROWSER_ID', {
				cause: `Bạn cần vào trang web ${WEB} để lấy BrowserId`,
			});
		}
	}
	private postWithEncrypt<T>(url: string, data: any): Promise<T> {
		return new Promise((resolve, reject) => {
			if (!this.cryptoService) {
				reject(
					new Error(
						'Bạn cần sử dụng VCBRestClient#init() trước tiên',
					),
				);
			}
			this.handlerAxiosRequest<T>(
				this.client.post(url, this.cryptoService.encryptRequest(data), {
					headers: this.generateHeader(),
				}),
				true,
				(data: any) =>
					JSON.parse(this.cryptoService.decryptResponse(data)),
			)
				.catch(reject)
				.then((res) => {
					if (!res) {
						reject(new Error('INVALID_RESPONSE'));
					} else {
						resolve(res);
					}
				});
		});
	}
	login(username: string, password: string, captcha: string) {
		return new Promise<VCBLoginSuccessResponse>((resolve, reject) => {
			this.#username = username;
			this.postWithEncrypt<VCBLoginSuccessResponse>(
				'https://digiapp.vietcombank.com.vn' +
					Endpoints.LOGIN.prePoint +
					Endpoints.LOGIN.endPoint,
				{
					user: username,
					password,
					captchaValue: captcha,
					browserId: this.browserId,
					mid: Endpoints.LOGIN.mid,
					captchaToken: this.captchaToken,
					lang: 'vi',
					E: null,
					sessionId: null,
					DT: 'Windows',
					PM: 'Chrome 127.0.0.0',
					OV: '10',
					appVersion: '',
				},
			)
				.catch(reject)
				.then((res) => {
					if (res) {
						switch (res.code) {
							case ErrorCode.INVALID_CAPTCHA: {
								return reject(
									new Error('INVALID_CAPTCHA', {
										cause: res.des,
									}),
								);
							}
							case ErrorCode.USING_PHONE_VERIFY_FAILED:
							case ErrorCode.USING_PHONE_VERIFY_REQUESTED: {
								return reject(
									new Error('CANNOT_LOGIN', {
										cause: 'Bạn cần tắt tính năng Xác thực đăng nhập VCB Digibank trên WEB\nHướng dẫn tắt:\nCài đặt > Quản lý đăng nhập kênh > Xác thực đăng nhập VCB Digibank trên WEB',
									}),
								);
							}
							case ErrorCode.DISABLE_WEB_LOGIN: {
								return reject(
									new Error('DISABLE_WEB_LOGIN', {
										cause: 'Bạn đã tắt tính năng đăng nhập VCB Digibank trên WEB\nHướng dẫn bật:\nCài đặt > Quản lý đăng nhập kênh > Cài đặt đăng nhập VCB Digibank trên WEB',
									}),
								);
							}
							case ErrorCode.INVALID_LOGIN_DATA: {
								return reject(
									new Error('INVALID_LOGIN_DATA', {
										cause: res.des,
									}),
								);
							}
							case ErrorCode.NEW_BROWSER: {
								return reject(
									new Error('NEW_BROWSER', {
										cause: `Bạn hãy sử dụng trình duyệt chính, đăng nhập vào Web (nhớ chọn lưu trình duyệt), sau đó vào web ${WEB} để lấy BrowserId.\nRồi bạn hãy sử dụng BrowserId đó với thư viện\nnew VCBRestClient('<browserId có được ở bước trước đó>');`,
									}),
								);
							}
							case ErrorCode.OK: {
								this.#cif = res.userInfo.cif;
								this.#clientId = res.userInfo.clientId;
								this.#sessionId = res.userInfo.sessionId;
								this.#mobileId = res.userInfo.mobileId;
								return resolve(res);
							}
							default: {
								return reject(
									new Error('UNKNOWN_ERROR', {
										cause: res,
									}),
								);
							}
						}
					}
				});
		});
	}
	getAllAccount() {
		return new Promise<VCBAllAccountDetailResponse>((resolve, reject) => {
			this.postWithEncrypt<VCBAllAccountDetailResponse>(
				'https://digiapp.vietcombank.com.vn' +
					Endpoints.GET_LIST_ACCOUNT_VIA_CIF.prePoint +
					Endpoints.GET_LIST_ACCOUNT_VIA_CIF.endPoint,
				{
					mid: Endpoints.GET_LIST_ACCOUNT_VIA_CIF.mid,
					lang: 'vi',
					user: this.#username,
					cif: this.#cif,
					mobileId: this.#mobileId,
					clientId: this.#clientId,
					browserId: this.browserId,
					E: null,
					sessionId: this.#sessionId,
					DT: 'Windows',
					PM: 'Chrome 127.0.0.0',
					OV: '10',
					appVersion: '',
				},
			)
				.catch(reject)
				.then((res) => {
					if (!res) {
						reject(new Error('INVALID_RESPONSE'));
					} else if (res.code !== ErrorCode.OK) {
							reject(
								new Error('INVALID_RESPONSE', {
									cause: res,
								}),
							);
						} else {
							resolve(res);
						}
				});
		});
	}
	getAccountDetail(accountNo: string, accountType = 'D') {
		return new Promise<VCBAccountDetailResponse>((resolve, reject) => {
			this.postWithEncrypt<VCBAccountDetailResponse>(
				'https://digiapp.vietcombank.com.vn' +
					Endpoints.ACCOUNT_DETAIL.prePoint +
					Endpoints.ACCOUNT_DETAIL.endPoint,
				{
					mid: Endpoints.ACCOUNT_DETAIL.mid,
					lang: 'vi',
					user: this.#username,
					cif: this.#cif,
					mobileId: this.#mobileId,
					clientId: this.#clientId,
					browserId: this.browserId,
					E: null,
					sessionId: this.#sessionId,
					DT: 'Windows',
					PM: 'Chrome 127.0.0.0',
					OV: '10',
					appVersion: '',
					accountNo,
					accountType,
				},
			)
				.catch(reject)
				.then((res) => {
					if (!res) {
						reject(new Error('INVALID_RESPONSE'));
					} else if (res.code !== ErrorCode.OK) {
							reject(
								new Error('INVALID_RESPONSE', {
									cause: res,
								}),
							);
						} else {
							resolve(res);
						}
				});
		});
	}
	getTransactionsHistory(
		accountNo: string,
		accountType = 'D',
		fromDate: Date,
		toDate = new Date(),
	) {
		return new Promise<VCBGetTransactionsHistoryResponse>(
			(resolve, reject) => {
				if (fromDate.getTime() > toDate.getTime()) {
					reject(
						new Error('INVALID_DATE', {
							cause: 'fromDate lớn hơn toDate',
						}),
					);
				}
				this.postWithEncrypt<VCBGetTransactionsHistoryResponse>(
					'https://digiapp.vietcombank.com.vn' +
						Endpoints.TRANSACTION_HISTORY.prePoint +
						Endpoints.TRANSACTION_HISTORY.endPoint,
					{
						accountNo,
						accountType,
						fromDate: moment(fromDate).format('DD/MM/YYYY'),
						toDate: moment(toDate).format('DD/MM/YYYY'),
						pageIndex: 0,
						lengthInPage: 999999,
						mid: Endpoints.TRANSACTION_HISTORY.mid,
						lang: 'vi',
						user: this.#username,
						cif: this.#cif,
						mobileId: this.#mobileId,
						clientId: this.#clientId,
						browserId: this.browserId,
						E: null,
						sessionId: this.#sessionId,
						DT: 'Windows',
						PM: 'Chrome 127.0.0.0',
						OV: '10',
						appVersion: '',
					},
				)
					.catch(reject)
					.then((res) => {
						if (!res) {
							reject(new Error('INVALID_RESPONSE'));
						} else if (res.code !== ErrorCode.OK) {
								reject(
									new Error('INVALID_RESPONSE', {
										cause: res,
									}),
								);
							} else {
								resolve(res);
							}
					});
			},
		);
	}
	getExcelTransactionsHistory(
		accountNo: string,
		accountType = 'D',
		fromDate: Date,
		toDate = new Date(),
	) {
		return new Promise<{
			name: 'lich-su-giao-dich-tai-khoan.xlsx';
			data: Buffer;
		}>((resolve, reject) => {
			if (fromDate.getTime() > toDate.getTime()) {
				reject(
					new Error('INVALID_DATE', {
						cause: 'fromDate lớn hơn toDate',
					}),
				);
			}
			this.handlerAxiosRequest<Buffer>(
				this.client.post(
					'https://digiapp.vietcombank.com.vn' +
						Endpoints.EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL.prePoint +
						Endpoints.EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL.endPoint,
					this.cryptoService.encryptRequest({
						accountName: '',
						accountCcy: 'VND',
						accountNo,
						accountType,
						fromDate: moment(fromDate).format('DD/MM/YYYY'),
						toDate: moment(toDate).format('DD/MM/YYYY'),
						pageIndex: 0,
						lengthInPage: 999999,
						stmtDate: '',
						stmtType: '',
						cumulativeBalance: '',
						lang: 'vi',
						mid: Endpoints.EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL.mid,
						user: this.#username,
						cif: this.#cif,
						mobileId: this.#mobileId,
						clientId: this.#clientId,
						browserId: this.browserId,
						E: null,
						sessionId: this.#sessionId,
						DT: 'Windows',
						PM: 'Chrome 127.0.0.0',
						OV: '10',
						appVersion: '',
					}),
					{
						responseType: 'arraybuffer',
					},
				),
				true,
			)
				.catch(reject)
				.then((res) => {
					if (!res) {
						reject(new Error('INVALID_RESPONSE'));
					} else {
						resolve({
							name: 'lich-su-giao-dich-tai-khoan.xlsx',
							data: res,
						});
					}
				});
		});
	}
	getCaptcha() {
		return this.handlerAxiosRequest<Buffer>(
			this.client.get(
				'https://digiapp.vietcombank.com.vn/utility-service/v2/captcha/MASS/' +
					this.captchaToken,
				{
					responseType: 'arraybuffer',
				},
			),
			true,
			(data: any) => Buffer.from(data),
		);
	}
	async init() {
		const mainJS = await Util.findMainJS();
		if (!mainJS) {
			throw new Error(
				'Không tìm thấy script main.{\\w+}.js (Có lẽ đây là một lỗi, hãy báo cáo cho Ellie)',
			);
		}
		const jsText = await (await fetch(mainJS)).text();
		this.cryptoService = new VCBCryptoManager(jsText);
	}
	private handlerAxiosRequest<T>(
		request: Promise<any>,
		resolveResult = true,
		functionConvertResult?: any,
	): Promise<T> {
		return new Promise((resolve, reject) => {
			request
				.then((res) => {
					resolve(
						resolveResult
							? typeof functionConvertResult == 'function'
								? functionConvertResult(res.data)
								: res.data
							: res,
					);
				})
				.catch((error) => {
					if (axios.isAxiosError(error)) {
						reject({
							message: error.message,
							request: error.request,
							response: error.response,
						});
					} else {
						reject(error);
					}
				});
		});
	}
}
