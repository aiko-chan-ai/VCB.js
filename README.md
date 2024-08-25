# VCB.js

> [!IMPORTANT]
> The entire README is written in Vietnamese.

## Giới thiệu

Thư viện không chính thức tương tác với một số API của Vietcombank.

> [!CAUTION]
> Việc sử dụng thư viện này có thể trái với quy định của Vietcombank và có thể dẫn tới việc bị vô hiệu hóa tài khoản hoặc tương tự. Tôi (Chúng tôi) không chịu trách nhiệm nếu việc trên xảy ra.

> [!WARNING]
> Thư viện sử dụng ESM, không hỗ trợ CommonJS

## Yêu cầu

- Node.js v20+
- Cài đặt thư viện này
```sh
npm install https://github.com/aiko-chan-ai/VCB.js.git
```

## Chuẩn bị

1. Đầu tiên, bạn cần đăng nhập Vietcombank trên Web, chọn nhớ trình duyệt.
2. Sau đó, bạn vào trang [VCB.js](https://aiko-chan-ai.github.io/VCB.js) để lấy BrowserId (rất cần thiết).

> [!NOTE]
> BrowserId là một chuỗi giống MD5 được tạo bởi thư viện FingerprintJS

## Sử dụng cơ bản

> [!TIP]
> Tất cả ví dụ đều có trong thư mục `test`

### Import thư viện

> [!TIP]
> Có ở trong `test/login.ts`

```typescript
import fs from 'fs';
import * as readline from 'readline';

import { VCBRestClient } from 'vcb.js';

// BrowserID là md5 của fingerprintJS (visitorId)
// Nếu có browserId thì sẽ không cần xác thực OTP
// Vào trang web https://aiko-chan-ai.github.io/VCB.js/ để lấy browserId
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
```

### Lấy tất cả tài khoản
```ts
await client.getAllAccount()
```

### Lấy tài khoản chỉ định
```ts

const allAccount = await client.getAllAccount();

await client.getAccountDetail(
	allAccount.DDAccounts[0].accountNo,
	allAccount.DDAccounts[0].accountType,
)

```

### Lấy lịch sử giao dịch
```ts
const allAccount = await client.getAllAccount();

const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

// Lấy lịch sử từ 7 ngày trước đến hiện tại
await client.getTransactionsHistory(
	allAccount.DDAccounts[0].accountNo,
	allAccount.DDAccounts[0].accountType,
    startDate,
)
```

### Lấy lịch sử giao dịch nhưng là file Excel
```ts
const allAccount = await client.getAllAccount();

const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

const excelData = await client.getExcelTransactionsHistory(
	allAccount.DDAccounts[0].accountNo,
	allAccount.DDAccounts[0].accountType,
	startDate,
);

// Ghi sao kê ra tệp Excel (mặc định là lich-su-giao-dich-tai-khoan.xlsx)
fs.writeFileSync(excelData.name, excelData.data);
```