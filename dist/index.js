var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/Client.ts
import { createHash as createHash2, randomUUID } from "node:crypto";
import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import * as crc from "crc";
import moment from "moment";
import { CookieJar } from "tough-cookie";

// src/Constants.ts
var WEB = "https://aiko-chan-ai.github.io/VCB.js/";
var Endpoints = {
  LOGIN: {
    prePoint: "/authen-service",
    endPoint: "/v1/login",
    mid: 6
  },
  ACCOUNT_DETAIL: {
    prePoint: "/bank-service",
    endPoint: "/v2/get-account-detail",
    mid: 13
  },
  GET_LIST_ACCOUNT_VIA_CIF: {
    prePoint: "/bank-service",
    endPoint: "/v2/get-list-account-via-cif",
    mid: 8
  },
  TRANSACTION_HISTORY: {
    prePoint: "/bank-service",
    endPoint: "/v1/transaction-history",
    mid: 14
  },
  EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL: {
    prePoint: "/utility-service",
    endPoint: "/v1/export-his-statement-account-excel",
    mid: "export_account_excel"
  }
};

// src/Crypto.ts
import { Buffer as Buffer2 } from "node:buffer";
import { randomBytes as randomBytes2 } from "crypto";
import forge from "node-forge";

// src/Util.ts
import { createHash, randomBytes } from "crypto";
import { JSDOM } from "jsdom";
var Util = class {
  static {
    __name(this, "Util");
  }
  static findingValueFromJson(key, text) {
    const regex = new RegExp(`${key}\\s*:\\s*["']([^"']*)["']`, "i");
    const match = text.match(regex);
    return match ? match[1] : "";
  }
  static findMainJS() {
    return new Promise((r, e) => {
      fetch("https://vcbdigibank.vietcombank.com.vn/auth").then((_) => _.text()).then((text) => {
        const dom = new JSDOM(text);
        const scriptTags = dom.window.document.querySelectorAll("script");
        const regex = /main\.\w+\.js(\?v=[\w\.]+)?/i;
        for (const script of scriptTags) {
          if (script.src && regex.test(script.src)) {
            return r(
              "https://vcbdigibank.vietcombank.com.vn/" + script.src
            );
          }
        }
        return r(null);
      }).catch(e);
    });
  }
  static randomMD5() {
    const randomBuffer = randomBytes(16);
    const hash = createHash("md5").update(randomBuffer).digest("hex");
    return hash;
  }
};

// src/Crypto.ts
var VCBCryptoManager = class {
  static {
    __name(this, "VCBCryptoManager");
  }
  #isActive = false;
  keys;
  clientPublicKey = "";
  clientPrivateKey = "";
  defaultPublicKey = "";
  uploadAES = "";
  uploadHMac = "";
  crcKey = "";
  constructor(stringJS) {
    this.defaultPublicKey = Util.findingValueFromJson(
      "publicKey",
      stringJS
    );
    this.uploadAES = Util.findingValueFromJson("uploadAES", stringJS);
    this.uploadHMac = Util.findingValueFromJson("uploadHMac", stringJS);
    this.crcKey = Util.findingValueFromJson("crcKey", stringJS);
    this.genKeys();
  }
  get isActive() {
    return this.#isActive;
  }
  encryptText(text) {
    if (text && typeof text === "string") {
      let encoded = Buffer2.from(text, "utf-8").toString("base64");
      encoded = encoded.split("").reverse().join("");
      return Buffer2.from(encoded, "utf-8").toString("base64");
    }
    return text;
  }
  decryptText(text) {
    if (text && typeof text === "string") {
      let decoded = Buffer2.from(text, "base64").toString("utf-8");
      decoded = decoded.split("").reverse().join("");
      return Buffer2.from(decoded, "base64").toString("utf-8");
    }
    return text;
  }
  genKeys() {
    if (!this.keys) {
      this.keys = forge.pki.rsa.generateKeyPair({
        bits: 1024,
        workers: 1
      });
      this.clientPublicKey = forge.pki.publicKeyToPem(this.keys.publicKey).replace(/(-|(BEGIN|END) PUBLIC KEY|\r|\n)/gi, "");
      this.clientPrivateKey = forge.pki.privateKeyToPem(
        this.keys.privateKey
      );
      this.#isActive = true;
    }
  }
  encryptRequest(data) {
    const aesKey = forge.random.getBytesSync(32);
    const iv = forge.random.getBytesSync(16);
    const requestData = {
      clientPubKey: this.clientPublicKey,
      ...data
    };
    const cipher = forge.cipher.createCipher("AES-CTR", aesKey);
    cipher.start({ iv });
    cipher.update(
      forge.util.createBuffer(
        forge.util.encodeUtf8(JSON.stringify(requestData))
      )
    );
    cipher.finish();
    const encryptedData = Buffer2.concat([
      Buffer2.from(iv, "binary"),
      Buffer2.from(cipher.output.data, "binary")
    ]);
    const encryptedKey = forge.pki.publicKeyFromPem(forge.util.decode64(this.defaultPublicKey)).encrypt(forge.util.encode64(aesKey));
    return {
      d: encryptedData.toString("base64"),
      k: forge.util.encode64(encryptedKey)
    };
  }
  decryptResponse(response) {
    const { k, d } = response;
    const privateKey = forge.pki.privateKeyFromPem(this.clientPrivateKey);
    const aesKey = forge.util.decodeUtf8(
      privateKey.decrypt(forge.util.decode64(k))
    );
    const dataBuffer = Buffer2.from(d, "base64");
    const iv = dataBuffer.slice(0, 16);
    const encryptedData = dataBuffer.slice(16);
    const decipher = forge.cipher.createDecipher(
      "AES-CTR",
      Buffer2.from(aesKey, "base64").toString("binary")
    );
    decipher.start({ iv: iv.toString("binary") });
    decipher.update(forge.util.createBuffer(encryptedData));
    decipher.finish();
    return forge.util.decodeUtf8(decipher.output.data);
  }
  encryptDataText(text) {
    if (text) {
      return Buffer2.from(encodeURIComponent(text), "utf8").toString("base64").split("").reverse().join("");
    }
    return "";
  }
  decryptDataText(text) {
    if (text) {
      return decodeURIComponent(
        Buffer2.from(
          text.split("").reverse().join(""),
          "base64"
        ).toString("utf8")
      );
    }
    return "";
  }
  encryptPCI(data, publicKey) {
    if (!publicKey) {
      throw new Error("Error crypto: not have publickey");
    }
    if (!publicKey.includes("BEGIN PUBLIC KEY")) {
      publicKey = `-----BEGIN PUBLIC KEY-----
${publicKey}
-----END PUBLIC KEY-----`;
    }
    const encryptedData = forge.pki.publicKeyFromPem(publicKey).encrypt(data);
    return forge.util.encode64(encryptedData);
  }
  sha256(data) {
    const sha256 = forge.md.sha256.create();
    sha256.update(data);
    return sha256.digest().toHex();
  }
  generateKeyPCI() {
    const keyPair = forge.pki.rsa.generateKeyPair({
      bits: 1024,
      workers: 1
    });
    return {
      public: forge.pki.publicKeyToPem(keyPair.publicKey).replace(/(-|(BEGIN|END) PUBLIC KEY|\r|\n)/gi, ""),
      private: forge.pki.privateKeyToPem(keyPair.privateKey)
    };
  }
  decryptPCI(encryptedData, privateKey) {
    if (!privateKey) {
      throw new Error("Error crypto: not have privateKey");
    }
    if (!privateKey.includes("BEGIN RSA PRIVATE KEY")) {
      privateKey = `-----BEGIN RSA PRIVATE KEY-----
${privateKey}
-----END RSA PRIVATE KEY-----`;
    }
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const decodedData = forge.util.decode64(encryptedData);
    const decryptedData = privateKeyObj.decrypt(decodedData);
    return forge.util.decodeUtf8(decryptedData);
  }
  decryptLoginInsight(encryptedText, decryptInfo) {
    const { encryptInfo } = decryptInfo;
    const { encryptKey, encryptSalt } = encryptInfo;
    const key = forge.util.encodeUtf8(encryptKey);
    const decipher = forge.cipher.createDecipher("AES-CTR", key);
    const decodedText = forge.util.decode64(encryptedText);
    decipher.start({ iv: encryptSalt });
    decipher.update(forge.util.createBuffer(decodedText));
    decipher.finish();
    return forge.util.decodeUtf8(decipher.output.getBytes());
  }
  encryptInsightRequest(data, encryptInfo) {
    const { encryptKey, encryptSalt } = encryptInfo;
    if (!encryptKey) {
      throw new Error("No ssID value. Please login.");
    }
    const cipher = forge.cipher.createCipher(
      "AES-CTR",
      forge.util.encodeUtf8(encryptKey)
    );
    cipher.start({ iv: encryptSalt });
    cipher.update(
      forge.util.createBuffer(
        forge.util.encodeUtf8(JSON.stringify(data))
      )
    );
    cipher.finish();
    return forge.util.encode64(cipher.output.getBytes());
  }
  encryptUpload(data) {
    const aesKey = this.uploadAES;
    const hmacKey = this.uploadHMac;
    const iv = randomBytes2(16);
    const stringifiedData = JSON.stringify(data);
    const cipher = forge.cipher.createCipher(
      "AES-CTR",
      Buffer2.from(aesKey, "utf8").toString("binary")
    );
    cipher.start({ iv: iv.toString("hex") });
    cipher.update(
      forge.util.createBuffer(forge.util.encodeUtf8(stringifiedData))
    );
    cipher.finish();
    const encryptedData = Buffer2.concat([
      iv,
      Buffer2.from(cipher.output.data, "binary")
    ]);
    const timestamp = Date.now();
    const hmac = forge.hmac.create();
    hmac.start("sha256", hmacKey);
    hmac.update(encryptedData.toString("base64") + timestamp);
    const mac = Buffer2.from(hmac.getMac().data, "binary");
    return {
      timestamp,
      data: encodeURIComponent(encryptedData.toString("base64")),
      data_form: encryptedData.toString("base64"),
      mac: encodeURIComponent(mac.toString("base64")),
      mac_form: mac.toString("base64")
    };
  }
  decryptUpload(encryptedData) {
    const aesKey = this.uploadAES;
    const dataBuffer = Buffer2.from(encryptedData, "base64");
    const iv = dataBuffer.slice(0, 16);
    const encryptedContent = dataBuffer.slice(16);
    const decipher = forge.cipher.createDecipher(
      "AES-CTR",
      Buffer2.from(aesKey, "utf8").toString("binary")
    );
    decipher.start({ iv: iv.toString("binary") });
    decipher.update(forge.util.createBuffer(encryptedContent));
    decipher.finish();
    return forge.util.decodeUtf8(decipher.output.data);
  }
};

// src/Interface.ts
var ErrorCode = /* @__PURE__ */ ((ErrorCode2) => {
  ErrorCode2["INVALID_LOGIN_DATA"] = "3005";
  ErrorCode2["INVALID_CAPTCHA"] = "0111";
  ErrorCode2["NEW_BROWSER"] = "20231";
  ErrorCode2["USING_PHONE_VERIFY_REQUESTED"] = "0126";
  ErrorCode2["USING_PHONE_VERIFY_FAILED"] = "0101";
  ErrorCode2["DISABLE_WEB_LOGIN"] = "019";
  ErrorCode2["OK"] = "00";
  ErrorCode2["OTHER_DEVICES"] = "108";
  return ErrorCode2;
})(ErrorCode || {});

// src/Client.ts
var VCBRestClient = class {
  static {
    __name(this, "VCBRestClient");
  }
  jar = new CookieJar();
  cryptoService;
  client = wrapper(
    axios.create({
      jar: this.jar,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
        accept: "application/json, text/plain, */*",
        "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5",
        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "x-channel": "Web",
        Referer: "https://vcbdigibank.vietcombank.com.vn/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      }
    })
  );
  browserId;
  captchaToken = randomUUID();
  #username = "";
  #cif = "";
  #clientId = "";
  #mobileId = "";
  #sessionId = "";
  generateHeader() {
    const currentTime = String(Date.now());
    const randomValue = String(Math.floor(100 * Math.random()));
    const usernameCrc = crc.crc16(this.#username).toString(16);
    const requestID = `${currentTime}${randomValue}${usernameCrc}`;
    const sha256 = createHash2("sha256");
    const limID = sha256.update(this.#username + this.cryptoService.crcKey).digest("hex");
    return {
      "X-Lim-Id": limID,
      "X-Request-Id": requestID
    };
  }
  constructor(browserId) {
    if (browserId) {
      this.browserId = browserId;
    } else {
      throw new Error("INVALID_BROWSER_ID", {
        cause: `B\u1EA1n c\u1EA7n v\xE0o trang web ${WEB} \u0111\u1EC3 l\u1EA5y BrowserId`
      });
    }
  }
  postWithEncrypt(url, data) {
    return new Promise((resolve, reject) => {
      if (!this.cryptoService) {
        reject(
          new Error(
            "B\u1EA1n c\u1EA7n s\u1EED d\u1EE5ng VCBRestClient#init() tr\u01B0\u1EDBc ti\xEAn"
          )
        );
      }
      this.handlerAxiosRequest(
        this.client.post(url, this.cryptoService.encryptRequest(data), {
          headers: this.generateHeader()
        }),
        true,
        (data2) => JSON.parse(this.cryptoService.decryptResponse(data2))
      ).catch(reject).then((res) => {
        if (!res) {
          reject(new Error("INVALID_RESPONSE"));
        } else {
          resolve(res);
        }
      });
    });
  }
  login(username, password, captcha) {
    return new Promise((resolve, reject) => {
      this.#username = username;
      this.postWithEncrypt(
        "https://digiapp.vietcombank.com.vn" + Endpoints.LOGIN.prePoint + Endpoints.LOGIN.endPoint,
        {
          user: username,
          password,
          captchaValue: captcha,
          browserId: this.browserId,
          mid: Endpoints.LOGIN.mid,
          captchaToken: this.captchaToken,
          lang: "vi",
          E: null,
          sessionId: null,
          DT: "Windows",
          PM: "Chrome 127.0.0.0",
          OV: "10",
          appVersion: ""
        }
      ).catch(reject).then((res) => {
        if (res) {
          switch (res.code) {
            case "0111" /* INVALID_CAPTCHA */: {
              return reject(
                new Error("INVALID_CAPTCHA", {
                  cause: res.des
                })
              );
            }
            case "0101" /* USING_PHONE_VERIFY_FAILED */:
            case "0126" /* USING_PHONE_VERIFY_REQUESTED */: {
              return reject(
                new Error("CANNOT_LOGIN", {
                  cause: "B\u1EA1n c\u1EA7n t\u1EAFt t\xEDnh n\u0103ng X\xE1c th\u1EF1c \u0111\u0103ng nh\u1EADp VCB Digibank tr\xEAn WEB\nH\u01B0\u1EDBng d\u1EABn t\u1EAFt:\nC\xE0i \u0111\u1EB7t > Qu\u1EA3n l\xFD \u0111\u0103ng nh\u1EADp k\xEAnh > X\xE1c th\u1EF1c \u0111\u0103ng nh\u1EADp VCB Digibank tr\xEAn WEB"
                })
              );
            }
            case "019" /* DISABLE_WEB_LOGIN */: {
              return reject(
                new Error("DISABLE_WEB_LOGIN", {
                  cause: "B\u1EA1n \u0111\xE3 t\u1EAFt t\xEDnh n\u0103ng \u0111\u0103ng nh\u1EADp VCB Digibank tr\xEAn WEB\nH\u01B0\u1EDBng d\u1EABn b\u1EADt:\nC\xE0i \u0111\u1EB7t > Qu\u1EA3n l\xFD \u0111\u0103ng nh\u1EADp k\xEAnh > C\xE0i \u0111\u1EB7t \u0111\u0103ng nh\u1EADp VCB Digibank tr\xEAn WEB"
                })
              );
            }
            case "3005" /* INVALID_LOGIN_DATA */: {
              return reject(
                new Error("INVALID_LOGIN_DATA", {
                  cause: res.des
                })
              );
            }
            case "20231" /* NEW_BROWSER */: {
              return reject(
                new Error("NEW_BROWSER", {
                  cause: `B\u1EA1n h\xE3y s\u1EED d\u1EE5ng tr\xECnh duy\u1EC7t ch\xEDnh, \u0111\u0103ng nh\u1EADp v\xE0o Web (nh\u1EDB ch\u1ECDn l\u01B0u tr\xECnh duy\u1EC7t), sau \u0111\xF3 v\xE0o web ${WEB} \u0111\u1EC3 l\u1EA5y BrowserId.
R\u1ED3i b\u1EA1n h\xE3y s\u1EED d\u1EE5ng BrowserId \u0111\xF3 v\u1EDBi th\u01B0 vi\u1EC7n
new VCBRestClient('<browserId c\xF3 \u0111\u01B0\u1EE3c \u1EDF b\u01B0\u1EDBc tr\u01B0\u1EDBc \u0111\xF3>');`
                })
              );
            }
            case "00" /* OK */: {
              this.#cif = res.userInfo.cif;
              this.#clientId = res.userInfo.clientId;
              this.#sessionId = res.userInfo.sessionId;
              this.#mobileId = res.userInfo.mobileId;
              return resolve(res);
            }
            default: {
              return reject(
                new Error("UNKNOWN_ERROR", {
                  cause: res
                })
              );
            }
          }
        }
      });
    });
  }
  getAllAccount() {
    return new Promise((resolve, reject) => {
      this.postWithEncrypt(
        "https://digiapp.vietcombank.com.vn" + Endpoints.GET_LIST_ACCOUNT_VIA_CIF.prePoint + Endpoints.GET_LIST_ACCOUNT_VIA_CIF.endPoint,
        {
          mid: Endpoints.GET_LIST_ACCOUNT_VIA_CIF.mid,
          lang: "vi",
          user: this.#username,
          cif: this.#cif,
          mobileId: this.#mobileId,
          clientId: this.#clientId,
          browserId: this.browserId,
          E: null,
          sessionId: this.#sessionId,
          DT: "Windows",
          PM: "Chrome 127.0.0.0",
          OV: "10",
          appVersion: ""
        }
      ).catch(reject).then((res) => {
        if (!res) {
          reject(new Error("INVALID_RESPONSE"));
        } else if (res.code !== "00" /* OK */) {
          reject(
            new Error("INVALID_RESPONSE", {
              cause: res
            })
          );
        } else {
          resolve(res);
        }
      });
    });
  }
  getAccountDetail(accountNo, accountType = "D") {
    return new Promise((resolve, reject) => {
      this.postWithEncrypt(
        "https://digiapp.vietcombank.com.vn" + Endpoints.ACCOUNT_DETAIL.prePoint + Endpoints.ACCOUNT_DETAIL.endPoint,
        {
          mid: Endpoints.ACCOUNT_DETAIL.mid,
          lang: "vi",
          user: this.#username,
          cif: this.#cif,
          mobileId: this.#mobileId,
          clientId: this.#clientId,
          browserId: this.browserId,
          E: null,
          sessionId: this.#sessionId,
          DT: "Windows",
          PM: "Chrome 127.0.0.0",
          OV: "10",
          appVersion: "",
          accountNo,
          accountType
        }
      ).catch(reject).then((res) => {
        if (!res) {
          reject(new Error("INVALID_RESPONSE"));
        } else if (res.code !== "00" /* OK */) {
          reject(
            new Error("INVALID_RESPONSE", {
              cause: res
            })
          );
        } else {
          resolve(res);
        }
      });
    });
  }
  getTransactionsHistory(accountNo, accountType = "D", fromDate, toDate = /* @__PURE__ */ new Date()) {
    return new Promise(
      (resolve, reject) => {
        if (fromDate.getTime() > toDate.getTime()) {
          reject(
            new Error("INVALID_DATE", {
              cause: "fromDate l\u1EDBn h\u01A1n toDate"
            })
          );
        }
        this.postWithEncrypt(
          "https://digiapp.vietcombank.com.vn" + Endpoints.TRANSACTION_HISTORY.prePoint + Endpoints.TRANSACTION_HISTORY.endPoint,
          {
            accountNo,
            accountType,
            fromDate: moment(fromDate).format("DD/MM/YYYY"),
            toDate: moment(toDate).format("DD/MM/YYYY"),
            pageIndex: 0,
            lengthInPage: 999999,
            mid: Endpoints.TRANSACTION_HISTORY.mid,
            lang: "vi",
            user: this.#username,
            cif: this.#cif,
            mobileId: this.#mobileId,
            clientId: this.#clientId,
            browserId: this.browserId,
            E: null,
            sessionId: this.#sessionId,
            DT: "Windows",
            PM: "Chrome 127.0.0.0",
            OV: "10",
            appVersion: ""
          }
        ).catch(reject).then((res) => {
          if (!res) {
            reject(new Error("INVALID_RESPONSE"));
          } else if (res.code !== "00" /* OK */) {
            reject(
              new Error("INVALID_RESPONSE", {
                cause: res
              })
            );
          } else {
            resolve(res);
          }
        });
      }
    );
  }
  getExcelTransactionsHistory(accountNo, accountType = "D", fromDate, toDate = /* @__PURE__ */ new Date()) {
    return new Promise((resolve, reject) => {
      if (fromDate.getTime() > toDate.getTime()) {
        reject(
          new Error("INVALID_DATE", {
            cause: "fromDate l\u1EDBn h\u01A1n toDate"
          })
        );
      }
      this.handlerAxiosRequest(
        this.client.post(
          "https://digiapp.vietcombank.com.vn" + Endpoints.EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL.prePoint + Endpoints.EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL.endPoint,
          this.cryptoService.encryptRequest({
            accountName: "",
            accountCcy: "VND",
            accountNo,
            accountType,
            fromDate: moment(fromDate).format("DD/MM/YYYY"),
            toDate: moment(toDate).format("DD/MM/YYYY"),
            pageIndex: 0,
            lengthInPage: 999999,
            stmtDate: "",
            stmtType: "",
            cumulativeBalance: "",
            lang: "vi",
            mid: Endpoints.EXPORT_HIS_STATEMENT_ACCOUNT_EXCEL.mid,
            user: this.#username,
            cif: this.#cif,
            mobileId: this.#mobileId,
            clientId: this.#clientId,
            browserId: this.browserId,
            E: null,
            sessionId: this.#sessionId,
            DT: "Windows",
            PM: "Chrome 127.0.0.0",
            OV: "10",
            appVersion: ""
          }),
          {
            responseType: "arraybuffer"
          }
        ),
        true
      ).catch(reject).then((res) => {
        if (!res) {
          reject(new Error("INVALID_RESPONSE"));
        } else {
          resolve({
            name: "lich-su-giao-dich-tai-khoan.xlsx",
            data: res
          });
        }
      });
    });
  }
  getCaptcha() {
    return this.handlerAxiosRequest(
      this.client.get(
        "https://digiapp.vietcombank.com.vn/utility-service/v2/captcha/MASS/" + this.captchaToken,
        {
          responseType: "arraybuffer"
        }
      ),
      true,
      (data) => Buffer.from(data)
    );
  }
  async init() {
    const mainJS = await Util.findMainJS();
    if (!mainJS) {
      throw new Error(
        "Kh\xF4ng t\xECm th\u1EA5y script main.{\\w+}.js (C\xF3 l\u1EBD \u0111\xE2y l\xE0 m\u1ED9t l\u1ED7i, h\xE3y b\xE1o c\xE1o cho Ellie)"
      );
    }
    const jsText = await (await fetch(mainJS)).text();
    this.cryptoService = new VCBCryptoManager(jsText);
  }
  handlerAxiosRequest(request, resolveResult = true, functionConvertResult) {
    return new Promise((resolve, reject) => {
      request.then((res) => {
        resolve(
          resolveResult ? typeof functionConvertResult == "function" ? functionConvertResult(res.data) : res.data : res
        );
      }).catch((error) => {
        if (axios.isAxiosError(error)) {
          reject({
            message: error.message,
            request: error.request,
            response: error.response
          });
        } else {
          reject(error);
        }
      });
    });
  }
};
export {
  Endpoints,
  ErrorCode,
  Util,
  VCBCryptoManager,
  VCBRestClient,
  WEB
};
//# sourceMappingURL=index.js.map