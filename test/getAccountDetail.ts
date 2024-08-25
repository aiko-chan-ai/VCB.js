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

import fs from 'fs';
import * as readline from 'readline';

import { VCBRestClient } from '../index.js';

// BrowserID là md5 của fingerprintJS (visitorId)
// Nếu có browserId thì sẽ không cần xác thực OTP
// Vào trang web này để lấy browserId
const client = new VCBRestClient('<browserId của bạn>');

await client.init();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// Test thư viện bằng cách giải Captcha thủ công
fs.writeFileSync('./captcha.png', await client.getCaptcha());

function askForCaptcha(): Promise<string> {
	return new Promise((resolve, reject) => {
		const i = setTimeout(() => {
			reject('Timeout');
		}, 60_000);
		rl.question('Nhập Captcha: ', (captcha) => {
			resolve(captcha);
			clearTimeout(i);
			rl.close();
		});
	});
}

await client.login('username', 'password', await askForCaptcha());

const allAccount = await client.getAllAccount();

console.log(
	await client.getAccountDetail(
		allAccount.DDAccounts[0].accountNo,
		allAccount.DDAccounts[0].accountType,
	),
);
