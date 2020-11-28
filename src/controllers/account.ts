import got, { Got } from 'got';

import { CookieJar } from 'tough-cookie';
import { FileCookieStore } from 'tough-cookie-file-store';
import cheerio from 'cheerio';
import cryptojs from 'crypto-js';
import { mkdirSync } from 'fs';

export default class Account {
  private email: string;
  private password: string;
  private cachingKey?: string;
  private cookieJar: CookieJar;
  public got: Got;

  public constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.cookieJar = new CookieJar();

    if (Account.hasCaching()) {
      const path = this.getCachePath();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileStore: any = new FileCookieStore(path);
      this.cookieJar = new CookieJar(fileStore);
    }

    this.got = got.extend({
      cookieJar: this.cookieJar,
      headers: {
        'Accept-Language': 'ko-kr',
        'User-Agent':
          'Moztilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 9.1.1',
      },
    });
  }

  public async login(): Promise<void> {
    const logined = await this.isLogined();
    if (logined) return;

    const { csrf, key } = await this.getCSRFAndKeyForLogin();
    const email = this.encryptAES(this.email, key);
    const password = this.encryptAES(this.password, key);

    await this.track({
      sdk: { type: 'WEB', version: '1.1.9' },
      env: { screen: '414X736', tz: '+9', cke: 'Y' },
      common: {
        svcdomain: 'accounts.kakao.com',
        deployment: 'production',
        url: 'https://accounts.kakao.com/login',
        referrer: 'https://accounts.kakao.com/',
        title: '카카오계정',
        section: 'login',
        page: 'pageLogin',
      },
      action: { type: 'Pageview', name: 'pageLogin', kind: '' },
    });

    const res = await this.got({
      method: 'POST',
      url: 'https://accounts.kakao.com/weblogin/authenticate.json',
      headers: {
        Referer:
          'https://accounts.kakao.com/login?continue=https%3A%2F%2Faccounts.kakao.com%2Fweblogin%2Faccount',
      },
      form: {
        os: 'ios',
        webview_v: '2',
        email,
        password,
        stay_signed_in: true,
        continue: 'https://accounts.kakao.com/weblogin/account',
        third: false,
        k: true,
        authenticity_token: csrf,
      },
    }).json<{ status: number }>();

    if (res.status !== 0) {
      throw new Error('Cannot login kakao account');
    }
  }

  public async isLogined(): Promise<boolean> {
    const res = await this.got({
      method: 'GET',
      url: 'https://accounts.kakao.com/weblogin/account/info',
      followRedirect: false,
    });

    return res.statusCode === 200;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async track(params: any): Promise<void> {
    await this.got({
      method: 'GET',
      url: 'https://stat.tiara.kakao.com/track',
      headers: { Referer: params.common.referrer },
      searchParams: { d: JSON.stringify(params) },
    });
  }

  private async getCSRFAndKeyForLogin() {
    const res = await this.got({
      method: 'GET',
      url: 'https://accounts.kakao.com/login',
      searchParams: {
        continue: 'https://accounts.kakao.com/weblogin/account',
      },
      headers: {
        Referer:
          'https://accounts.kakao.com/logout?continue=https://accounts.kakao.com/weblogin/account',
      },
    });

    const $ = cheerio.load(res.body);
    const csrf = $('meta[name="csrf-token"]').attr('content');
    const key = $('input[name="p"]').attr('value');

    if (!csrf || !key) {
      throw new Error('Cannot find CSRF And Key');
    }

    return { csrf, key };
  }

  private encryptAES(message: string, key: string) {
    return cryptojs.AES.encrypt(message, key).toString();
  }

  private getCachingKey() {
    if (this.cachingKey) return this.cachingKey;
    const { email, password } = this;
    const contents = JSON.stringify({ email, password });
    this.cachingKey = cryptojs.SHA256(contents).toString(cryptojs.enc.Hex);
    return this.cachingKey;
  }

  private getCachePath() {
    const basicPath = './.caches';
    mkdirSync(basicPath, { recursive: true });
    return `${basicPath}/${this.getCachingKey()}`;
  }

  public static hasCaching(): boolean {
    return process.env.ACCOUNT_CACHING === 'true';
  }
}
