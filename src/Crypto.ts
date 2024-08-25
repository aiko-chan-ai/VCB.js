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

import { Buffer } from 'node:buffer';

import { randomBytes } from 'crypto';
import forge from 'node-forge';

import { Util } from './Util.js';

export class VCBCryptoManager {
	#isActive = false;
	private keys: any;
	private clientPublicKey: string = '';
	private clientPrivateKey: string = '';
	public defaultPublicKey = '';
	public uploadAES = '';
	public uploadHMac = '';
	public crcKey = '';

	constructor(stringJS: string) {
		this.defaultPublicKey = Util.findingValueFromJson(
			'publicKey',
			stringJS,
		);
		this.uploadAES = Util.findingValueFromJson('uploadAES', stringJS);
		this.uploadHMac = Util.findingValueFromJson('uploadHMac', stringJS);
		this.crcKey = Util.findingValueFromJson('crcKey', stringJS);
		this.genKeys();
	}

	get isActive() {
		return this.#isActive;
	}

	encryptText(text: string): string {
		if (text && typeof text === 'string') {
			let encoded = Buffer.from(text, 'utf-8').toString('base64');
			encoded = encoded.split('').reverse().join('');
			return Buffer.from(encoded, 'utf-8').toString('base64');
		}
		return text;
	}

	decryptText(text: string): string {
		if (text && typeof text === 'string') {
			let decoded = Buffer.from(text, 'base64').toString('utf-8');
			decoded = decoded.split('').reverse().join('');
			return Buffer.from(decoded, 'base64').toString('utf-8');
		}
		return text;
	}

	genKeys() {
		if (!this.keys) {
			this.keys = forge.pki.rsa.generateKeyPair({
				bits: 1024,
				workers: 1,
			});
			this.clientPublicKey = forge.pki
				.publicKeyToPem(this.keys.publicKey)
				.replace(/(-|(BEGIN|END) PUBLIC KEY|\r|\n)/gi, '');
			this.clientPrivateKey = forge.pki.privateKeyToPem(
				this.keys.privateKey,
			);
			this.#isActive = true;
		}
	}

	encryptRequest(data: object): { d: string; k: string } {
		const aesKey = forge.random.getBytesSync(32);
		const iv = forge.random.getBytesSync(16);
		const requestData = {
			clientPubKey: this.clientPublicKey,
			...data,
		};

		const cipher = forge.cipher.createCipher('AES-CTR', aesKey);
		cipher.start({ iv });
		cipher.update(
			forge.util.createBuffer(
				forge.util.encodeUtf8(JSON.stringify(requestData)),
			),
		);
		cipher.finish();

		const encryptedData = Buffer.concat([
			Buffer.from(iv, 'binary'),
			Buffer.from(cipher.output.data, 'binary'),
		]);
		const encryptedKey = forge.pki
			.publicKeyFromPem(forge.util.decode64(this.defaultPublicKey))
			.encrypt(forge.util.encode64(aesKey));

		return {
			d: encryptedData.toString('base64'),
			k: forge.util.encode64(encryptedKey),
		};
	}

	decryptResponse(response: { k: string; d: string }): string {
		const { k, d } = response;
		const privateKey = forge.pki.privateKeyFromPem(this.clientPrivateKey);
		const aesKey = forge.util.decodeUtf8(
			privateKey.decrypt(forge.util.decode64(k)),
		);
		const dataBuffer = Buffer.from(d, 'base64');
		const iv = dataBuffer.slice(0, 16);
		const encryptedData = dataBuffer.slice(16);

		const decipher = forge.cipher.createDecipher(
			'AES-CTR',
			Buffer.from(aesKey, 'base64').toString('binary'),
		);
		decipher.start({ iv: iv.toString('binary') });
		decipher.update(forge.util.createBuffer(encryptedData));
		decipher.finish();

		return forge.util.decodeUtf8(decipher.output.data);
	}

	encryptDataText(text: string): string {
		if (text) {
			return Buffer.from(encodeURIComponent(text), 'utf8')
				.toString('base64')
				.split('')
				.reverse()
				.join('');
		}
		return '';
	}

	decryptDataText(text: string): string {
		if (text) {
			return decodeURIComponent(
				Buffer.from(
					text.split('').reverse().join(''),
					'base64',
				).toString('utf8'),
			);
		}
		return '';
	}

	encryptPCI(data: string, publicKey: string): string {
		if (!publicKey) {
			throw new Error('Error crypto: not have publickey');
		}
		if (!publicKey.includes('BEGIN PUBLIC KEY')) {
			publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
		}
		const encryptedData = forge.pki
			.publicKeyFromPem(publicKey)
			.encrypt(data);
		return forge.util.encode64(encryptedData);
	}

	sha256(data: string): string {
		const sha256 = forge.md.sha256.create();
		sha256.update(data);
		return sha256.digest().toHex();
	}

	generateKeyPCI(): { public: string; private: string } {
		const keyPair = forge.pki.rsa.generateKeyPair({
			bits: 1024,
			workers: 1,
		});
		return {
			public: forge.pki
				.publicKeyToPem(keyPair.publicKey)
				.replace(/(-|(BEGIN|END) PUBLIC KEY|\r|\n)/gi, ''),
			private: forge.pki.privateKeyToPem(keyPair.privateKey),
		};
	}

	decryptPCI(encryptedData: string, privateKey: string): string {
		if (!privateKey) {
			throw new Error('Error crypto: not have privateKey');
		}
		if (!privateKey.includes('BEGIN RSA PRIVATE KEY')) {
			privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;
		}
		const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
		const decodedData = forge.util.decode64(encryptedData);
		const decryptedData = privateKeyObj.decrypt(decodedData);
		return forge.util.decodeUtf8(decryptedData);
	}

	decryptLoginInsight(encryptedText: string, decryptInfo: any): string {
		const { encryptInfo } = decryptInfo;
		const { encryptKey, encryptSalt } = encryptInfo;
		const key = forge.util.encodeUtf8(encryptKey);
		const decipher = forge.cipher.createDecipher('AES-CTR', key);
		const decodedText = forge.util.decode64(encryptedText);

		decipher.start({ iv: encryptSalt });
		decipher.update(forge.util.createBuffer(decodedText));
		decipher.finish();

		return forge.util.decodeUtf8(decipher.output.getBytes());
	}

	encryptInsightRequest(data: object, encryptInfo: any): string {
		const { encryptKey, encryptSalt } = encryptInfo;
		if (!encryptKey) {
			throw new Error('No ssID value. Please login.');
		}
		const cipher = forge.cipher.createCipher(
			'AES-CTR',
			forge.util.encodeUtf8(encryptKey),
		);
		cipher.start({ iv: encryptSalt });
		cipher.update(
			forge.util.createBuffer(
				forge.util.encodeUtf8(JSON.stringify(data)),
			),
		);
		cipher.finish();
		return forge.util.encode64(cipher.output.getBytes());
	}

	encryptUpload(data: object): {
		timestamp: number;
		data: string;
		data_form: string;
		mac: string;
		mac_form: string;
	} {
		const aesKey = this.uploadAES;
		const hmacKey = this.uploadHMac;
		const iv = randomBytes(16);
		const stringifiedData = JSON.stringify(data);

		const cipher = forge.cipher.createCipher(
			'AES-CTR',
			Buffer.from(aesKey, 'utf8').toString('binary'),
		);
		cipher.start({ iv: iv.toString('hex') });
		cipher.update(
			forge.util.createBuffer(forge.util.encodeUtf8(stringifiedData)),
		);
		cipher.finish();

		const encryptedData = Buffer.concat([
			iv,
			Buffer.from(cipher.output.data, 'binary'),
		]);
		const timestamp = Date.now();

		const hmac = forge.hmac.create();
		hmac.start('sha256', hmacKey);
		hmac.update(encryptedData.toString('base64') + timestamp);
		const mac = Buffer.from(hmac.getMac().data, 'binary');

		return {
			timestamp,
			data: encodeURIComponent(encryptedData.toString('base64')),
			data_form: encryptedData.toString('base64'),
			mac: encodeURIComponent(mac.toString('base64')),
			mac_form: mac.toString('base64'),
		};
	}

	decryptUpload(encryptedData: string): string {
		const aesKey = this.uploadAES;
		const dataBuffer = Buffer.from(encryptedData, 'base64');
		const iv = dataBuffer.slice(0, 16);
		const encryptedContent = dataBuffer.slice(16);

		const decipher = forge.cipher.createDecipher(
			'AES-CTR',
			Buffer.from(aesKey, 'utf8').toString('binary'),
		);
		decipher.start({ iv: iv.toString('binary') });
		decipher.update(forge.util.createBuffer(encryptedContent));
		decipher.finish();

		return forge.util.decodeUtf8(decipher.output.data);
	}
}
