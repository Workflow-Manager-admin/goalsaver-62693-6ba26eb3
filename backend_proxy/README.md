# GoalSaver Secure Product Proxy Backend

This backend proxy enables secure integration with Amazon Product Advertising API and Flipkart Affiliate API for product lookup and pricing, required for Goalie/GoalSaver webapp.

## Features

- Product search endpoints for Amazon and Flipkart:
  - `/amazon-product?keywords=SEARCH_TERM`
  - `/flipkart-product?keywords=SEARCH_TERM`
- API secrets and credentials are **never** sent to the browser.
- Sanitizes API data, exposes only limited fields (`title`, `image`, `price`, `url`, `provider`).
- CORS enabled for your frontend (edit as needed).

## Setup

1. Copy `.env.example` to `.env` in this folder and fill in:
   - Amazon Product Advertising API keys: `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_ASSOCIATE_TAG`
   - Flipkart Affiliate credentials: `FLIPKART_AFF_ID`, `FLIPKART_AFF_TOKEN`
2. Run `npm install`
3. Start the server:
   ```
   npm start
   ```
   By default, runs on port 5001 (or set `PORT=xxxx` in `.env`).

## Endpoints

- `GET /amazon-product?keywords=SEARCH_STRING`
- `GET /flipkart-product?keywords=SEARCH_STRING`
- Both endpoints return:
  ```json
  {
    "title": "Product Title",
    "image": "Image URL",
    "price": 1234,
    "url": "product/details-url",
    "provider": "Amazon|Flipkart"
  }
  ```

## Security

- All credentials reside in `.env` and **must never be sent to any frontend or version control**.
- Output is always sanitized; never leaks any secrets.

## Notes

- Amazon Product Advertising API requires account setup. See: [Amazon PAAPI documentation](https://webservices.amazon.com/paapi5/documentation/index.html)
- Flipkart Affiliate API is legacy; if not working, check your credentials or partner API status.

---

For issues or improvements, modify `server.js`.

---

**Never expose or commit `.env` files with real secrets!**
