/**
 * PUBLIC_INTERFACE
 * Fetch live product info for Amazon via backend proxy.
 * Sanitized response: { title, image, price, url, provider }
 * Throws an Error on failure, network problems, or malformed data for graceful user handling.
 */
export async function fetchAmazonProduct(keywords) {
  // Only resolve proxy at build-time for safe injection, never at browser runtime
  const proxy = process.env.REACT_APP_PRODUCT_BACKEND_PROXY || "http://localhost:5001";
  let resp = null;
  try {
    resp = await fetch(`${proxy}/amazon-product?keywords=${encodeURIComponent(keywords)}`);
  } catch (err) {
    throw new Error("Could not connect to backend proxy: " + (err?.message || "Network error"));
  }
  let data = null;
  try {
    if (!resp.ok) {
      // Try to parse backend error message
      let errText = "Unknown";
      try {
        const errJson = await resp.json();
        errText = (errJson && errJson.error) ? errJson.error : resp.statusText;
      } catch {
        errText = resp.statusText || "Unknown error";
      }
      throw new Error("Backend lookup failed: " + errText);
    }
    data = await resp.json();
  } catch (err) {
    throw new Error("Invalid backend response: " + (err && err.message ? err.message : "Malformed JSON"));
  }
  // Always only use sanitized outgoing fields (never trust anything extra)
  if (!data || !data.title || !data.url) {
    throw new Error("No product found (empty or incomplete product data returned)");
  }
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
 * Throws an Error on failure, network problems, or malformed data.
 */
export async function fetchFlipkartProduct(keywords) {
  // Only resolve proxy at build-time for safe injection, never at browser runtime
  const proxy = process.env.REACT_APP_PRODUCT_BACKEND_PROXY || "http://localhost:5001";
  let resp = null;
  try {
    resp = await fetch(`${proxy}/flipkart-product?keywords=${encodeURIComponent(keywords)}`);
  } catch (err) {
    throw new Error("Could not connect to backend proxy: " + (err?.message || "Network error"));
  }
  let data = null;
  try {
    if (!resp.ok) {
      let errText = "Unknown";
      try {
        const errJson = await resp.json();
        errText = (errJson && errJson.error) ? errJson.error : resp.statusText;
      } catch {
        errText = resp.statusText || "Unknown error";
      }
      throw new Error("Backend lookup failed: " + errText);
    }
    data = await resp.json();
  } catch (err) {
    throw new Error("Invalid backend response: " + (err && err.message ? err.message : "Malformed JSON"));
  }
  if (!data || !data.title || !data.url) {
    throw new Error("No product found (empty or incomplete product data returned)");
  }
  return {
    name: data.title,
    image: data.image,
    price: typeof data.price === "number" ? data.price : null,
    url: data.url,
    provider: data.provider || "Flipkart"
  };
}
