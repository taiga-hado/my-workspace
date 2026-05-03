import 'dotenv/config';
import { refreshLongLivedToken } from '../lib/instagram.js';

const tokenOnly = process.argv.includes('--token-only');

try {
  const result = await refreshLongLivedToken();
  if (tokenOnly) {
    process.stdout.write(result.access_token);
    process.exit(0);
  }
  const days = Math.round(result.expires_in / 86400);
  console.log('✅ Token refreshed');
  console.log(`   Expires in: ${result.expires_in}s (~${days} days)\n`);
  console.log('🔑 Replace INSTAGRAM_ACCESS_TOKEN in .env with the token below:\n');
  console.log(result.access_token);
} catch (err) {
  if (tokenOnly) {
    process.stderr.write(`Refresh failed: ${err.message}\n`);
  } else {
    console.error('❌ Refresh failed:');
    console.error(err.message);
  }
  process.exit(1);
}
