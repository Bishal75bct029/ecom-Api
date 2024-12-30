import { SessionOptions } from 'express-session';
import { envConfig } from './envConfig';
import { SESSION_COOKIE_NAME } from '@/app.constants';

export const sessionConfig: SessionOptions = {
  secret: envConfig.SESSION_SECRET,
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    maxAge: 86400 * 1000, // 1-day cookie expiration
    path: '/',
  },
  name: SESSION_COOKIE_NAME,
};
