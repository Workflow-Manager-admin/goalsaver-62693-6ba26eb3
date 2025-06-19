import React, { useState } from "react";
import { fetchAmazonProduct, fetchFlipkartProduct } from "./apiProductLive";

/**
 * Modal for creating a goal using a live Amazon or Flipkart product.
 * Lets user search by keyword, select marketplace, fetch actual data, and auto-fill goal details.
 */
function ProductGoalModal({ onClose, onCreateGoal }) {
  const [market, setMarket] = useState("amazon");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);

  // PUBLIC_INTERFACE
  /** Perform live fetch from selected marketplace by keyword */
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
      if (!data) setErr("No product found for your keywords.");
      setProduct(data);
    } catch (ex) {
      setErr("API error: " + (ex.message || "Could not fetch product."));
      setProduct(null);
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  /** User accepts the suggested product and proceeds to create a goal */
  function handleUseThisProduct() {
    if (!product) return;
    // Goal: {name, target, deadline, notes}
    onCreateGoal({
      name: product.title,
      target: product.price,
      // deadline left empty to have user fill manually in main add/edit
      notes: `Live product goal from ${market[0].toUpperCase() + market.slice(1)}: ${product.url}`,
      // Optionally extend to image etc.
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
          <div style={{ color: "#fe5666", marginBottom: 8, fontWeight: 600 }}>{err}</div>
        )}

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
              alt={product.title}
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
                {product.title}
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
                View on {market === "amazon" ? "Amazon" : "Flipkart"}
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
          Powered by live {market === "amazon" ? "Amazon" : "Flipkart"} APIs
        </div>
      </div>
    </div>
  );
}

export default ProductGoalModal;
