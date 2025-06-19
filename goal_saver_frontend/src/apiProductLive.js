/**
 * PUBLIC_INTERFACE
 * Fetch live product info for Amazon via backend proxy.
 * Sanitized response: { title, image, price, url, provider }
 */
export async function fetchAmazonProduct(keywords) {
  const proxy = process.env.REACT_APP_PRODUCT_BACKEND_PROXY || "http://localhost:5001";
  const resp = await fetch(`${proxy}/amazon-product?keywords=${encodeURIComponent(keywords)}`);
  if (!resp.ok) return null;
  const data = await resp.json();
  // Always only use sanitized outgoing fields (never trust anything extra)
  if (!data || !data.title || !data.url) return null;
  return {
    name: data.title,
    image: data.image,
    price: typeof data.price === "number" ? data.price : null,
    url: data.url,
    provider: data.provider || "Amazon"
  };
}

/**
 * PUBLIC_INTERFACE
 * Fetch live product info for Flipkart via backend proxy.
 * Sanitized response: { title, image, price, url, provider }
 */
export async function fetchFlipkartProduct(keywords) {
  const proxy = process.env.REACT_APP_PRODUCT_BACKEND_PROXY || "http://localhost:5001";
  const resp = await fetch(`${proxy}/flipkart-product?keywords=${encodeURIComponent(keywords)}`);
  if (!resp.ok) return null;
  const data = await resp.json();
  if (!data || !data.title || !data.url) return null;
  return {
    name: data.title,
    image: data.image,
    price: typeof data.price === "number" ? data.price : null,
    url: data.url,
    provider: data.provider || "Flipkart"
  };
}
