import { SessionOptions } from 'express-session';
import { envConfig } from './envConfig';

export const sessionConfig: SessionOptions = {
  secret: envConfig.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    maxAge: 86400 * 1000, // 1-day cookie expiration
    sameSite: 'none', // Helps mitigate CSRF attacks
    path: '/',
  },
};
