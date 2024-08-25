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

export enum ErrorCode {
	INVALID_LOGIN_DATA = '3005',
	INVALID_CAPTCHA = '0111',
	NEW_BROWSER = '20231',
	USING_PHONE_VERIFY_REQUESTED = '0126',
	USING_PHONE_VERIFY_FAILED = '0101',
	DISABLE_WEB_LOGIN = '019',
	OK = '00',
	OTHER_DEVICES = '108',
}

export interface VCBLoginSuccessResponse {
	mid: string;
	code: string;
	des: string;
	sessionId: string;
	clientIp: string;
	accessKey: string;
	userInfo: {
		username: string;
		cusId: string;
		mobileNo: string;
		cif: string;
		cusName: string;
		avatarUrl: string;
		cusEmail: string;
		cusEmailSeq: string;
		createUser: string;
		updateUser: string;
		confirmUser: string;
		resetPassDate: string;
		defaultAccount: string;
		defaultAccountNew: string;
		defaultAccountType: string;
		defaultAccountCcy: string;
		defaultAccountProduct: string;
		defaultAccountBranchCode: string;
		status: string;
		cusAddr: string;
		cusIdNumber: string;
		idType: string;
		issueDate: string;
		birthday: string;
		sex: string;
		cusType: string;
		cusResident: string;
		numConfirmOtp: string;
		numOtpActSoft: string;
		otpMethod: string;
		mobileId: string;
		clientId: string;
		registChannel: string;
		createdDate: string;
		receiverOTP: string;
		lastLogin: string;
		crossLogin: string;
		isActiveSMS: string;
		isLockedWeb: string;
		isLockedMB: string;
		channelId: string;
		emailSettings: string;
		pkgCode: string;
		branchCode: string;
		maxBalanceSubService: string;
		isPilot: string;
		isPilotSoftOTP: string;
		isPilotAtmDraw: string;
		isPilotVCBSmartApp: string;
		listChannel: {
			channel: string;
			channelId: string;
			lastLogin: string;
			isLocked: string;
			otpMethod: string;
			numConfirmOTP: string;
			numOtpActSoft: string;
			methodOTP: string;
			appVer?: string;
			ov?: string;
			os?: string;
			imei?: string;
			deviceType?: string;
			touchPin?: string;
			touchId?: string;
		}[];
		lockSession: boolean;
		omniSession: boolean;
		sessionId: string;
		lastUsed: string;
		converted: boolean;
		useVCBSoft: string;
		hasOldSoft: string;
		validateLuckyAcc: boolean;
		validateOpenLoanFD: boolean;
		validateOpenAliasAcc: boolean;
		failTime: number;
		isCheckCard: string;
		checkVipTime: string;
		cusLevel: string;
		custClass: string;
		acceptD13CollInfo: string;
		acceptHdgdat: string;
		cvpTheme: string;
		bestCVP: string;
		ottKey: string;
		facepayVerified: string;
		validIssue: boolean;
		validSMSOTP: boolean;
	};
	durationExpire: string;
	futureTransferLimitDay: string;
	recurringTransferLimitDay: string;
	useFakeId: string;
	defaultGreetingCode: string;
	isUserLoyalty: string;
	durationWaiting: string;
	ottKey: string;
	tags: {
		functionId: string;
		tagNameVi: string;
		tagNameEn: string;
	}[];
	isRegistedOTT: boolean;
}

export interface VCBAccountDetailResponse {
	mid: string;
	code: string;
	des: string;
	clientIp: string;
	accountDetail: {
		accountNo: string;
		newAccountNo: string;
		cif: string;
		address: string;
		customerName: string;
		accruedInterest: string;
		accountType: string;
		accountCurr: string;
		availBalance: string;
		availBalanceWH: string;
		branchCode: string;
		branchName: string;
		groupCode: string;
		holdBalance: string;
		interest: string;
		currentBalance: string;
		openDate: string;
		productTypeCode: string;
		reserve8: string;
		accountStatus: string;
		overdraftBalance: string;
		lastTransactionDate: string;
		overdraftInterest: string;
		pdtNumber: number;
		rowNum: number;
		joinAccount: boolean;
		tlastsStatus: string[];
		aliasName: never[];
		currency: string;
		accountNumber: string;
	};
}

export interface VCBAllAccountDetailResponse {
	mid: string;
	code: string;
	des: string;
	clientIp: string;
	accountListNote: string;
	isDisbursement: string;
	cashBackAvail: string;
	DDAccounts: {
		accountNo: string;
		newAccountNo: string;
		cif: string;
		customerName: string;
		accountType: string;
		accountCurr: string;
		availBalance: string;
		availableBalance: string;
		branchCode: string;
		productTypeCode: string;
		accountStatus: string;
		pdtNumber: number;
		rowNum: number;
		joinAccount: boolean;
		currency: string;
		accountNumber: string;
	}[];
	FDAccounts: any[];
	LNAccounts: any[];
	cards: {
		maskingCardNumber: string;
		expireMonth: number;
		expireYear: number;
		cardHolderName: string;
		brand: string;
		isDebit: boolean;
		blockCode: string;
		pdtNumber: number;
		outstandingBalance: number;
		creditAvailable: number;
		cifCreditAvailable: number;
		creditLimit: number;
		cashAvailable: string;
		cashLimit: number;
		supRel: string;
		accountNumber: string;
		currency: string;
		rrn: string;
		usageCode: string;
		cardBase: string;
		cardNumber: string;
		cardName: string;
		cardType: string;
		productCode: string;
		productTypeCode: string;
		cardNo: string;
		expireDate: string;
		rowNum: number;
		cardStatus: string;
		cardAccount: string;
		issDate: string;
		expDate: string;
		xpacCode: string;
		accStatus: string;
		availBalance: string;
		currentBalance: string;
		penaltyCharge: string;
		profitAdd: string;
		interest: string;
		overdraftBalance: string;
		holdBalance: string;
		accruedInterest: string;
		emailRegisterOtp: string;
		productName: string;
		productNameEn: string;
		url: string;
		cardSize: string;
		cardModel: string;
		tokenDetail: string;
		pushProvisioning: string;
		overseaReg: string;
		extendable: string;
		installmentHis: string;
		activation: string;
		processView: string;
		isActive: string;
		usageCodeInternet: string;
		isCashback: string;
		issUrl: string;
		priority: number;
		token: string;
	}[];
	numDDAccounts: string;
	numFDAccounts: string;
	numLNAccounts: string;
	numCardAccounts: string;
}

export interface VCBGetTransactionsHistoryResponse {
	mid: string;
	code: string;
	des: string;
	clientIp: string;
	transactions: {
		tranDate: string;
		curCode: string;
		TransactionDate: string;
		Reference: string;
		CD: string;
		Amount: string;
		Description: string;
		PCTime: string;
		DorCCode: string;
		EffDate: string;
		PostingDate: string;
		PostingTime: string;
		Remark: string;
		SeqNo: string;
		TnxCode: string;
		Teller: string;
	}[];
	nextIndex: string;
}