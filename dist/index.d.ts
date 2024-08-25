import * as axios from 'axios';
import { CookieJar } from 'tough-cookie';

declare class VCBCryptoManager {
    #private;
    private keys;
    private clientPublicKey;
    private clientPrivateKey;
    defaultPublicKey: string;
    uploadAES: string;
    uploadHMac: string;
    crcKey: string;
    constructor(stringJS: string);
    get isActive(): boolean;
    encryptText(text: string): string;
    decryptText(text: string): string;
    genKeys(): void;
    encryptRequest(data: object): {
        d: string;
        k: string;
    };
    decryptResponse(response: {
        k: string;
        d: string;
    }): string;
    encryptDataText(text: string): string;
    decryptDataText(text: string): string;
    encryptPCI(data: string, publicKey: string): string;
    sha256(data: string): string;
    generateKeyPCI(): {
        public: string;
        private: string;
    };
    decryptPCI(encryptedData: string, privateKey: string): string;
    decryptLoginInsight(encryptedText: string, decryptInfo: any): string;
    encryptInsightRequest(data: object, encryptInfo: any): string;
    encryptUpload(data: object): {
        timestamp: number;
        data: string;
        data_form: string;
        mac: string;
        mac_form: string;
    };
    decryptUpload(encryptedData: string): string;
}

declare enum ErrorCode {
    INVALID_LOGIN_DATA = "3005",
    INVALID_CAPTCHA = "0111",
    NEW_BROWSER = "20231",
    USING_PHONE_VERIFY_REQUESTED = "0126",
    USING_PHONE_VERIFY_FAILED = "0101",
    DISABLE_WEB_LOGIN = "019",
    OK = "00",
    OTHER_DEVICES = "108"
}
interface VCBLoginSuccessResponse {
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
interface VCBAccountDetailResponse {
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
interface VCBAllAccountDetailResponse {
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
interface VCBGetTransactionsHistoryResponse {
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

declare class VCBRestClient {
    #private;
    jar: CookieJar;
    cryptoService: VCBCryptoManager;
    client: axios.AxiosInstance;
    browserId: string;
    captchaToken: `${string}-${string}-${string}-${string}-${string}`;
    private generateHeader;
    constructor(browserId: string);
    private postWithEncrypt;
    login(username: string, password: string, captcha: string): Promise<VCBLoginSuccessResponse>;
    getAllAccount(): Promise<VCBAllAccountDetailResponse>;
    getAccountDetail(accountNo: string, accountType?: string): Promise<VCBAccountDetailResponse>;
    getTransactionsHistory(accountNo: string, accountType: string | undefined, fromDate: Date, toDate?: Date): Promise<VCBGetTransactionsHistoryResponse>;
    getExcelTransactionsHistory(accountNo: string, accountType: string | undefined, fromDate: Date, toDate?: Date): Promise<{
        name: "lich-su-giao-dich-tai-khoan.xlsx";
        data: Buffer;
    }>;
    getCaptcha(): Promise<Buffer>;
    init(): Promise<void>;
    private handlerAxiosRequest;
}

declare const WEB = "n\u00E0y";
declare const Endpoints: {
    LOGIN: {
        prePoint: string;
        endPoint: string;
        mid: number;
    };
    ACCOUNT_DETAIL: {
        prePoint: string;
        endPoint: string;
        mid: number;
    };
    GET_LIST_ACCOUNT_VIA_CIF: {
        prePoint: string;
        endPoint: string;
        mid: number;
    };
    TRANSACTION_HISTORY: {
        prePoint: string;
        endPoint: string;
        mid: number;
    };
    EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL: {
        prePoint: string;
        endPoint: string;
        mid: string;
    };
};

declare class Util {
    static findingValueFromJson(key: string, text: string): string;
    static findMainJS(): Promise<string | null>;
    static randomMD5(): string;
}

export { Endpoints, ErrorCode, Util, type VCBAccountDetailResponse, type VCBAllAccountDetailResponse, VCBCryptoManager, type VCBGetTransactionsHistoryResponse, type VCBLoginSuccessResponse, VCBRestClient, WEB };
