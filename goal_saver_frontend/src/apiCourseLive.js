//
// Utility for fetching live course listings from Coursera, Udemy, and Skillshare APIs
// All API credentials are loaded securely from environment variables
// For APIs with secret tokens, it's recommended to use a backend proxy service.
//

// PUBLIC_INTERFACE
/**
 * Fetches live courses from Coursera API for financial/goal-planning topics.
 * If a backend proxy is configured via REACT_APP_COURSERA_PROXY, uses it; else, calls public API (limited).
 * @param {string} query - Course topic keywords (e.g., "financial literacy")
 * @returns {Promise<Array<{title: string, image: string, price: string | null, url: string, description: string, provider: string}>>}
 */
export async function fetchCourseraCourses(query) {
  // Prefer proxy if provided (as CORS may block direct call)
  // Only access REACT_APP_ variables that are statically inlined at build time
  const proxy = process.env.REACT_APP_COURSERA_PROXY;
  const apiKey = process.env.REACT_APP_COURSERA_API_KEY;
  let url = "";
  if (proxy) {
    url = `${proxy}/coursera-courses?search=${encodeURIComponent(query)}`;
  } else {
    // Basic public search, without auth (limits apply)
    url = `https://api.coursera.org/api/courses.v1?q=search&query=${encodeURIComponent(query)}&fields=photoUrl,slug,shortDescription`;
  }
  const headers = {};
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const resp = await fetch(url, { headers });
  if (!resp.ok) return [];
  const data = await resp.json();

  // If using proxy, expect [{title, image, price, url, description, provider}]
  if (Array.isArray(data)) return data;

  // Else parse native Coursera API response
  if (Array.isArray(data.elements)) {
    return data.elements.map(c => ({
      title: c.name,
      image: c.photoUrl || "",
      price: null, // Coursera pricing is not available via public API
      url: c.slug ? `https://www.coursera.org/learn/${c.slug}` : "",
      description: c.shortDescription || "",
      provider: "Coursera"
    }));
  }
  return [];
}

/**
 * Fetches live courses from Udemy API for financial/goal-planning topics.
 * Requires using a proxy as Udemy API needs client_id/client_secret and enforces CORS.
 * @param {string} query - Course topic keywords (e.g., "financial literacy")
 * @returns {Promise<Array<{title: string, image: string, price: string, url: string, description: string, provider: string}>>}
 */
export async function fetchUdemyCourses(query) {
  // Use backend proxy for credentials & CORS
  // Only access REACT_APP_ variables that are statically inlined at build time
  const proxy = process.env.REACT_APP_UDEMY_PROXY;
  if (!proxy) return [];
  const resp = await fetch(`${proxy}/udemy-courses?search=${encodeURIComponent(query)}`);
  if (!resp.ok) return [];
  const data = await resp.json();
  // Expect: [{title, image, price, url, description, provider}]
  if (Array.isArray(data)) return data;
  // Fallback: Parse Udemy API response format
  if (Array.isArray(data.results)) {
    return data.results.map(c => ({
      title: c.title,
      image: c.image_480x270 || "",
      price: c.price || "",
      url: c.url ? `https://www.udemy.com${c.url}` : "",
      description: c.headline || "",
      provider: "Udemy"
    }));
  }
  return [];
}

/**
 * Fetches live courses from Skillshare API for financial/goal-planning topics.
 * Must use backend proxy; Skillshare does not support public API or CORS.
 * @param {string} query - Course topic keywords (e.g., "financial literacy")
 * @returns {Promise<Array<{title: string, image: string, price: string | null, url: string, description: string, provider: string}>>}
 */
export async function fetchSkillshareCourses(query) {
  // Only access REACT_APP_ variables that are statically inlined at build time
  const proxy = process.env.REACT_APP_SKILLSHARE_PROXY;
  if (!proxy) return [];
  const resp = await fetch(`${proxy}/skillshare-courses?search=${encodeURIComponent(query)}`);
  if (!resp.ok) return [];
  const data = await resp.json();
  if (Array.isArray(data)) return data;
  // Fallback: no supported public API schema
  return [];
}
