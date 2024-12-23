import { V3 } from 'paseto';
import { randomBytes } from 'crypto';

(async () => {
  console.log('Paseto JWT Secret Key:', await V3.generateKey('local', { format: 'paserk' }));
  console.log('Session Secret Key:', randomBytes(32).toString('hex'));
})();
