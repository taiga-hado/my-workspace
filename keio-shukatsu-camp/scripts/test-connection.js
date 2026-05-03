import { getMe } from '../lib/instagram.js';

try {
  const me = await getMe();
  console.log('✅ Instagram API connection successful\n');
  console.log(`   ID:           ${me.id}`);
  console.log(`   Username:     ${me.username}`);
  console.log(`   Account type: ${me.account_type}`);
  console.log(`   Media count:  ${me.media_count}`);
  console.log('\nNote: copy this ID into INSTAGRAM_BUSINESS_ACCOUNT_ID in .env');
} catch (err) {
  console.error('❌ Connection failed:');
  console.error(err.message);
  process.exit(1);
}
