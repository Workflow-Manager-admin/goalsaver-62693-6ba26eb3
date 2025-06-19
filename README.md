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
- **How-to:**
  1. Use the "+ Goal from Product" button on the landing/hero section.
  2. Choose "Amazon" or "Flipkart", and enter product keywords (e.g. "headphones").
  3. The app securely queries your backend proxy (never exposes keys) and displays sanitized product results (with title, image, ₹price, link, provider).
  4. Click "Use This As My Goal" — the info is filled in as a new goal, edit the target deadline/notes and save.
  5. Progress, motivate, and track towards buying that item!

**No secrets/tokens are ever stored or visible in the browser JS!**

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
