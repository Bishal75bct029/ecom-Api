import { V3 } from 'paseto';

(async () => {
  const keys = await Promise.all([
    V3.generateKey('local', { format: 'paserk' }),
    V3.generateKey('local', { format: 'paserk' }),
  ]);
  console.log('Admin Keys:', keys[0]);
  console.log('Api Keys:', keys[1]);
})();
