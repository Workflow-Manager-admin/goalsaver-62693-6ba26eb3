import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// --- CURRENCY RATE COMPONENT ---
// Fetches and displays INR→USD currency exchange rate using exchangerate.host (public API)
function CurrencyRateSection() {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // PUBLIC_INTERFACE
    /** Fetches INR→USD exchange rate from exchangerate.host */
    async function fetchRate() {
      setLoading(true);
      setErr(null);
      try {
        const url = "https://api.exchangerate.host/latest?base=INR&symbols=USD";
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Network error");
        const data = await resp.json();
        const usdRate =
          data && data.rates && data.rates.USD
            ? (typeof data.rates.USD === "number"
                ? data.rates.USD
                : parseFloat(data.rates.USD)).toFixed(4)
            : null;
        setRate(usdRate);
      } catch (e) {
        setErr("Could not fetch current rate.");
      } finally {
        setLoading(false);
      }
    }
    fetchRate();
    // Optionally, refresh every 6 hrs
    // const interval = setInterval(fetchRate, 6 * 3600 * 1000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="goalie-currencyrate-wrap"
      style={{
        background: "var(--progress-bg)",
        border: "1.2px solid var(--border-color)",
        color: "var(--lavender-dark)",
        borderRadius: 15,
        fontWeight: 510,
        fontSize: 15.2,
        maxWidth: 370,
        margin: "14px auto 12px auto",
        padding: "9px 19px 6px 19px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 1.5px 6px 0 #d9d3ff17",
        fontFamily: "inherit"
      }}
      aria-live="polite"
      aria-label="INR to USD Exchange Rate"
    >
      <span style={{ fontWeight: 700, color: "var(--lavender-main)", display:"flex", alignItems:'center', gap:7 }}>
        <span role="img" aria-label="money" style={{ fontSize: 17, verticalAlign: "middle" }}>💱</span>
        Currency Rate
      </span>
      <span style={{ marginLeft: 14, color: "var(--lavender-dark)" }}>
        {loading ? (
          <span style={{ color: "var(--faded-txt)" }}>Loading...</span>
        ) : err ? (
          <span style={{ color: "#fe5666", fontWeight: 600 }}>{err}</span>
        ) : rate ? (
          <span>
            <span style={{ color: "var(--lavender-main)", fontWeight: 800 }}>
              1 INR
            </span>{" "}
            ={" "}
            <span
              style={{
                color: "var(--lavender-accent)",
                fontWeight: 700,
                fontSize: 15.5,
              }}
            >
              {rate} USD
            </span>
          </span>
        ) : (
          <span style={{ color: "var(--faded-txt)" }}>Unavailable</span>
        )}
      </span>
    </div>
  );
}

// --- DAILY TIP COMPONENT ---
// Fetches a daily motivational/financial tip from a free public API.
function DailyTipSection() {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // PUBLIC_INTERFACE
    /** Fetches a tip from api.adviceslip.com (no API key required). */
    async function fetchTip() {
      setLoading(true);
      setErr(null);
      try {
        const resp = await fetch("https://api.adviceslip.com/advice");
        if (!resp.ok) throw new Error("Network error");
        // Sometimes the API caches, force refresh with header or fallback to parse
        const data = await resp.json();
        setTip(data && data.slip && data.slip.advice ? data.slip.advice : null);
      } catch (e) {
        setErr("Could not fetch today's tip.");
      } finally {
        setLoading(false);
      }
    }
    fetchTip();
  }, []);

  return (
    <div
      className="goalie-dailytip-wrap"
      style={{
        background: "var(--contrib-bg)",
        borderRadius: 15,
        boxShadow: "0 1.5px 6px 0 #e4e0f8",
        border: "1.2px solid var(--border-color)",
        padding: "18px 24px 13px 24px",
        margin: "0 auto 19px auto",
        maxWidth: 440,
        fontFamily: "inherit",
        textAlign: "center",
        fontWeight: 500,
        color: "var(--lavender-dark)",
        position: "relative"
      }}
      aria-live="polite"
      aria-label="Daily Tip or Wisdom"
    >
      <div style={{ fontWeight: 800, fontSize: 17.5, marginBottom: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
        <span role="img" aria-label="lightbulb" style={{ fontSize: 23 }}>💡</span> Daily Tip
      </div>
      {loading && (
        <span style={{ fontSize: 15.5, color: "var(--faded-txt)" }}>Loading...</span>
      )}
      {err && (
        <span style={{ fontSize: 15.5, color: "#fe5666", fontWeight: 600 }}>{err}</span>
      )}
      {tip && !loading && (
        <div style={{ fontSize: 16.5, fontStyle: "italic", color: "var(--lavender-main)" }}>
          “{tip}”
        </div>
      )}
      {/* Optionally, add a refresh button for new tip */}
      {/* <button onClick={() => ...}>New Tip</button> */}
    </div>
  );
}

/** Luxurious pro font and palette */
const BRAND_FONT = "Inter, Nunito, 'Roboto', 'Helvetica Neue', Arial, sans-serif";

/** Priority badge rendering based on priority number (1,2,3...) */
function PriorityBadge({ priority }) {
  let prioText = "Priority " + priority;
  let badgeClass = "goalie-prio-badge";
  return (
    <span
      className={badgeClass}
      data-prio={priority}
      title={"Priority " + priority}
    >
      {prioText}
    </span>
  );
}
/** Typography preset for all main areas */
// REMOVED duplicate BRAND_FONT declaration

/**
 * Main Container for Goalie app (fully local version).
 * Implements: lavender theme, onboarding modal for user budget, core goal creation/tracker/habit features.
 * All logic is local — no Amazon/Flipkart, no course APIs, no push notification integrations.
 */

// PUBLIC_INTERFACE
function GoalieMainContainer() {
  // --- State for user profile and onboarding, local only ---
  const defaultProfile = {
    savingsMethod: "monthly", // daily/weekly/monthly
    monthlyIncome: "",
    monthlySpending: "",
    onboarded: false,
  };

  const [profile, setProfile] = useState(() => {
    try {
      const p = localStorage.getItem("goalieProfile");
      return p ? JSON.parse(p) : { ...defaultProfile };
    } catch {
      return { ...defaultProfile };
    }
  });
  const [showOnboarding, setShowOnboarding] = useState(!profile.onboarded);

  // --- Goals state (local only) ---
  const [goals, setGoals] = useState(() => {
    try {
      const data = localStorage.getItem("goalieGoals");
      return data
        ? JSON.parse(data)
        : [
            {
              id: 1,
              name: "Travel to Japan",
              target: 1500,
              deadline: "2024-12-31",
              saved: 400,
              priority: 1,
              notes: "",
            }
          ];
    } catch {
      return [
        {
          id: 1,
          name: "Travel to Japan",
          target: 1500,
          deadline: "2024-12-31",
          saved: 400,
          priority: 1,
          notes: "",
        }
      ];
    }
  });

  // --- UI state ---
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: "",
    target: "",
    deadline: "",
    notes: "",
  });
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [showReminder, setShowReminder] = useState(false);

  // --- Persist to localStorage ---
  useEffect(() => {
    localStorage.setItem("goalieProfile", JSON.stringify(profile));
  }, [profile]);
  useEffect(() => {
    localStorage.setItem("goalieGoals", JSON.stringify(goals));
  }, [goals]);

  // --- Reminder trigger: 10s after load/goals change (native reminder only) ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowReminder(true);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [goals]);

  // --- Priority helpers ---
  function getNextPriority() {
    return goals.length ? Math.max(...goals.map((g) => g.priority)) + 1 : 1;
  }

  // --- PUBLIC_INTERFACE: Goal form submission (add/update) ---
  function handleGoalFormSubmit(e) {
    e.preventDefault();
    if (!goalForm.name || !goalForm.target || !goalForm.deadline) return;
    const newGoalData = {
      name: goalForm.name,
      target: parseFloat(goalForm.target),
      deadline: goalForm.deadline,
      saved: selectedGoalId
        ? goals.find((g) => g.id === selectedGoalId).saved
        : 0,
      priority: selectedGoalId
        ? goals.find((g) => g.id === selectedGoalId).priority
        : getNextPriority(),
      notes: goalForm.notes,
    };
    if (selectedGoalId) {
      setGoals(
        goals.map((g) =>
          g.id === selectedGoalId ? { ...g, ...newGoalData } : g
        )
      );
    } else {
      setGoals([...goals, { ...newGoalData, id: Date.now() }]);
    }
    setShowGoalForm(false);
    setGoalForm({ name: "", target: "", deadline: "", notes: "" });
    setSelectedGoalId(null);
  }

  // --- PUBLIC_INTERFACE: Edit a goal ---
  function handleEditGoal(goalId) {
    const goal = goals.find((g) => g.id === goalId);
    setGoalForm({
      name: goal.name,
      target: goal.target,
      deadline: goal.deadline,
      notes: goal.notes || "",
    });
    setSelectedGoalId(goalId);
    setShowGoalForm(true);
  }

  // --- PUBLIC_INTERFACE: Delete a goal ---
  function handleDeleteGoal(goalId) {
    setGoals(goals.filter((g) => g.id !== goalId));
    if (selectedGoalId === goalId) setSelectedGoalId(null);
  }

  // --- PUBLIC_INTERFACE: Add savings to a goal ---
  function handleAddSavings(goalId, amount) {
    setGoals((prevGoals) =>
      prevGoals.map((g) => {
        if (g.id === goalId) {
          const oldSaved = g.saved;
          const newSaved = Math.min(g.saved + amount, g.target);
          // For this local-only version, celebration is shown via UI, not push
          return { ...g, saved: newSaved };
        }
        return g;
      })
    );
  }

  // --- PUBLIC_INTERFACE: Adjust goal priority up/down ---
  function handlePrioritize(goalId, direction) {
    let sorted = [...goals].sort((a, b) => a.priority - b.priority);
    const idx = sorted.findIndex((g) => g.id === goalId);
    if (direction === "up" && idx > 0) {
      [sorted[idx - 1].priority, sorted[idx].priority] = [
        sorted[idx].priority + 1,
        sorted[idx - 1].priority - 1,
      ];
    } else if (direction === "down" && idx < sorted.length - 1) {
      [sorted[idx + 1].priority, sorted[idx].priority] = [
        sorted[idx].priority - 1,
        sorted[idx + 1].priority + 1,
      ];
    }
    sorted = sorted
      .sort((a, b) => a.priority - b.priority)
      .map((g, i) => ({ ...g, priority: i + 1 }));
    setGoals(sorted);
  }

  // --- PUBLIC_INTERFACE: Calculates required per-period savings dynamically ---
  function calculateContribution(goal) {
    if (!goal.deadline || !profile.onboarded) return null;
    const today = new Date();
    const end = new Date(goal.deadline);
    const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const left = Math.max(goal.target - goal.saved, 0);

    // Derive periods for daily, weekly, and monthly
    let periodCount = 0;
    if (profile.savingsMethod === "daily") {
      periodCount = days;
    } else if (profile.savingsMethod === "weekly") {
      periodCount = Math.ceil(days / 7);
    } else {
      // monthly
      const months =
        today < end
          ? (end.getFullYear() - today.getFullYear()) * 12 +
            (end.getMonth() - today.getMonth()) +
            (end.getDate() >= today.getDate() ? 1 : 0)
          : 0;
      periodCount = Math.max(months, 1);
    }
    if (periodCount <= 0) return left.toFixed(2);

    // Estimate free cash per period (simple budgeting)
    let freePerMonth = Math.max(
      (parseFloat(profile.monthlyIncome) || 0) -
        (parseFloat(profile.monthlySpending) || 0),
      0
    );
    let freePerPeriod =
      profile.savingsMethod === "monthly"
        ? freePerMonth
        : profile.savingsMethod === "weekly"
        ? freePerMonth / 4.33
        : freePerMonth / 30.4;

    // Recommend a per-goal share proportional to target left
    const totalLeft = goals.reduce(
      (acc, g) => acc + Math.max(g.target - g.saved, 0),
      0
    );
    const recommended = totalLeft
      ? (left / totalLeft) * freePerPeriod
      : freePerPeriod;
    // Must at least cover the division, but capped at available cash
    return Math.max(left / periodCount, Math.min(recommended, left)).toFixed(2);
  }

  // --- PUBLIC_INTERFACE: Render progress bar for each goal ---
  function renderProgressBar(goal) {
    const pct = Math.min((goal.saved / goal.target) * 100, 100);
    return (
      <div
        style={{
          width: "100%",
          background: "var(--progress-bg)",
          borderRadius: 14,
          height: 15,
          margin: "10px 0 6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--lavender-accent), var(--lavender-dark))",
            height: "100%",
            transition: "width 0.75s",
          }}
        ></div>
      </div>
    );
  }

  // --- PUBLIC_INTERFACE: Get motivational messages ---
  function getMotivationalMessage(goal) {
    const pct = Math.min((goal.saved / goal.target) * 100, 100);
    if (pct === 0)
      return "A journey of a thousand miles starts with a single step!";
    if (pct >= 100) return "Congratulations! 🏆 Goal achieved.";
    if (pct > 75) return "Almost there! Keep saving 💜";
    if (pct > 50) return "Over halfway—great work!";
    if (pct > 25) return "Nice going, keep it up!";
    return "You’re on your way 🌱";
  }

  // --- THEME colors ---
  const colors = {
    lavender: "var(--lavender-main)",
    dark: "var(--lavender-dark)",
    accent: "var(--lavender-accent)",
    bg: "var(--lavender-bg)",
    card: "var(--card-bg)",
    white: "#FFF",
    muted: "var(--lavender-muted)",
    border: "var(--border-color)",
    faded: "var(--faded-txt)",
    grey: "var(--grey)",
    error: "#fe5666",
  };

  // --- COMPONENTS ---
  function OnboardingModal() {
    const [local, setLocal] = useState({
      savingsMethod: profile.savingsMethod,
      monthlyIncome: profile.monthlyIncome,
      monthlySpending: profile.monthlySpending,
    });
    const [err, setErr] = useState("");

    const isEditMode = !!profile.onboarded;

    function handleSubmit(e) {
      e.preventDefault();
      if (
        !local.savingsMethod ||
        !local.monthlyIncome ||
        !local.monthlySpending
      ) {
        setErr("All fields required");
        return;
      }
      if (
        isNaN(parseFloat(local.monthlyIncome)) ||
        isNaN(parseFloat(local.monthlySpending)) ||
        parseFloat(local.monthlyIncome) < 1
      ) {
        setErr("Please enter valid numbers and income.");
        return;
      }
      setProfile({
        ...local,
        onboarded: true,
      });
      setShowOnboarding(false);
    }

    return (
      <div className="goalie-modal-overlay">
        <div className="goalie-modal" style={{
          borderRadius: 20,
          padding: "39px 27px 33px 27px",
          boxShadow: "0 16px 60px 0 #a093ef43, 0 1.4px 9px 0 #d9cbf760",
          fontFamily: BRAND_FONT,
          border: "1.6px solid var(--border-color)",
          maxWidth: 420
        }}>
          <div className="goalie-modal-head" style={{ marginBottom: 14 }}>
            <span className="goalie-logo-icon" style={{ fontSize: 33 }}>
              <GoalPostSVG size={26} />
            </span>
            <span style={{
              fontWeight: 800,
              fontSize: 22,
              color: "var(--lavender-main)",
              marginLeft: 4,
              letterSpacing: "-1.1px",
              display: "inline-block",
              verticalAlign: "middle",
            }}>
              {isEditMode
                ? "Edit Savings Preferences"
                : "Welcome to Goalie"}
            </span>
          </div>
          <div style={{
            fontSize: 17.5,
            marginBottom: 18,
            color: "var(--faded-txt)",
            fontWeight: 400,
            marginTop: 3,
            lineHeight: 1.5,
            maxWidth: 325,
          }}>
            {isEditMode
              ? "Update your savings method, monthly income, or spending habits. These values help personalize your per-goal advice."
              : "Set up your personalized savings journey. We’ll recommend how much to save for each of your goals!"}
          </div>
          <form onSubmit={handleSubmit}>
            <label className="goalie-label" style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>
              Saving Method:
              <select
                value={local.savingsMethod}
                onChange={e =>
                  setLocal(l => ({ ...l, savingsMethod: e.target.value }))
                }
                style={{
                  width: "100%",
                  border: "1.3px solid var(--lavender-main)",
                  borderRadius: 7,
                  background: "var(--input-bg)",
                  fontSize: 17,
                  padding: "7.5px 11px",
                  marginTop: 7,
                  marginBottom: 3,
                }}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="goalie-label" style={{ marginTop: 10, fontSize: 16 }}>
              Monthly Income ($):
              <input
                style={{
                  width: "100%",
                  border: "1.3px solid var(--lavender-main)",
                  borderRadius: 7,
                  background: "var(--input-bg)",
                  fontSize: 17,
                  padding: "7.5px 11px",
                  marginTop: 7,
                  marginBottom: 3,
                }}
                type="number"
                min={1}
                step={1}
                value={local.monthlyIncome}
                onChange={e =>
                  setLocal(l => ({ ...l, monthlyIncome: e.target.value }))
                }
                required
              />
            </label>
            <label className="goalie-label" style={{ marginTop: 10, fontSize: 16 }}>
              Average Monthly Spending ($):
              <input
                style={{
                  width: "100%",
                  border: "1.3px solid var(--lavender-main)",
                  borderRadius: 7,
                  background: "var(--input-bg)",
                  fontSize: 17,
                  padding: "7.5px 11px",
                  marginTop: 7,
                  marginBottom: 4,
                }}
                type="number"
                min={0}
                step={1}
                value={local.monthlySpending}
                onChange={e =>
                  setLocal(l => ({ ...l, monthlySpending: e.target.value }))
                }
                required
              />
            </label>
            {err && (
              <div
                style={{
                  color: colors.error,
                  fontSize: 14.5,
                  marginTop: 9,
                  fontWeight: 700,
                }}
              >
                {err}
              </div>
            )}
            <button
              className="goalie-btn"
              type="submit"
              style={{
                marginTop: 26,
                width: "100%",
                fontSize: 18,
                fontWeight: 700,
                borderRadius: 10,
                boxShadow: "0 2px 12px 0 #bca6ff1a"
              }}
            >
              {isEditMode ? "Update Preferences" : "Continue"}
            </button>
            {isEditMode && (
              <button
                type="button"
                className="goalie-btn-outline"
                style={{
                  marginTop: 13,
                  width: "100%",
                  fontSize: 15.7,
                  borderRadius: 8,
                  fontWeight: 600,
                  background: "var(--contrib-bg)",
                }}
                onClick={() => setShowOnboarding(false)}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  function GoalForm() {
    return (
      <form
        style={{
          background: colors.white,
          border: `1px solid ${colors.border}`,
          borderRadius: 13,
          padding: 25,
          marginBottom: 24,
          boxShadow: `0 4px 22px 0 var(--lavender-shadow)`,
          maxWidth: 410,
          marginLeft: "auto",
          marginRight: "auto",
        }}
        onSubmit={handleGoalFormSubmit}
      >
        <h3
          style={{
            color: colors.lavender,
            marginTop: 0,
            fontWeight: 700,
            letterSpacing: "-0.5px",
            marginBottom: 13,
          }}
        >
          {selectedGoalId ? "Edit Goal" : "Add New Goal"}
        </h3>
        <label className="goalie-label">Goal Name</label>
        <input
          style={inputStyle}
          type="text"
          value={goalForm.name}
          maxLength={32}
          onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
          required
        />
        <label className="goalie-label" style={{ marginTop: 12 }}>
          Target Amount ($)
        </label>
        <input
          style={inputStyle}
          type="number"
          inputMode="decimal"
          value={goalForm.target}
          min={1}
          onChange={(e) => setGoalForm({ ...goalForm, target: e.target.value })}
          required
        />
        <label className="goalie-label" style={{ marginTop: 13 }}>
          Deadline
        </label>
        <input
          style={inputStyle}
          type="date"
          value={goalForm.deadline}
          onChange={(e) =>
            setGoalForm({ ...goalForm, deadline: e.target.value })
          }
          required
        />
        <label className="goalie-label" style={{ marginTop: 14 }}>
          Notes (optional)
        </label>
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 44 }}
          value={goalForm.notes}
          maxLength={120}
          onChange={(e) =>
            setGoalForm({ ...goalForm, notes: e.target.value })
          }
        />
        <div style={{ marginTop: 19, display: "flex", gap: 12 }}>
          <button type="submit" className="goalie-btn">
            {selectedGoalId ? "Update Goal" : "Add Goal"}
          </button>
          <button
            type="button"
            className="goalie-btn-outline"
            onClick={() => {
              setShowGoalForm(false);
              setGoalForm({ name: "", target: "", deadline: "", notes: "" });
              setSelectedGoalId(null);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function GoalCard({ goal }) {
    const [addAmt, setAddAmt] = useState("");
    const completed = goal.saved >= goal.target && goal.target > 0;
    return (
      <div className="goalie-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
            gap: 12,
          }}
        >
          <h4
            style={{
              color: "var(--lavender-main)",
              margin: 0,
              fontWeight: 800,
              fontSize: 21.5,
              letterSpacing: "-0.8px",
              fontFamily: BRAND_FONT,
              lineHeight: "1.13",
              display: "flex",
              alignItems: "center"
            }}
          >
            <PriorityBadge priority={goal.priority} />
            <span>
              {goal.name}
              <span
                style={{
                  color: "var(--faded-txt)",
                  fontWeight: 400,
                  fontSize: "15.1px",
                  marginLeft: 8,
                  letterSpacing: "-0.2px",
                  fontFamily: BRAND_FONT,
                }}
              >
                (${goal.target})
              </span>
            </span>
          </h4>
          <div style={{ display: "flex", gap: 7 }}>
            <button
              className="goalie-icon-btn"
              title="Edit"
              onClick={() => handleEditGoal(goal.id)}
              style={{
                color: "var(--lavender-main)",
                background: "var(--contrib-bg)",
                fontWeight: 700,
              }}
            >
              ✏️
            </button>
            <button
              className="goalie-icon-btn"
              title="Delete"
              onClick={() => handleDeleteGoal(goal.id)}
              style={{
                color: "var(--danger)",
                background: "#fff0f7",
                fontWeight: 700,
              }}
            >
              🗑️
            </button>
          </div>
        </div>
        <div
          style={{
            color: "var(--faded-txt)",
            fontSize: 13.2,
            margin: "8px 0 0",
            fontWeight: 500,
            fontFamily: BRAND_FONT,
          }}
        >
          Deadline: {goal.deadline}
        </div>
        {goal.notes && (
          <div
            style={{
              color: "var(--lavender-dark)",
              fontSize: 13,
              margin: "5px 0 0",
              fontStyle: "italic",
              fontWeight: 500,
              fontFamily: BRAND_FONT,
            }}
          >
            Note: {goal.notes}
          </div>
        )}

        <div
          style={{
            margin: "15px 0 3px",
            fontWeight: 700,
            fontSize: 16,
            fontFamily: BRAND_FONT,
          }}
        >
          Saved:{" "}
          <span
            style={{
              color: "var(--lavender-accent)",
              fontWeight: 900,
            }}
          >
            ${goal.saved}
          </span>
        </div>
        {/* Animated Progress Bar */}
        <div className="goalie-progress-bar-outer">
          <div
            className="goalie-progress-bar-inner"
            style={{
              width: `${Math.min((goal.saved / goal.target) * 100, 100)}%`,
              background:
                "linear-gradient(90deg, var(--lavender-accent), var(--lavender-main) 85%)",
            }}
          ></div>
        </div>

        <div
          style={{
            fontSize: 14,
            color: "var(--lavender-muted)",
            marginBottom: 6,
            fontWeight: 500,
            fontFamily: BRAND_FONT,
            marginTop: 4,
          }}
        >
          {getMotivationalMessage(goal)}
          {completed && (
            <span
              style={{
                marginLeft: 8,
                color: "#49d677",
                fontWeight: 700,
              }}
            >
              🎉
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            marginTop: 4,
            flexWrap: "wrap",
          }}
        >
          <ContributionStats goal={goal} />
          <form
            onSubmit={e => {
              e.preventDefault();
              const amt = parseFloat(addAmt);
              if (!amt || amt < 1) return;
              handleAddSavings(goal.id, amt);
              setAddAmt("");
            }}
            style={{ display: "flex", gap: 6, alignItems: "center" }}
          >
            <input
              style={{
                width: 75,
                border: "1.5px solid var(--lavender-main)",
                borderRadius: 8,
                fontSize: 15,
                padding: "5px 12px",
                marginBottom: 0,
                marginTop: 0,
                background: "var(--input-bg)",
                color: "#332d44",
                outline: "none",
                boxShadow: "none",
                fontFamily: BRAND_FONT,
                fontWeight: 700,
              }}
              type="number"
              inputMode="decimal"
              min={1}
              value={addAmt}
              onChange={e => setAddAmt(e.target.value)}
              placeholder="Add $"
              title="Manual add to savings"
            />
            <button
              type="submit"
              className="goalie-btn"
              style={{
                fontSize: 14.5,
                padding: "5px 13px",
                borderRadius: 8,
                background:
                  "linear-gradient(90deg, var(--lavender-accent), var(--lavender-main) 90%)",
                fontWeight: 800,
              }}
            >
              +Save
            </button>
          </form>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 15, fontSize: 12.2, fontFamily: BRAND_FONT }}>
          <button
            disabled={goal.priority === 1}
            className="goalie-icon-btn"
            onClick={() => handlePrioritize(goal.id, "up")}
            title="Move Up"
            style={{
              color:
                goal.priority === 1 ? "var(--lavender-muted)" : "var(--lavender-main)",
              background: goal.priority === 1 ? "var(--progress-bg)" : "var(--contrib-bg)",
              fontWeight: 800
            }}
          >
            ↑
          </button>
          <button
            disabled={goal.priority === goals.length}
            className="goalie-icon-btn"
            onClick={() => handlePrioritize(goal.id, "down")}
            title="Move Down"
            style={{
              color:
                goal.priority === goals.length
                  ? "var(--lavender-muted)"
                  : "var(--lavender-main)",
              background: goal.priority === goals.length ? "var(--progress-bg)" : "var(--contrib-bg)",
              fontWeight: 800
            }}
          >
            ↓
          </button>
          <span
            style={{
              marginLeft: 10,
              color: "var(--lavender-muted)",
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            Priority: {goal.priority}
          </span>
        </div>
      </div>
    );
  }

  function ContributionStats({ goal }) {
    const amt = calculateContribution(goal);
    let label =
      profile.savingsMethod === "weekly"
        ? "week"
        : profile.savingsMethod === "monthly"
        ? "month"
        : "day";
    return (
      <span
        style={{
          fontSize: 15.4,
          color: "var(--lavender-main)",
          fontWeight: 700,
          background: "var(--contrib-bg)",
          border: "1.2px solid var(--border-color)",
          padding: "4px 17px",
          borderRadius: 17,
          minWidth: 120,
          display: "inline-block",
          boxShadow: "0 1.5px 7px 0 #eae4fb17",
          fontFamily: BRAND_FONT,
        }}
      >
        {amt && profile.onboarded
          ? `Save ~$${amt} /${label}`
          : "Set up above"}
      </span>
    );
  }

  function ReminderNotification() {
    if (!showReminder) return null;
    return (
      <div
        className="goalie-reminder"
        onClick={() => setShowReminder(false)}
        tabIndex={0}
        aria-label="Dismiss reminder"
      >
        <div style={{ fontWeight: 700, fontSize: 18 }}>
          💡 Savings Habit Reminder
        </div>
        <div style={{ marginTop: 3, fontSize: 15 }}>
          Time to save a little for your goal!
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: 12,
            marginTop: 8,
            opacity: 0.85,
          }}
        >
          Click to dismiss
        </div>
      </div>
    );
  }

  // --- Input/button style helpers ---
  const inputStyle = {
    width: "100%",
    border: `1px solid var(--border-color)`,
    borderRadius: 6,
    fontSize: 16,
    padding: "8px 11px",
    marginBottom: 2,
    background: "var(--input-bg)",
    color: "#37314e",
    outline: "none",
    marginTop: 3,
    boxShadow: "none",
    transition: "border-color 0.15s",
  };

  // --- MAIN CONTENT ---
  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);

  return (
    <div
      className="goalie-theme-root"
      style={{
        minHeight: "100vh",
        fontFamily: BRAND_FONT,
        background: "var(--lavender-bg)",
        backgroundImage: "linear-gradient(135deg, #f9f7fc 75%, #ebe8fb 100%)",
        color: "var(--text-dark)",
      }}
    >
      {/* Daily Tip Section, at the very top */}
      <DailyTipSection />
      {/* Exchange Rate Section, placed after tip and above the header */}
      <CurrencyRateSection />
      {showOnboarding && <OnboardingModal />}
      <ReminderNotification />
      {/* Header */}
      <div className="goalie-navbar" style={{ fontFamily: BRAND_FONT, fontWeight: 600, fontSize: 17 }}>
        <span className="goalie-logo" style={{ letterSpacing: "-0.8px" }}>
          <span className="goalie-logo-icon">
            <GoalPostSVG size={28} />
          </span>
          <span>Goalie</span>
        </span>
        <span
          style={{
            color: "var(--lavender-accent)",
            letterSpacing: "0.11em",
            fontWeight: 500,
            fontSize: 15.5,
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: BRAND_FONT,
          }}
        >
          Save. Track. Win.
          <button
            className="goalie-btn-outline"
            type="button"
            style={{
              margin: 0,
              padding: "5px 17px",
              fontSize: 15.4,
              borderRadius: 9,
              fontWeight: 700,
              border: "1.47px solid var(--lavender-main)",
              color: "var(--lavender-main)",
              background: "#fff",
              letterSpacing: "0.01em",
              boxShadow: "0 1.5px 8px 0 #eae4fb33",
              transition: "all .13s",
            }}
            onClick={() => setShowOnboarding(true)}
            title="Profile / Edit Preferences"
          >
            Profile
          </button>
        </span>
      </div>
      {/* Main hero */}
      <div className="goalie-hero" style={{ paddingBottom: 3, paddingTop: 56 }}>
        {/* Pie Chart Summary */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            margin: "0 auto 22px auto",
            minHeight: 191,
            position: "relative",
            background: "var(--progress-bg)",
            borderRadius: 20,
            boxShadow: "0 8px 32px 0 var(--lavender-shadow)",
            padding: "19px 0 0 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1.3px solid var(--border-color)"
          }}
        >
          <GoalProgressPie
            goals={sortedGoals}
            themeColors={{
              lavenders: [
                "#8682e4", "#a391ff", "#beb3fd", "#6d82c0", "#473BC9", "#aba6fe", "#bdbbcf"
              ],
              border: "#edeafd",
              accent: "#b3a6ee"
            }}
          />
        </div>
        <div
          className="goalie-title"
          style={{
            color: "var(--lavender-main)",
            fontWeight: 800,
            letterSpacing: "-1.3px",
            fontFamily: BRAND_FONT,
            marginTop: 2,
            marginBottom: 1,
            display: "flex",
            alignItems: "center"
          }}
        >
          <GoalPostSVG size={32} style={{ verticalAlign: "-7px" }} /> Goalie
        </div>
        <div className="goalie-subtitle" style={{
          color: "var(--lavender-dark)",
          fontWeight: 500,
          fontSize: "1.25rem",
          marginTop: 15,
        }}>
          Set financial goals, save smarter—no bank linkage needed.
        </div>
        <div className="goalie-desc" style={{
          color: "var(--faded-txt)",
          marginTop: 9,
          marginBottom: 0,
          fontSize: 17,
          lineHeight: 1.53,
        }}>
          Beautifully track all your wishes, get custom savings advice, and build your best financial habits.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className="goalie-btn goalie-btn-large"
            onClick={() => setShowGoalForm(true)}
            style={{
              background: "linear-gradient(90deg, var(--lavender-main), var(--lavender-dark))",
              fontFamily: BRAND_FONT,
              fontWeight: 700,
              fontSize: "1.18rem",
              letterSpacing: "-.5px",
              borderRadius: 13,
              boxShadow: "0 3px 18px 0 #bca6ff36",
              padding: "15px 45px"
            }}
          >
            + Add New Goal
          </button>
        </div>
      </div>

      {/* Goal list */}
      {showGoalForm && <GoalForm />}
      <div className="goalie-goals-wrap" style={{ marginTop: 7 }}>
        {sortedGoals.length === 0 ? (
          <div className="goalie-emptymsg">
            No goals yet—start by adding your first savings goal!
          </div>
        ) : (
          sortedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </div>
      {/* Footer */}
      <footer className="goalie-footer" style={{
        fontWeight: 400,
        fontFamily: BRAND_FONT,
        fontSize: 15,
        color: "var(--faded-txt)",
        marginTop: 42,
        marginBottom: 6,
        letterSpacing: ".03em",
      }}>
        Goalie.{" "}
        <span style={{ color: "var(--lavender-main)", fontWeight: 800, letterSpacing: "-0.5px" }}>
          #ReachYourGoals
        </span>
        <br />
        <span style={{ fontSize: 11.5, color: "var(--faded-txt)" }}>
          All data stays on your device.
        </span>
      </footer>
    </div>
  );
}

// --- SVG: Goal Post Icon ---
function GoalPostSVG({ size = 26, style = {} }) {
  return (
    <svg
      height={size}
      width={size}
      viewBox="0 0 36 36"
      fill="none"
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <rect
          x="3"
          y="7"
          width="5"
          height="18"
          rx="2.5"
          fill="#9895fc"
          stroke="#5f5a91"
          strokeWidth="1"
        />
        <rect
          x="28"
          y="7"
          width="5"
          height="18"
          rx="2.5"
          fill="#aba6fe"
          stroke="#5f5a91"
          strokeWidth="1"
        />
        <rect
          x="7"
          y="14"
          width="22"
          height="3.5"
          rx="1.6"
          fill="#dad5fa"
          stroke="#9895fc"
          strokeWidth="0.7"
        />
        <rect
          x="14.5"
          y="23"
          width="7"
          height="7"
          rx="3.5"
          fill="#ffde8b"
          stroke="#cab969"
          strokeWidth="0.7"
        />
        <rect
          x="10"
          y="26"
          width="16"
          height="3.1"
          rx="1.5"
          fill="#a597e2"
          stroke="#5f5a91"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
}

/**
 * Pie chart component to display visual progress of all goals.
 */
function GoalProgressPie({ goals, themeColors }) {
  // Compute data for pie: one slice per goal, value = percent complete (min 0, max 100)
  let pieData = [];
  let colorPalette = themeColors && themeColors.lavenders
    ? themeColors.lavenders
    : ["#8682e4", "#a391ff", "#beb3fd", "#6d82c0", "#473BC9", "#aba6fe"];
  if (goals && goals.length > 0) {
    pieData = goals.map((g, idx) => {
      const pct = Math.max(0, Math.min((g.saved / g.target) * 100, 100));
      return {
        name: g.name,
        percent: pct,
        saved: g.saved,
        target: g.target,
        fill: colorPalette[idx % colorPalette.length]
      };
    });
  }
  // Only show sections with progress or non-zero target.
  const activeSlices = pieData.filter(p => p.percent > 0 || p.target > 0);

  // Pie label for center: mean/total percent, or "-"
  const totalComplete = pieData.reduce((acc, d) => acc + d.percent, 0);
  const pctAvg =
    pieData.length > 0
      ? Math.round(
          pieData.reduce((acc, d) => acc + d.percent, 0) / pieData.length
        )
      : 0;
  // Central label color
  const labelStyle = {
    fontSize: 27,
    fontWeight: 700,
    fontFamily: "inherit",
    fill: "#8682e4",
    textAnchor: "middle",
    dominantBaseline: "middle",
    // Slight text shadow
    textShadow: "0 2px 9px #cbc5fa",
  };

  // Custom tooltip
  function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length && payload[0].payload) {
      const { name, percent, saved, target } = payload[0].payload;
      return (
        <div
          style={{
            background: "#fff",
            border: "1.5px solid #eee9fd",
            color: "#7768b4",
            borderRadius: 9,
            boxShadow: "0 2px 10px 0 #bdbbf726",
            padding: "9px 16px",
            fontSize: 15,
            fontWeight: 500
          }}
        >
          <div style={{ fontWeight: 700, color: "#a391ff", marginBottom: 2 }}>{name}</div>
          <div>
            <span style={{ color: "#bd93e9" }}>
              {isNaN(percent) ? "--%" : `${percent.toFixed(1)}%`}
            </span>
            {"  "}
            <span style={{ color: "#8f89af", fontSize: 13 }}>
              (${saved ?? "--"} / ${target ?? "--"})
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  // If no goals/trivial, show fallback text.
  if (!goals || goals.length === 0) {
    return (
      <div style={{ color: "#bdbbf7", fontSize: 19, textAlign: "center", margin: "28px 0" }}>
        Add goals to see your progress!
      </div>
    );
  }
  // Empty/unstarted goals
  if (activeSlices.length === 0) {
    return (
      <div style={{ color: "#bdbbf7", fontSize: 18, textAlign: "center", margin: "22px 0" }}>
        No progress yet—start saving!
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 187 }}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="percent"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={53}
            outerRadius={84}
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
            isAnimationActive={true}
            animationDuration={820}
            stroke={themeColors?.border ?? "#edeafd"}
            strokeWidth={5}
            labelLine={false}
            minAngle={2}
          >
            {pieData.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={entry.fill}
                stroke={themeColors?.border ?? "#edeafd"}
                style={{ transition: "fill 0.22s" }}
              />
            ))}
          </Pie>
          {/* Central hollow-label for average % */}
          <svg
            x="50%"
            y="51%"
            width="0"
            height="0"
            style={{ pointerEvents: "none", position: "absolute" }}
          >
            <text
              x="0"
              y="0"
              dy=".3em"
              textAnchor="middle"
              style={labelStyle}
              alignmentBaseline="middle"
            >
              {pieData.length > 0 ? pctAvg + "%" : "-"}
            </text>
          </svg>
          {/* Custom tooltip for pie */}
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 16, color: "#8a88b5", fontWeight: 500, marginTop: 5 }}>
        <span
          style={{
            color: "#aba6fe",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            fontSize: 16,
            marginRight: 5
          }}
        >
          Goal Progress
        </span>
        <span style={{ fontSize: 14, color: "#bcb8ef", fontWeight: 300 }}>
          (avg {pctAvg}%)
        </span>
      </div>
    </div>
  );
}

export default GoalieMainContainer;
