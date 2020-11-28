# Kakao QR

## 🔅 Kakaotalk QR | Make KakaoTalk QR check-in easy.

You can get KakaoTalk QR directly without accessing the website.

If there is any copyright or license violation of the software, please send it to iam@dan.al.

**⚠️ Warning:** This is an experimental software. It is not recommended to use in actual use. We are not responsible for any problems.

**Table of Contents**

- [How does it work?](#how-does-it-work)
- [Setup](#setup)
- [Usage](#usage)
- [License](#license)

## How does it work?

---

After logging in via email or password, the QR information issued by KakaoTalk is retrieved and data is returned.

## Setup

Create docker-compose.yml file and write as below.

```yml
version: '3.0'
services:
  kakao-qr:
    image: danieluhm2004/kakao-qr:latest
    ports:
      - '3000:3000'
    restart: always
    environment:
      PORT: 3000
      CACHING: 'true'
      SECRET_KEY: this_is_secret_key
```

Make sure to change the secret key.

## Usage

---

Please register and use the shortcuts below.
https://www.icloud.com/shortcuts/4f04af7ef29648ddbc4ea420a811f098

## License

[MIT](LICENSE)

Copyright (c) 2020 [Daniel Uhm](htts://github.com/danieluhm2004).
