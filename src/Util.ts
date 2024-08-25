/* eslint-disable */
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

import { createHash, randomBytes } from 'crypto';
import { JSDOM } from 'jsdom';

export class Util {
	static findingValueFromJson(key: string, text: string): string {
		// Create a regular expression to match the key and capture its value
		const regex = new RegExp(`${key}\\s*:\\s*["']([^"']*)["']`, 'i');
		const match = text.match(regex);

		// If a match is found, return the captured value; otherwise, return null
		return match ? match[1] : '';
	}
	static findMainJS(): Promise<string | null> {
		return new Promise((r, e) => {
			fetch('https://vcbdigibank.vietcombank.com.vn/auth')
				.then((_) => _.text())
				.then((text) => {
					const dom = new JSDOM(text);

					// Get all script tags from the document
					const scriptTags =
						dom.window.document.querySelectorAll('script');

					// Regular expression to match the pattern main.{random}.js?v={any_version} or main.{random}.js
					const regex = /main\.\w+\.js(\?v=[\w\.]+)?/i;

					// Iterate over the script tags to find the one that matches the pattern
					for (const script of scriptTags) {
						if (script.src && regex.test(script.src)) {
							return r(
								'https://vcbdigibank.vietcombank.com.vn/' +
									script.src,
							); // Return the matching script src
						}
					}

					return r(null); // Return null if no match is found
				})
				.catch(e);
		});
	}
	static randomMD5() {
		// Generate a random buffer with a specified number of bytes
		const randomBuffer = randomBytes(16); // 16 bytes = 128 bits, which is common for a secure random seed

		// Create an MD5 hash of the random buffer
		const hash = createHash('md5').update(randomBuffer).digest('hex');

		return hash;
	}
}
