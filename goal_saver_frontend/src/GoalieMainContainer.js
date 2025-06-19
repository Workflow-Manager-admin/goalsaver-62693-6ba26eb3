import React, { useState, useEffect } from "react";

/**
 * Main Container for Goalie app.
 * Implements: lavender theme, onboarding input modal for savings method/income/spending,
 * dynamic per-goal recommendations, branding updates, and modernized visual styles.
 */

// PUBLIC_INTERFACE
function GoalieMainContainer() {
  // --- State for user profile and onboarding, persisting in localStorage ---
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

  // --- Goals state ---
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
            },
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
        },
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

  // --- Reminder trigger: 10s after load/goals change ---
  useEffect(() => {
    const timeout = setTimeout(() => setShowReminder(true), 10000);
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
    setGoals(
      goals.map((g) =>
        g.id === goalId
          ? { ...g, saved: Math.min(g.saved + amount, g.target) }
          : g
      )
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
        <div className="goalie-modal">
          <div className="goalie-modal-head">
            <span className="goalie-logo-icon" style={{ fontSize: 29 }}>
              <GoalPostSVG size={22} />{" "}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: 21,
                color: "var(--lavender-dark)",
                marginLeft: 4,
                letterSpacing: "-1px",
                display: "inline-block",
                verticalAlign: "middle",
              }}
            >
              Welcome to Goalie
            </span>
          </div>
          <div
            style={{
              fontSize: 17,
              marginBottom: 19,
              color: "var(--faded-txt)",
              fontWeight: 400,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Set up your personalized savings journey. We’ll recommend how much to save for each of your goals!
          </div>
          <form onSubmit={handleSubmit}>
            <label className="goalie-label">
              Saving Method:
              <select
                value={local.savingsMethod}
                onChange={(e) =>
                  setLocal((l) => ({
                    ...l,
                    savingsMethod: e.target.value,
                  }))
                }
                style={inputStyle}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="goalie-label" style={{ marginTop: 10 }}>
              Monthly Income ($):
              <input
                style={inputStyle}
                type="number"
                min={1}
                step={1}
                value={local.monthlyIncome}
                onChange={(e) =>
                  setLocal((l) => ({
                    ...l,
                    monthlyIncome: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label className="goalie-label" style={{ marginTop: 10 }}>
              Average Monthly Spending ($):
              <input
                style={inputStyle}
                type="number"
                min={0}
                step={1}
                value={local.monthlySpending}
                onChange={(e) =>
                  setLocal((l) => ({
                    ...l,
                    monthlySpending: e.target.value,
                  }))
                }
                required
              />
            </label>
            {err && (
              <div
                style={{
                  color: colors.error,
                  fontSize: 14,
                  marginTop: 7,
                  fontWeight: 600,
                }}
              >
                {err}
              </div>
            )}
            <button
              className="goalie-btn"
              type="submit"
              style={{ marginTop: 22, width: "100%", fontSize: 18 }}
            >
              Continue
            </button>
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
    return (
      <div className="goalie-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 1,
          }}
        >
          <h4
            style={{
              color: colors.lavender,
              margin: 0,
              fontWeight: 700,
              fontSize: 21,
              letterSpacing: "-0.5px",
            }}
          >
            {goal.name}{" "}
            <span
              style={{
                color: colors.faded,
                fontWeight: 400,
                fontSize: 15,
                marginLeft: 1,
              }}
            >
              (${goal.target})
            </span>
          </h4>
          <div style={{ display: "flex", gap: 7 }}>
            <button
              className="goalie-icon-btn"
              title="Edit"
              onClick={() => handleEditGoal(goal.id)}
              style={{ color: colors.lavender }}
            >
              ✏️
            </button>
            <button
              className="goalie-icon-btn"
              title="Delete"
              onClick={() => handleDeleteGoal(goal.id)}
              style={{ color: "#fe5666" }}
            >
              🗑️
            </button>
          </div>
        </div>
        <div
          style={{
            color: colors.faded,
            fontSize: 13,
            margin: "6px 0 0",
            fontWeight: 500,
          }}
        >
          Deadline: {goal.deadline}
        </div>
        {goal.notes && (
          <div
            style={{
              color: colors.dark,
              fontSize: 13,
              margin: "4px 0 0",
              fontStyle: "italic",
            }}
          >
            Note: {goal.notes}
          </div>
        )}

        <div style={{ margin: "11px 0 3px", fontWeight: 600 }}>
          Saved: <span style={{ color: colors.accent }}>${goal.saved}</span>
        </div>
        {renderProgressBar(goal)}

        <div
          style={{
            fontSize: 13,
            color: colors.muted,
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          {getMotivationalMessage(goal)}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            marginTop: 3,
          }}
        >
          <ContributionStats goal={goal} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const amt = parseFloat(addAmt);
              if (!amt || amt < 1) return;
              handleAddSavings(goal.id, amt);
              setAddAmt("");
            }}
            style={{ display: "flex", gap: 4, alignItems: "center" }}
          >
            <input
              style={{ ...inputStyle, padding: "4px 9px", width: 69 }}
              type="number"
              inputMode="decimal"
              min={1}
              value={addAmt}
              onChange={(e) => setAddAmt(e.target.value)}
              placeholder="Add $"
              title="Manual add to savings"
            />
            <button
              type="submit"
              className="goalie-btn"
              style={{ fontSize: 14, padding: "4px 12px" }}
            >
              +Save
            </button>
          </form>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 13, fontSize: 12 }}>
          <button
            disabled={goal.priority === 1}
            className="goalie-icon-btn"
            onClick={() => handlePrioritize(goal.id, "up")}
            title="Move Up"
            style={{
              color:
                goal.priority === 1 ? colors.faded : colors.lavender,
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
                  ? colors.faded
                  : colors.lavender,
            }}
          >
            ↓
          </button>
          <span
            style={{
              color: colors.muted,
              marginLeft: 7,
              fontWeight: 600,
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
          fontSize: 15,
          color: colors.lavender,
          background: "var(--contrib-bg)",
          padding: "3px 14px",
          borderRadius: 15,
          fontWeight: 500,
          minWidth: 114,
          display: "inline-block",
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
    <div className="goalie-theme-root">
      {showOnboarding && <OnboardingModal />}
      <ReminderNotification />
      {/* Header */}
      <div className="goalie-navbar">
        <span className="goalie-logo">
          <span className="goalie-logo-icon">
            <GoalPostSVG size={28} />
          </span>
          <span>Goalie</span>
        </span>
        <span
          style={{
            color: "var(--lavender-accent)",
            letterSpacing: "0.2ch",
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          Save. Track. Win.
        </span>
      </div>
      {/* Main hero */}
      <div className="goalie-hero">
        <div
          className="goalie-title"
          style={{
            color: "var(--lavender-main)",
            fontWeight: 700,
          }}
        >
          <GoalPostSVG size={32} style={{ verticalAlign: "-7px" }} /> Goalie
        </div>
        <div className="goalie-subtitle">
          Set financial goals, save smarter—no bank linkage needed.
        </div>
        <div className="goalie-desc">
          Beautifully track all your wishes, get custom savings advice, and build your best financial habits.
        </div>
        <button
          className="goalie-btn goalie-btn-large"
          onClick={() => setShowGoalForm(true)}
        >
          + Add New Goal
        </button>
      </div>
      {/* Goal list */}
      {showGoalForm && <GoalForm />}
      <div className="goalie-goals-wrap">
        {sortedGoals.length === 0 ? (
          <div className="goalie-emptymsg">
            No goals yet—start by adding your first savings goal!
          </div>
        ) : (
          sortedGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </div>
      {/* Footer */}
      <footer className="goalie-footer">
        Goalie. <span style={{ color: "var(--lavender-main)" }}>#ReachYourGoals</span>
        <br />
        <span style={{ fontSize: 11, color: "var(--faded-txt)" }}>
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

export default GoalieMainContainer;
