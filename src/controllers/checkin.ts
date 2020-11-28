import Account from './account';

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
      throw new Error('First phone number verification is required');
    }

    this.token = token[1];
    return this.token;
  }

  public async getQR(): Promise<string> {
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
      throw new Error('Cannot get QR Image');
    }

    return res.qr_data;
  }
}
