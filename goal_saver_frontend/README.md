# Goalie / GoalSaver React Frontend

This React app is the **frontend UI for Goalie/GoalSaver**, your personalized savings tracker and financial goal planner. It features live integration with Amazon & Flipkart products for instant goal creation. The app also supports real-time financial course recommendations, habit-building reminders, and fully local data storage for your privacy.

---

## 🚀 End-to-End Setup Guide

### Step 1: Ensure Backend Proxy is Running

This frontend **requires the secure NodeJS backend proxy** in `../backend_proxy` for live product integration.  
The backend proxy securely handles Amazon and Flipkart API secrets and exposes safe endpoints for the frontend.

**Backend Setup:**
1. Open a new terminal and run:
   ```bash
   cd ../backend_proxy
   cp .env.example .env
   # Fill in your Amazon and Flipkart API credentials in .env (see backend_proxy/README.md)
   npm install
   npm start
   ```
2. By default, the backend runs at `http://localhost:5001`.

---

### Step 2: Frontend Setup & Environment Variables

1. **Clone/copy this repo and enter the frontend directory:**
   ```bash
   cd goal_saver_frontend
   ```
2. **Environment Configuration:**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and set:
     ```
     REACT_APP_PRODUCT_BACKEND_PROXY=http://localhost:5001
     ```
     (Set this to your running backend proxy URL—if you change backend port or run it on a remote server, update accordingly.)
   - For push notifications or live course APIs, add additional keys as desired (see `.env.example`).

   > **Never commit `.env` with private information!**

3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the app:**
   ```bash
   npm start
   ```
   By default, the frontend runs at [http://localhost:3000](http://localhost:3000).

---

## 🛒 Creating a Goal from Amazon/Flipkart Products

Once both backend and frontend are running:

1. Visit [http://localhost:3000](http://localhost:3000).
2. Click "+ Goal from Product" (hero landing area).
3. Choose "Amazon" or "Flipkart" and enter your product keywords.
4. The frontend will securely request live results from the backend proxy (no secrets in browser).
5. See product details and click "Use This As My Goal" — the app will pre-fill a new goal for you!
6. Set your target date/notes and save.

> **Tip:** If no product is found or you see an error, check your backend credentials, server status, and that `REACT_APP_PRODUCT_BACKEND_PROXY` is correct.

---

## 🧑‍💻 Environment Files Summary
- `.env.example`: Template file with all required variable names.
- `.env`: Your local copy (edit this for backend URL, notification, or course API keys).
- Keep `.env` private and never add real keys to version control.

---

## 🔔 Push Notification Setup (Optional)

To use goal reminders and push notifications (web/app):

- **OneSignal:**  
  - Set `REACT_APP_ONESIGNAL_APP_ID` in `.env` to your [OneSignal APP ID](https://app.onesignal.com/).
- **Firebase Cloud Messaging (FCM):**
  - Set `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, plus any other required keys.

Reminders and celebration notifications are triggered automatically by goal progress and periodic app usage.
You must allow notifications in your browser for this to work.

---

## 🎓 Live Learning / Course API Integration (Coursera, Udemy, Skillshare)

Optionally use the integrated financial literacy course picker in-app.  
For course search to work fully, set the required proxy URLs or API keys in `.env` for each provider as described in `.env.example`.

---

## 🔄 Common Issues & Troubleshooting

- **Frontend can't reach proxy:** Make sure `REACT_APP_PRODUCT_BACKEND_PROXY` is correct and backend is running.
- **CORS errors:** Backend proxy by default allows all origins. For more security, restrict CORS origins in `server.js`.
- **Product search fails:** Check backend API credentials, network access, or quota limits.
- **.env changes not taking effect:** Restart the frontend after editing `.env`.

---

## ⚡ Quick Start

```bash
cd ../backend_proxy && npm install && npm start
cd ../goal_saver_frontend && npm install && npm start
```
- Visit [http://localhost:3000](http://localhost:3000), use "+ Goal from Product".

---

## 🛡️ Security Notice

- All secret API keys must be handled only by the backend.
- Never expose or commit `.env` files containing secrets.

---

## Customization

### Colors
Lavender, pastel, and accent theme variables in `src/App.css`:

```css
:root {
  --lavender-main: #8682e4;
  --lavender-dark: #473BC9;
  /* ...other variables... */
}
```

### Components

Lightweight, pure React/HTML/CSS components for performance.

---

## Further Reading

See [backend_proxy/README.md](../backend_proxy/README.md) for proxy setup and [README.md](../README.md) for full-stack instructions.

---

Happy goal-setting! 🎯

