import 'dotenv/config';
import { refreshLongLivedToken } from '../lib/instagram.js';

try {
  const result = await refreshLongLivedToken();
  const days = Math.round(result.expires_in / 86400);
  console.log('✅ Token refreshed');
  console.log(`   Expires in: ${result.expires_in}s (~${days} days)\n`);
  console.log('🔑 Replace INSTAGRAM_ACCESS_TOKEN in .env with the token below:\n');
  console.log(result.access_token);
} catch (err) {
  console.error('❌ Refresh failed:');
  console.error(err.message);
  process.exit(1);
}
