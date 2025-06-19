# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Important Note: Babel Configuration

This project’s `package.json` includes a `babel` section with a plugin:

```json
"babel": {
"plugins": ["./.ve/babel-plugin-jsx-editor-id.js"]
}
```

This plugin enables **visual editing functionality** in supported tools.

**Warning for AI code agents and contributors:**
**DO NOT** remove or modify this section - it is ESSENTIAL for proper operation.
Removing it will break editor integration and visual editing features.

## Live Product & Course API Integration (Amazon, Flipkart, Coursera, Udemy, Skillshare)

This app supports real-time integration of Amazon, Flipkart product data and integrates live course recommendations from Coursera, Udemy, and Skillshare for financial literacy and goal-planning.

### Setup Secure API Credentials

**Products (Amazon & Flipkart)**  
1. **Copy** `.env.example` to `.env` in the frontend root.
2. **Fill in** your Amazon Product Advertising API keys, Flipkart Affiliate API tokens, and backend proxy endpoint URL.
3. **Never commit your `.env` file or credentials.**

**Courses (Coursera, Udemy, Skillshare)**  
4. Add your Coursera, Udemy, and Skillshare API credentials as environment variables in `.env`.  
   - `REACT_APP_COURSERA_API_KEY`
   - `REACT_APP_COURSERA_API_URL` (optional if URL differs)
   - `REACT_APP_UDACITY_...` (if future support added)
   - `REACT_APP_UDEMY_CLIENT_ID`
   - `REACT_APP_UDEMY_CLIENT_SECRET`
   - `REACT_APP_UDEMY_API_URL` (default: `https://www.udemy.com/api-2.0`)
   - `REACT_APP_SKILLSHARE_TOKEN`
   - `REACT_APP_SKILLSHARE_API_URL` (optional)

**Never** expose your secret keys in client JS.  
*Always* use a proxy backend if API requires secrets or CORS is enforced.

**Backend Proxy Note (For Amazon, Flipkart, and when needed for secure Course APIs):**  
Some APIs require authentication not suitable for the frontend. Use your backend proxy (NodeJS/Express or cloud function) to handle tokens or OAuth flows. The frontend calls this backend with search keywords for products/courses.

#### Example Proxy endpoints:
- `/amazon-product?keywords=YOUR_KEYWORDS`
- `/flipkart-product?keywords=YOUR_KEYWORDS`
- `/coursera-courses?search=YOUR_QUERY`
- `/udemy-courses?search=YOUR_QUERY`
- `/skillshare-courses?search=YOUR_QUERY`

Proxy backends should return consistent course/product listing format:
```json
{
  "title": "Product or Course Title",
  "image": "Image URL",
  "price": 1234,
  "url": "details_url_here",
  "provider": "Coursera|Udemy|Skillshare|Amazon|Flipkart",
  "description": "Course description or summary"
}
```

### Environment Variables Required
See `.env.example` for all keys (including the additional Coursera/Udemy/Skillshare API variables).

### Secure Handling of Keys

- Never put secret API keys directly in client code.
- Use backend proxy for all real API calls, especially for Udemy and Skillshare.


### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
