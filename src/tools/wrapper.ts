import { NextFunction, Request, Response } from 'express';

import APIError from './error';

export default function AsyncWrapper(
  cb: (req: Request, res: Response, next: any) => Promise<any>
): any {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await cb(req, res, next);
    } catch (err) {
      let message = 'An unknown error has occurred';
      if (err instanceof APIError) {
        message = err.message;
      }

      res.status(500).json({ message });
    }
  };
}
