import React, { useState } from "react";
import { fetchAmazonProduct, fetchFlipkartProduct } from "./apiProductLive";

/**
 * Modal for creating a goal using a live Amazon or Flipkart product.
 * Securely queries backend proxy; no secrets/real APIs in-browser.
 */
function ProductGoalModal({ onClose, onCreateGoal }) {
  const [market, setMarket] = useState("amazon");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);

  // PUBLIC_INTERFACE
  /** Fetch and parse product from backend proxy, NEVER calls real product APIs from browser */
  async function handleFetchProduct(e) {
    e.preventDefault();
    setErr("");
    setProduct(null);
    setLoading(true);

    try {
      let data = null;
      if (market === "amazon") {
        data = await fetchAmazonProduct(query);
      } else {
        data = await fetchFlipkartProduct(query);
      }
      if (!data) {
        setErr("No product found for your keywords. Please try a different search, and ensure your backend proxy is running and configured.");
        setProduct(null);
      } else {
        setProduct(data);
      }
    } catch (ex) {
      // Robust: handle all error types for display, and log to console for debugging
      let friendlyMsg = "";
      if (
        ex &&
        typeof ex.message === "string" &&
        (ex.message.includes("No product found") ||
         ex.message.includes("empty or incomplete") ||
         ex.message.toLowerCase().includes("no product found"))
      ) {
        friendlyMsg = "No product found for your keywords. " +
          "If this happens repeatedly, ensure your backend proxy is running and credentials are correct.";
      } else if (
        ex &&
        typeof ex.message === "string" &&
        (ex.message.toLowerCase().includes("missing amazon api credentials") ||
         ex.message.toLowerCase().includes("backend lookup failed: missing amazon api credentials"))
      ) {
        friendlyMsg = "Backend missing Amazon API credentials. Check your backend .env and restart the proxy server.";
      } else if (
        ex &&
        typeof ex.message === "string" &&
        (ex.message.toLowerCase().includes("missing flipkart api credentials") ||
         ex.message.toLowerCase().includes("backend lookup failed: missing flipkart api credentials"))
      ) {
        friendlyMsg = "Backend missing Flipkart API credentials. Check your backend .env and restart the proxy server.";
      } else if (
        ex &&
        typeof ex.message === "string" &&
        (ex.message.toLowerCase().includes("could not connect to backend proxy"))
      ) {
        friendlyMsg =
          "Could not connect to backend proxy. Please ensure the backend is running at the address set in .env.";
      } else if (
        ex && typeof ex.message === "string" &&
        (ex.message.toLowerCase().includes("cors") || ex.message.toLowerCase().includes("network"))
      ) {
        friendlyMsg =
          "Network error or CORS issue. Make sure your backend proxy is accessible, and CORS is allowed from this frontend's origin.";
      } else {
        friendlyMsg =
          "API error: Could not fetch product. " +
          (ex && ex.message ? String(ex.message) : "Unknown error") +
          " (Tip: Is the backend proxy running at the address set in .env? Are credentials set up?)";
      }
      // For debugging during development; doesn't affect user view.
      if (window && window.console && window.console.error) {
        window.console.error("Live product search error:", ex);
      }
      setErr(friendlyMsg);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  /** User selects product for new goal, uses only safe fields. */
  function handleUseThisProduct() {
    if (!product) return;
    onCreateGoal({
      name: product.name,
      target: product.price,
      // User chooses deadline in next step
      notes: `Live product goal from ${product.provider || market}: ${product.url}`
      // (Image and url can be added to modal if goal model is extended)
    });
    onClose();
  }

  return (
    <div className="goalie-modal-overlay">
      <div className="goalie-modal" style={{ maxWidth: 470 }}>
        <div
          className="goalie-modal-head"
          style={{ marginBottom: 8, gap: 8, alignItems: "center" }}
        >
          <span style={{ fontWeight: 700, fontSize: 19, color: "#8682e4" }}>
            🎯 Create Goal from Product
          </span>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "#d00",
              fontWeight: 600,
              fontSize: 21,
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={handleFetchProduct}
          style={{
            display: "flex",
            gap: 7,
            alignItems: "center",
            marginBottom: 17,
            flexWrap: "wrap",
          }}
        >
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            style={{
              padding: "7px 13px",
              borderRadius: 7,
              fontSize: 15,
              border: "1.3px solid #bfbbec",
              background: "#f7f5fe",
              color: "#473BC9",
              fontWeight: 600,
              marginRight: 7,
            }}
          >
            <option value="amazon">Amazon</option>
            <option value="flipkart">Flipkart</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={40}
            style={{
              flex: 1,
              minWidth: 120,
              border: "1px solid #bfbbec",
              borderRadius: 7,
              padding: "7px 14px",
              fontSize: 15,
              background: "#f7f5fe",
            }}
            placeholder="Enter product keywords (e.g. headphones)"
            required
            autoFocus
          />
          <button
            type="submit"
            style={{
              background: "linear-gradient(90deg, #8682e4 80%, #473BC9)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 21px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
            }}
            disabled={loading || !query}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {err && (
          <div style={{ color: "#fe5666", marginBottom: 8, fontWeight: 600 }}>
            {err}
            <div style={{ color: "#473BC9", marginTop: 7, fontWeight: 400, fontSize: 13 }}>
              <ul style={{ marginLeft: 16, marginBottom: 0 }}>
                <li>If <b>no product appears</b>, check your backend proxy server is running at <code>{process.env.REACT_APP_PRODUCT_BACKEND_PROXY || "http://localhost:5001"}</code>.</li>
                <li>Verify <b>Amazon/Flipkart API keys</b> are correct in your backend <code>.env</code> file.</li>
                <li>If you see repeated failures, <b>restart both the backend and frontend</b> after checking environment variables.</li>
                <li><b>CORS errors?</b> Backend proxy by default allows all origins. Check <code>server.js</code> if using custom domains.</li>
              </ul>
            </div>
          </div>
        )}

        <div style={{
          fontSize: 14, background: "#FFF4EA", color: "#8682e4", borderRadius: 9,
          padding: "10px 16px", marginBottom: 10, fontWeight: 500, border: "1px solid #e8e3ff"
        }}>
          <span style={{fontWeight:700}}>Tip:</span> Search for products as you would on Amazon/Flipkart.<br/>
          Your search is always secure – credentials are never sent to the browser.<br />
          <span style={{fontWeight: 400, color: "#473BC9"}}>Trouble? See README "Testing & Troubleshooting" or hover tips on fields.</span>
        </div>

        {product && (
          <div
            style={{
              background: "#F6F7FB",
              borderRadius: 14,
              padding: 18,
              margin: "2px 0 10px 0",
              boxShadow: "0 2px 10px #efe6fd55",
              display: "flex",
              gap: 18,
              alignItems: "start",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: 85,
                height: 85,
                objectFit: "contain",
                borderRadius: 11,
                boxShadow: "0 1px 7px #d8d8fb77",
                background: "#fff",
                border: "1.3px solid #e8e3ff",
              }}
              loading="lazy"
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 1, color: "#473BC9" }}>
                {product.name}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#4CAF50", margin: "3px 0" }}>
                {typeof product.price === "number" && product.price > 0
                  ? `₹${product.price.toLocaleString("en-IN")}`
                  : "Price unavailable"}
              </div>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2196F3", fontSize: 14, fontWeight: 500, textDecoration: "underline" }}
              >
                View on {product.provider || (market === "amazon" ? "Amazon" : "Flipkart")}
              </a>
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  style={{
                    background: "linear-gradient(90deg, #4CAF50 76%, #2196F3)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    fontSize: 15,
                    fontWeight: 600,
                    padding: "9px 28px",
                    cursor: "pointer",
                  }}
                  onClick={handleUseThisProduct}
                >
                  Use This As My Goal
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ color: "#aaa", fontSize: 13, textAlign: "right", marginTop: 7 }}>
          Powered by live {market === "amazon" ? "Amazon" : "Flipkart"} APIs (via backend proxy)
        </div>
      </div>
    </div>
  );
}

export default ProductGoalModal;
