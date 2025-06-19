// Utility for fetching live product data from Amazon and Flipkart APIs
// Now securely routed through backend proxy endpoints.
// Required: Frontend .env must have REACT_APP_PRODUCT_BACKEND_PROXY set to backend proxy server (e.g. http://localhost:5001).

// PUBLIC_INTERFACE
/**
 * Fetch product info from the backend proxy for Amazon.
 * Calls: /amazon-product?keywords=...
 * Returns: { name, image, price, url, provider }
 */
export async function fetchAmazonProduct(keywords) {
  const proxy = process.env.REACT_APP_PRODUCT_BACKEND_PROXY || "http://localhost:5001";
  const resp = await fetch(
    `${proxy}/amazon-product?keywords=${encodeURIComponent(keywords)}`
  );
  if (!resp.ok) return null;
  const data = await resp.json();
  // Proxy server returns { title, image, price, url, provider }
  if (!data || !data.title) return null;
  return {
    name: data.title,
    image: data.image,
    price: data.price,
    url: data.url,
    provider: data.provider || "Amazon"
  };
}

/**
 * Fetches product info from the backend proxy for Flipkart.
 * Calls: /flipkart-product?keywords=...
 * Returns: { name, image, price, url, provider }
 */
export async function fetchFlipkartProduct(keywords) {
  const proxy = process.env.REACT_APP_PRODUCT_BACKEND_PROXY || "http://localhost:5001";
  const resp = await fetch(
    `${proxy}/flipkart-product?keywords=${encodeURIComponent(keywords)}`
  );
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data || !data.title) return null;
  return {
    name: data.title,
    image: data.image,
    price: data.price,
    url: data.url,
    provider: data.provider || "Flipkart"
  };
}
