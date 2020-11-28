import APIError from './tools/error';
import Account from './controllers/account';
import AsyncWrapper from './tools/wrapper';
import Checkin from './controllers/checkin';
import dotenv from 'dotenv';
import express from 'express';
import logger from './tools/logger';
import morgan from 'morgan';
if (process.env.NODE_ENV === 'development') dotenv.config();

if (!process.env.SECRET_KEY) {
  logger.warn(
    'It is working without a secret key. It is recommended to set a secret key.'
  );
}

const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan('combined', {
    stream: {
      write: (meta: any) => {
        logger.info(meta.trim());
      },
    },
  })
);

app.post(
  '/',
  AsyncWrapper(async (req, res) => {
    const { email, password, secretKey } = req.body;
    if (!email || !password) {
      throw new APIError('Please enter both your email and password.');
    }

    if (process.env.SECRET_KEY && process.env.SECRET_KEY !== secretKey) {
      throw new APIError('The secret key is incorrect.');
    }

    const account = new Account(email, password);
    const checkin = new Checkin(account);
    const qr = await checkin.getQR();

    res.status(200).send(qr);
  })
);

app.listen(process.env.PORT || 3000, () => {
  const address = `http://localhost:${process.env.PORT || 3000}`;
  logger.info(
    `The server is successfully ready. You can access it at ${address}.`
  );
});
