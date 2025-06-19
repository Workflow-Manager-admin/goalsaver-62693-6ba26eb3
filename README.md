# GoalSaver / Goalie: Secure Personal Finance Tracker with Live E-Commerce Product Goals

This project provides a fullstack savings goal planner & coach, with both a modern **React** frontend (`goal_saver_frontend/`) and a secure backend proxy (`backend_proxy/`) for live Amazon + Flipkart product integration.

---

## Features
- Track personalized savings goals (multiple, prioritized)
- Dynamic per-goal contribution suggestions based on real deadlines/income
- Smart reminders & motivational notifications (OneSignal, FCM supported)
- Securely search **live products** from Amazon / Flipkart to instantly create purchase-based goals — all credentials handled by your backend
- Modern, beautiful UI (lavender/pastel theme)
- All data stays on your device – **no account/login/bank details required**

---

## Installation Guide (End-to-End)

### 1. Backend Proxy Setup (Amazon & Flipkart)
This backend (`backend_proxy/`) securely handles API keys for Amazon Product Advertising and Flipkart Affiliate programs, and exposes simple endpoints for the frontend without ever leaking keys to the browser.

#### a) Clone and Enter Backend Directory
```bash
cd backend_proxy
```

#### b) Configure Environment Variables
1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Fill in `.env` with your own credentials (get these from Amazon Associates & Flipkart Partners dashboards):
   ```
   AMAZON_ACCESS_KEY=YOUR_AMAZON_KEY
   AMAZON_SECRET_KEY=YOUR_AMAZON_SECRET
   AMAZON_ASSOCIATE_TAG=YOUR_AMAZON_TAG
   AMAZON_REGION=us-east-1

   FLIPKART_AFF_ID=YOUR_FLIPKART_ID
   FLIPKART_AFF_TOKEN=YOUR_FLIPKART_TOKEN

   # (Optional) Change backend port, e.g. 5001
   PORT=5001
   ```
   **Never commit `.env` with real secrets!**

#### c) Install Dependencies
```bash
npm install
```

#### d) Start the Backend Proxy
```bash
npm start
```
- By default, runs at [http://localhost:5001](http://localhost:5001)
- Endpoints:
  - `/amazon-product?keywords=SEARCH_TERMS`
  - `/flipkart-product?keywords=SEARCH_TERMS`
- Returns: `{ title, image, price, url, provider }`

---

### 2. Frontend Setup (React App)

#### a) Enter Frontend Directory
```bash
cd goal_saver_frontend
```

#### b) Configure Frontend `.env`
1. Copy the environment example:
   ```bash
   cp .env.example .env
   ```
2. Set required keys, especially your backend proxy URL.
   ```
   REACT_APP_PRODUCT_BACKEND_PROXY=http://localhost:5001
   # (And others for notification/courses as needed)
   ```
   - This tells the frontend where to fetch live product data.

#### c) Install Frontend Dependencies
```bash
npm install
```

#### d) Start the Frontend
```bash
npm start
```
- Access at [http://localhost:3000](http://localhost:3000)

---

## 3. Creating Product-Based Goals (End-to-End Usage)

- Goalie now lets you create goals directly from live e-commerce products!

### How-to (Live Product Search with Auto-Fill):

1. Click the **"+ Goal from Product"** button on the landing/hero section of the app.
2. Select either **Amazon** or **Flipkart**, and enter the desired product keywords (e.g. "headphones").
3. The app will securely query your backend proxy (over the URL set in your `.env`) which fetches real-time product info from Amazon or Flipkart. Your API keys are never exposed in the browser.
4. Product results appear showing title, image, price (₹), link, and provider.
5. Choose your item and click **"Use This As My Goal"** – product details will be auto-filled into a new goal.
6. Set your own target date and notes, then save to begin tracking your wish!

**No secrets/tokens are ever stored or visible in the browser JS!**

---

### In-App Troubleshooting & Tips

- If no products show up or you receive errors when searching:
  - Confirm your backend proxy server is running at the URL in your frontend `.env`:  
    <code>REACT_APP_PRODUCT_BACKEND_PROXY=http://localhost:5001</code>
  - Check backend credentials in `backend_proxy/.env` are filled and valid.
  - Restart both backend and frontend after changing any `.env` values.
  - For CORS errors, the backend allows all origins by default. If needed, change or restrict this in `backend_proxy/server.js`.

- For further troubleshooting, see:
  - **Backend logs and errors** (run backend in terminal & watch for error output)
  - **Frontend errors** (browser DevTools > Console & Network tabs)

**All product search and goal creation flows are fully tested for the following:**
- Backend proxy returns valid product info from live APIs.
- Product details (title, price, URL, image) safely auto-fill the new goal modal.
- Errors or issues are presented to the user with clear tips and self-help steps.

---

## Environment Files Summary

- **backend_proxy/.env.example** (template for backend API secrets)
- **goal_saver_frontend/.env.example** (template for proxy URL and public-facing keys)
- Always add actual secrets/keys to your local `.env` only, never to git!

---

## Testing & Troubleshooting

- To test the end-to-end product search & creation, simply run both servers (backend on 5001, frontend on 3000) and use the product goal modal.
- Ensure backend has valid API credentials and is reachable.
- For CORS: The backend enables CORS for all origins by default, customize `server.js` as needed.
- Common issues:
  - **Invalid credentials:** Backend will respond with 500/502 errors; check .env and logs.
  - **CORS:** If frontend can't talk to backend, verify proxy URL and allowlist.
  - **API Quotas:** Some free API plans limit request rates.

---

## Security Best Practices

- All Amazon/Flipkart API calls and credentials are handled **only by your backend**.
- Only minimal, sanitized product details (`title`, `image`, `price`, `url`, `provider`) reach the frontend.
- Never put secret keys in frontend code or git!
- For advanced needs, review or extend `backend_proxy/server.js`.

---

## Quick Start Example

1. `cd backend_proxy && npm install && npm start`
2. `cd ../goal_saver_frontend && npm install && npm start`
3. Open [http://localhost:3000](http://localhost:3000) and use "Goal from Product".

---

## Learn More

- See `backend_proxy/README.md` for technical backend proxy details.
- See `goal_saver_frontend/README.md` for full explanation of push/courses integrations.

---

Happy goal-setting! 🎯
