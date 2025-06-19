require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
const cors = require('cors');

// Use CORS to allow requests from your frontend, adjust origin as needed
app.use(cors({ origin: true }));

// Utility: sanitize product output
function sanitizeProduct({ title, image, price, url, provider }) {
  // Only expose what is needed for frontend
  return {
    title: title || '',
    image: image || '',
    price: price || null,
    url: url || '',
    provider: provider || '',
  };
}

// --- Amazon Product Advertising API Integration --- //
// Documentation: https://webservices.amazon.com/paapi5/documentation/index.html
// This uses HMAC-SHA256 signing (V4). 

const AMAZON_HOST = 'webservices.amazon.in';
const AMAZON_PATH = '/paapi5/searchitems';

// PUBLIC_INTERFACE
/**
 * Search Amazon products via Product Advertising API and return top match.
 * Query params: keywords (string)
 */
app.get('/amazon-product', async (req, res) => {
  try {
    const keywords = req.query.keywords;
    if (!keywords) return res.status(400).json({ error: "Missing keywords" });
    // Read config/secrets from env
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const associateTag = process.env.AMAZON_ASSOCIATE_TAG;
    const region = process.env.AMAZON_REGION || 'us-east-1';
    if (!accessKey || !secretKey || !associateTag)
      return res.status(500).json({ error: "Missing Amazon API credentials" });

    // Prepare payload as per PAAPI5 docs
    const payload = {
      Keywords: keywords,
      SearchIndex: "All",
      Resources: [
        "ItemInfo.Title",
        "Images.Primary.Small",
        "Images.Primary.Medium",
        "Offers.Listings.Price",
        "DetailPageURL"
      ],
      PartnerTag: associateTag,
      PartnerType: "Associates"
    };
    const body = JSON.stringify(payload);

    // Request signing per AWS Signature V4
    const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const service = 'ProductAdvertisingAPI';
    const method = 'POST';
    const algorithm = 'AWS4-HMAC-SHA256';

    const canonicalUri = AMAZON_PATH;
    const canonicalQueryString = '';
    const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=UTF-8\nhost:${AMAZON_HOST}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n`;
    const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex')
    ].join('\n');

    // Signing key
    function getSignatureKey(key, date, region, service) {
      const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(date).digest();
      const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
      const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
      const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
      return kSigning;
    }
    const signingKey = getSignatureKey(secretKey, dateStamp, region, service);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    // Authorization header
    const authorizationHeader = [
      `${algorithm} Credential=${accessKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(', ');

    // Final headers
    const headers = {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=UTF-8',
      'Host': AMAZON_HOST,
      'X-Amz-Date': amzDate,
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'Authorization': authorizationHeader,
    };

    // API request
    const resp = await axios.post(
      `https://${AMAZON_HOST}${AMAZON_PATH}`,
      body,
      { headers }
    );

    // Parse result: take top product
    const items = (resp.data.SearchResult && resp.data.SearchResult.Items) || [];
    if (!items.length) return res.json(null);

    const item = items.find(i =>
      i.ItemInfo &&
      i.ItemInfo.Title && i.ItemInfo.Title.DisplayValue &&
      i.DetailPageURL &&
      i.Images && i.Images.Primary && i.Images.Primary.Medium && i.Images.Primary.Medium.URL &&
      i.Offers && i.Offers.Listings && i.Offers.Listings.length && i.Offers.Listings[0].Price
    );
    if (!item) return res.json(null);

    const out = sanitizeProduct({
      title: item.ItemInfo.Title.DisplayValue,
      image: item.Images.Primary.Medium.URL,
      price: item.Offers.Listings[0].Price.Amount || null,
      url: item.DetailPageURL,
      provider: "Amazon"
    });
    res.json(out);

  } catch (err) {
    // Never leak secrets or details!
    res.status(502).json({ error: 'Amazon lookup failed', detail: String(err?.response?.data || err.message || err) });
  }
});


// --- Flipkart Affiliate Product Search Integration --- //
// Flipkart's old Affiliate API uses token/ID based authentication. Their "Product Search" API is now legacy, but still works for partners.

const FLIPKART_API = process.env.FLIPKART_API || "https://affiliate-api.flipkart.net/affiliate/search/json";

// PUBLIC_INTERFACE
/**
 * Search Flipkart products via Affiliate API and return top match.
 * Query params: keywords (string)
 */
app.get('/flipkart-product', async (req, res) => {
  try {
    const keywords = req.query.keywords;
    if (!keywords) return res.status(400).json({ error: "Missing keywords" });
    const flipId = process.env.FLIPKART_AFF_ID;
    const flipToken = process.env.FLIPKART_AFF_TOKEN;
    if (!flipId || !flipToken) return res.status(500).json({ error: "Missing Flipkart API credentials" });

    // Flipkart search endpoint
    const url = `${FLIPKART_API}?query=${encodeURIComponent(keywords)}&resultCount=1`;

    const headers = {
      'Fk-Affiliate-Id': flipId,
      'Fk-Affiliate-Token': flipToken,
      'Accept': 'application/json'
    };

    // Request
    const resp = await axios.get(url, { headers });
    // Legacy API structure (as of mid-2023)
    const products = ((resp.data && resp.data.products) || [])
      .map(p => p.productInfo && p.productInfo.productBaseInfoV1);

    const first = products[0];
    if (!first) return res.json(null);

    const out = sanitizeProduct({
      title: first.title,
      image: (first.imageUrls && (first.imageUrls['400x400'] || Object.values(first.imageUrls)[0])) || '',
      price:
        (first.flipkartSellingPrice && parseInt(first.flipkartSellingPrice.amount || "0")) ||
        (first.maximumRetailPrice && parseInt(first.maximumRetailPrice.amount || "0")) ||
        null,
      url: first.productUrl,
      provider: "Flipkart"
    });
    res.json(out);

  } catch (err) {
    res.status(502).json({ error: 'Flipkart lookup failed', detail: String(err?.response?.data || err.message || err) });
  }
});


// --- Health Route --- //
app.get('/', (req, res) => {
  res.json({ status: "Backend proxy running", time: new Date().toISOString() });
});

// PUBLIC_INTERFACE
/** Start backend on the given port or default 5001 */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Secure product proxy server listening on port ${PORT}`);
});
