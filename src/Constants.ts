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

export const WEB = 'https://aiko-chan-ai.github.io/VCB.js/';

export const Endpoints = {
	LOGIN: {
		prePoint: '/authen-service',
		endPoint: '/v1/login',
		mid: 6,
	},
	ACCOUNT_DETAIL: {
		prePoint: '/bank-service',
		endPoint: '/v2/get-account-detail',
		mid: 13,
	},
	GET_LIST_ACCOUNT_VIA_CIF: {
		prePoint: '/bank-service',
		endPoint: '/v2/get-list-account-via-cif',
		mid: 8,
	},
	TRANSACTION_HISTORY: {
		prePoint: '/bank-service',
		endPoint: '/v1/transaction-history',
		mid: 14,
	},
	EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL: {
		prePoint: '/utility-service',
		endPoint: '/v1/export-his-statement-account-excel',
		mid: 'export_account_excel',
	},
};
