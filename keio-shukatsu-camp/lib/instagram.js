import 'dotenv/config';

const BASE = 'https://graph.instagram.com/v22.0';

async function get(path, params = {}, token = process.env.INSTAGRAM_ACCESS_TOKEN) {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('access_token', token);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(`Instagram API GET ${path} failed: ${JSON.stringify(data)}`);
  return data;
}

async function post(path, body = {}, token = process.env.INSTAGRAM_ACCESS_TOKEN) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('access_token', token);
  for (const [k, v] of Object.entries(body)) url.searchParams.set(k, v);
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(`Instagram API POST ${path} failed: ${JSON.stringify(data)}`);
  return data;
}

export async function getMe() {
  return get('/me', { fields: 'id,username,account_type,media_count' });
}

export async function exchangeLongLivedToken(shortToken) {
  const url = new URL(`${BASE}/access_token`);
  url.searchParams.set('grant_type', 'ig_exchange_token');
  url.searchParams.set('client_secret', process.env.META_APP_SECRET);
  url.searchParams.set('access_token', shortToken);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data;
}

export async function refreshLongLivedToken(longToken = process.env.INSTAGRAM_ACCESS_TOKEN) {
  const url = new URL(`${BASE}/refresh_access_token`);
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', longToken);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  return data;
}

export async function createMediaContainer({ imageUrl, caption, igUserId }) {
  const userId = igUserId || (await getMe()).id;
  return post(`/${userId}/media`, { image_url: imageUrl, caption });
}

export async function publishMediaContainer({ creationId, igUserId }) {
  const userId = igUserId || (await getMe()).id;
  return post(`/${userId}/media_publish`, { creation_id: creationId });
}

export async function postSingleImage({ imageUrl, caption }) {
  const me = await getMe();
  const container = await createMediaContainer({ imageUrl, caption, igUserId: me.id });
  await new Promise((r) => setTimeout(r, 3000));
  return publishMediaContainer({ creationId: container.id, igUserId: me.id });
}

export async function createCarouselItem({ imageUrl, igUserId }) {
  const userId = igUserId || (await getMe()).id;
  return post(`/${userId}/media`, {
    image_url: imageUrl,
    is_carousel_item: 'true',
  });
}

export async function createCarouselContainer({ children, caption, igUserId }) {
  const userId = igUserId || (await getMe()).id;
  return post(`/${userId}/media`, {
    media_type: 'CAROUSEL',
    children: children.join(','),
    caption,
  });
}

export async function postCarousel({ imageUrls, caption }) {
  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error(`Carousel needs 2-10 images, got ${imageUrls.length}`);
  }
  const me = await getMe();
  const items = [];
  for (const url of imageUrls) {
    const item = await createCarouselItem({ imageUrl: url, igUserId: me.id });
    items.push(item.id);
  }
  const parent = await createCarouselContainer({
    children: items,
    caption,
    igUserId: me.id,
  });
  await new Promise((r) => setTimeout(r, 5000));
  return publishMediaContainer({ creationId: parent.id, igUserId: me.id });
}
