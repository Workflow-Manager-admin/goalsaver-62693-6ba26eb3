//
// Utility for fetching live product data from Amazon and Flipkart APIs
// All API credentials (keys/tokens) are loaded securely from environment variables
// Required: Setup a .env file with appropriate API keys and secrets.
//

// PUBLIC_INTERFACE
/**
 * Fetches product info from Amazon Product Advertising API (v5).
 * @param {string} keywords - Product search keywords, e.g., "Headphones"
 * @returns {Promise<{title: string, image: string, price: number, url: string}|null>}
 */
export async function fetchAmazonProduct(keywords) {
  const accessKey = process.env.REACT_APP_AMAZON_ACCESS_KEY;
  const secretKey = process.env.REACT_APP_AMAZON_SECRET_KEY;
  const associateTag = process.env.REACT_APP_AMAZON_ASSOCIATE_TAG;
  // The Product Advertising API needs signed requests - so the secure way is proxying via a backend.
  // Here we call a proxy endpoint (.env must have REACT_APP_AZON_BACKEND_PROXY)
  const proxy = process.env.REACT_APP_AZON_BACKEND_PROXY;
  if (!accessKey || !secretKey || !associateTag || !proxy)
    throw new Error("Amazon credentials are not configured");
  // Frontend cannot safely hold secrets for Amazon PA API (HMAC-SHA256). Instead, call backend.
  const response = await fetch(
    `${proxy}/amazon-product?keywords=${encodeURIComponent(keywords)}`
  );
  if (!response.ok) return null;
  const data = await response.json();
  if (!data || !data.title) return null;
  // Sample response format: { title, image, price, url }
  return data;
}

// PUBLIC_INTERFACE
/**
 * Fetches product info from Flipkart Product Search API (via Affiliate API).
 * @param {string} keywords - Product search keywords.
 * @returns {Promise<{title: string, image: string, price: number, url: string}|null>}
 */
export async function fetchFlipkartProduct(keywords) {
  // Flipkart Affiliate API is best accessed via a backend proxy too, avoid exposing tokens.
  const affiliateId = process.env.REACT_APP_FLIPKART_AFF_ID;
  const affiliateToken = process.env.REACT_APP_FLIPKART_AFF_TOKEN;
  const proxy = process.env.REACT_APP_AZON_BACKEND_PROXY;
  if (!affiliateId || !affiliateToken || !proxy)
    throw new Error("Flipkart credentials are not configured");
  const response = await fetch(
    `${proxy}/flipkart-product?keywords=${encodeURIComponent(keywords)}`
  );
  if (!response.ok) return null;
  const data = await response.json();
  if (!data || !data.title) return null;
  return data;
}
