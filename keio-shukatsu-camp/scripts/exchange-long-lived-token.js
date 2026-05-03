import 'dotenv/config';
import { exchangeLongLivedToken } from '../lib/instagram.js';

const shortToken = process.argv[2] || process.env.INSTAGRAM_ACCESS_TOKEN;
if (!shortToken) {
  console.error('Usage: node scripts/exchange-long-lived-token.js [short-token]');
  console.error('       (falls back to INSTAGRAM_ACCESS_TOKEN in .env)');
  process.exit(1);
}

try {
  const result = await exchangeLongLivedToken(shortToken);
  const days = Math.round(result.expires_in / 86400);
  console.log('✅ Long-lived token exchange successful');
  console.log(`   Expires in: ${result.expires_in}s (~${days} days)\n`);
  console.log('🔑 Replace INSTAGRAM_ACCESS_TOKEN in .env with the token below:\n');
  console.log(result.access_token);
} catch (err) {
  console.error('❌ Exchange failed:');
  console.error(err.message);
  process.exit(1);
}
