import APIError from '../tools/error';
import Account from './account';
import logger from '../tools/logger';

export default class Checkin {
  private account: Account;
  private token?: string;

  public constructor(account: Account) {
    this.account = account;
  }

  public async getToken(): Promise<string> {
    await this.account.login();

    const res = await this.account.got({
      method: 'GET',
      url: 'https://accounts.kakao.com/qr_check_in',
    });

    const token = res.body.match(/\"token\":"(.*?)\"/);
    if (!token || token.length <= 0) {
      const message = `The ${this.account.email} account has never been verified. Please proceed after authentication.`;
      logger.warn(message);
      throw new APIError(message);
    }

    this.token = token[1];
    return this.token;
  }

  public async getQR(): Promise<string> {
    if (!this.token) {
      await this.getToken();
    }

    const res = await this.account
      .got({
        url: 'https://accounts.kakao.com/qr_check_in/request_qr_data.json',
        searchParams: {
          lang: 'ko',
          os: 'ios',
          webview_v: 2,
          is_under_age: false,
          token: this.token,
        },
      })
      .json<{ status: number; qr_data: string }>();

    if (res.status !== 0) {
      const message = `Can not take all the information about the QR from ${this.account.email}.`;
      logger.warn(message);
      throw new APIError(message);
    }

    logger.info(`QR information for ${this.account.email} was returned.`);
    return res.qr_data;
  }
}
