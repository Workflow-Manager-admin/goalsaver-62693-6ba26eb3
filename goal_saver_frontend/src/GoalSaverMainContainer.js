import React, { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
/**
 * Main Container for GoalSaver App.
 * Handles all app state for goals, reminders, and provides UI to manage/manipulate them.
 * 
 * Features included:
 * - Goal-based savings planning
 * - Smart, dynamic contribution calculator
 * - Auto reminders & motivational messages
 * - Multiple goals management (add/prioritize)
 * - Progress visualization for goals
 * - No bank/UPI integration, supports cash/manual tracking
 * 
 * Extensible for future feature enhancements.
 */
function GoalSaverMainContainer() {
  // Goals array: [{id, name, target, deadline, saved, priority}]
  const [goals, setGoals] = useState([
    {
      id: 1,
      name: "Travel to Japan",
      target: 1500,
      deadline: "2024-12-31",
      saved: 400,
      priority: 1,
      notes: "",
    }
  ]);

  // UI state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: "", target: "", deadline: "", notes: "" });
  const [selectedGoalId, setSelectedGoalId] = useState(null); // for editing
  const [showReminder, setShowReminder] = useState(false);

  // Auto reminder trigger (demo purpose: 10s after load or goals update)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowReminder(true);
    }, 10000);
    return () => clearTimeout(timeout);
  }, [goals]);

  // Helper: get next priority#
  function getNextPriority() {
    return goals.length ? Math.max(...goals.map(g => g.priority)) + 1 : 1;
  }

  // PUBLIC_INTERFACE
  /** Add or update a goal */
  function handleGoalFormSubmit(e) {
    e.preventDefault();
    if (!goalForm.name || !goalForm.target || !goalForm.deadline) return;
    const newGoalData = {
      name: goalForm.name,
      target: parseFloat(goalForm.target),
      deadline: goalForm.deadline,
      saved: selectedGoalId
        ? goals.find(g => g.id === selectedGoalId).saved
        : 0,
      priority: selectedGoalId
        ? goals.find(g => g.id === selectedGoalId).priority
        : getNextPriority(),
      notes: goalForm.notes,
    };
    if (selectedGoalId) {
      setGoals(goals.map(g => g.id === selectedGoalId ? { ...g, ...newGoalData } : g));
    } else {
      setGoals([...goals, { ...newGoalData, id: Date.now() }]);
    }
    setShowGoalForm(false);
    setGoalForm({ name: "", target: "", deadline: "", notes: "" });
    setSelectedGoalId(null);
  }

  // PUBLIC_INTERFACE
  /** Selects goal for editing */
  function handleEditGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    setGoalForm({
      name: goal.name,
      target: goal.target,
      deadline: goal.deadline,
      notes: goal.notes || "",
    });
    setSelectedGoalId(goalId);
    setShowGoalForm(true);
  }

  // PUBLIC_INTERFACE
  /** Deletes a goal */
  function handleDeleteGoal(goalId) {
    setGoals(goals.filter(g => g.id !== goalId));
    if (selectedGoalId === goalId) setSelectedGoalId(null);
  }

  // PUBLIC_INTERFACE
  /** Adds savings to a goal */
  function handleAddSavings(goalId, amount) {
    setGoals(goals.map(g =>
      g.id === goalId ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g
    ));
  }

  // PUBLIC_INTERFACE
  /** Changes the priority/order of goals */
  function handlePrioritize(goalId, direction) {
    let sorted = [...goals].sort((a, b) => a.priority - b.priority);
    const idx = sorted.findIndex(g => g.id === goalId);
    if (direction === 'up' && idx > 0) {
      [sorted[idx - 1].priority, sorted[idx].priority] = [sorted[idx].priority + 1, sorted[idx - 1].priority - 1];
    } else if (direction === 'down' && idx < sorted.length - 1) {
      [sorted[idx + 1].priority, sorted[idx].priority] = [sorted[idx].priority - 1, sorted[idx + 1].priority + 1];
    }
    // Renumber priorities in order
    sorted = sorted.sort((a, b) => a.priority - b.priority)
      .map((g, i) => ({ ...g, priority: i + 1 }));
    setGoals(sorted);
  }

  // PUBLIC_INTERFACE
  /** Calculates required per-period savings for a goal (dynamic smart calculator) */
  function calculateContribution(goal) {
    if (!goal.deadline) return null;
    const today = new Date(), end = new Date(goal.deadline);
    const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const left = Math.max(goal.target - goal.saved, 0);
    if (days <= 0) return left;
    // Could improve by factoring "income" but demo is fixed period division
    return (left / Math.ceil(days / 7)).toFixed(2); // weekly plan
  }

  // PUBLIC_INTERFACE
  /** Renders a progress bar for the goal */
  function renderProgressBar(goal) {
    const pct = Math.min((goal.saved / goal.target) * 100, 100);
    return (
      <div style={{ width: '100%', background: '#E0E0E0', borderRadius: 12, height: 14, margin: '8px 0', overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #4CAF50 60%, #2196F3 100%)',
            height: '100%',
            transition: 'width 0.7s',
          }}
        ></div>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  /** Returns motivational or milestone message for a given goal */
  function getMotivationalMessage(goal) {
    const pct = Math.min((goal.saved / goal.target) * 100, 100);
    if (pct === 0) return "A journey of a thousand miles starts with a single step!";
    if (pct >= 100) return "Congratulations! 🎉 Goal reached.";
    if (pct > 75) return "Almost there! Keep saving.";
    if (pct > 50) return "Past the halfway mark!";
    if (pct > 25) return "Great start, keep going!";
    return "You're on your way!";
  }

  // --- COLOR SCHEME (css vars for demo, could use theme provider for scaling) ---
  const colors = {
    primary: "#4CAF50",
    secondary: "#FFC107",
    accent: "#2196F3",
    lightBg: "#FFFFFF",
    mutedBg: "#FAFAFA",
    border: "#E0E0E0",
    subtleText: "#757575",
    cardShadow: "rgba(31, 147, 99, 0.08)",
  };

  // --- COMPONENTS ---

  // Goal Add/Edit Form
  function GoalForm() {
    return (
      <form
        style={{
          background: colors.lightBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 10,
          padding: 20,
          boxShadow: `0 2px 10px 0 ${colors.cardShadow}`,
          marginBottom: 24,
          maxWidth: 400,
          marginLeft: "auto",
          marginRight: "auto"
        }}
        onSubmit={handleGoalFormSubmit}
      >
        <h3 style={{ color: colors.primary, marginTop: 0 }}>
          {selectedGoalId ? "Edit Goal" : "Add New Goal"}
        </h3>
        <label style={{ display: 'block', marginBottom: 6 }}>Goal Name</label>
        <input
          style={inputStyle}
          type="text"
          value={goalForm.name}
          onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
          maxLength={32}
          required
        />
        <label style={{ display: 'block', marginBottom: 6, marginTop: 12 }}>Target Amount ($)</label>
        <input
          style={inputStyle}
          type="number"
          inputMode="decimal"
          value={goalForm.target}
          onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
          min={1}
          required
        />
        <label style={{ display: 'block', marginBottom: 6, marginTop: 12 }}>Deadline</label>
        <input
          style={inputStyle}
          type="date"
          value={goalForm.deadline}
          onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })}
          required
        />
        <label style={{ display: 'block', marginBottom: 6, marginTop: 12 }}>Notes (optional)</label>
        <textarea
          style={{ ...inputStyle, minHeight: 44, resize: "vertical" }}
          value={goalForm.notes}
          onChange={e => setGoalForm({ ...goalForm, notes: e.target.value })}
          maxLength={150}
        />
        <div style={{ marginTop: 16 }}>
          <button type="submit" style={btnStyle(colors.primary)}>{selectedGoalId ? "Update Goal" : "Add Goal"}</button>
          <button
            type="button"
            style={btnStyle(colors.accent, true)}
            onClick={() => {
              setShowGoalForm(false);
              setGoalForm({ name: "", target: "", deadline: "", notes: "" });
              setSelectedGoalId(null);
            }}
          >Cancel</button>
        </div>
      </form>
    );
  }

  // Single Goal Card
  function GoalCard({ goal }) {
    const [addAmt, setAddAmt] = useState("");

    return (
      <div
        style={{
          background: colors.lightBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          marginBottom: 18,
          boxShadow: `0 2px 8px 0 ${colors.cardShadow}`,
          padding: 18,
          maxWidth: 480,
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
          <h4 style={{ color: colors.primary, margin: 0 }}>
            {goal.name} <span style={{ color: colors.subtleText, fontWeight: 400, fontSize: 15 }}> (${goal.target})</span>
          </h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={iconBtnStyle(colors.secondary, false)} title="Edit" onClick={() => handleEditGoal(goal.id)}>✏️</button>
            <button style={iconBtnStyle('#FE5252', false)} title="Delete" onClick={() => handleDeleteGoal(goal.id)}>🗑️</button>
          </div>
        </div>
        <div style={{ color: colors.subtleText, fontSize: 13, margin: "6px 0 0" }}>
          Deadline: {goal.deadline}
        </div>
        {goal.notes && <div style={{ color: colors.accent, fontSize: 13, margin: "5px 0 0" }}>Note: {goal.notes}</div>}

        <div style={{ margin: "10px 0 2px", fontWeight: 500 }}>
          Saved: <span style={{ color: colors.accent }}>${goal.saved}</span>
        </div>
        {renderProgressBar(goal)}

        <div style={{ fontSize: 13, color: colors.subtleText, marginBottom: 6 }}>
          {getMotivationalMessage(goal)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 2 }}>
          <ContributionStats goal={goal} />
          <form
            onSubmit={e => {
              e.preventDefault();
              const amt = parseFloat(addAmt);
              if (!amt || amt < 1) return;
              handleAddSavings(goal.id, amt);
              setAddAmt("");
            }}
            style={{ display: 'flex', gap: 4, alignItems: 'center' }}
          >
            <input
              style={{ ...inputStyle, padding: '4px 7px', width: 62 }}
              type="number"
              inputMode="decimal"
              min={1}
              value={addAmt}
              onChange={e => setAddAmt(e.target.value)}
              placeholder="Add $"
              title="Manual add to savings (cash/UPI/other)"
            />
            <button type="submit" style={btnStyle(colors.accent, false, '4px 12px', 12)}>+Save</button>
          </form>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 10, fontSize: 12 }}>
          <button disabled={goal.priority === 1} style={iconBtnStyle(colors.primary, goal.priority === 1)} onClick={() => handlePrioritize(goal.id, 'up')} title="Move Up">↑</button>
          <button disabled={goal.priority === goals.length} style={iconBtnStyle(colors.primary, goal.priority === goals.length)} onClick={() => handlePrioritize(goal.id, 'down')} title="Move Down">↓</button>
          <span style={{ color: colors.subtleText, marginLeft: 6 }}>Priority: {goal.priority}</span>
        </div>
      </div>
    );
  }

  // Displays weekly contribution stats
  function ContributionStats({ goal }) {
    const toSavePerWeek = calculateContribution(goal);
    return (
      <span style={{ fontSize: 13, marginRight: 8, color: colors.primary, minWidth: 100 }}>
        {toSavePerWeek
          ? `Save ~$${toSavePerWeek} /week`
          : "No deadline set"
        }
      </span>
    );
  }

  // Notification/Reminder Card
  function ReminderNotification() {
    if (!showReminder) return null;
    return (
      <div
        style={{
          background: colors.accent,
          color: "#FFF",
          borderRadius: 8,
          boxShadow: "0 2px 12px 0 #6cbed0b8",
          position: 'fixed',
          right: 28, top: 90,
          zIndex: 1023,
          minWidth: 220,
          padding: "16px 18px",
          fontSize: 16,
        }}
        onClick={() => setShowReminder(false)}
        role="button"
        aria-label="Dismiss reminder"
        tabIndex={0}
      >
        <div style={{ fontWeight: 600 }}>
          💡 Savings Habit Reminder
        </div>
        <div style={{ marginTop: 2 }}>Set aside a little for your goal today!</div>
        <div style={{ textAlign: 'right', fontSize: 13, marginTop: 7, opacity: 0.8 }}>
          Click to dismiss
        </div>
      </div>
    );
  }

  // Input/button persistent styles
  const inputStyle = {
    width: "100%",
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 15,
    padding: "7px 10px",
    marginBottom: 2,
    background: "#F6F7FB",
    color: "#222",
    outline: "none",
    marginTop: 2,
    boxShadow: "none",
  };
  function btnStyle(bg, outline = false, pad = "7px 15px", r = 6) {
    return {
      background: outline ? "#FFF" : bg,
      color: outline ? bg : "#FFF",
      border: `1px solid ${bg}`,
      borderRadius: r,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: 15,
      padding: pad,
      marginRight: 7,
      marginTop: 7,
    };
  }
  function iconBtnStyle(bg, disabled = false) {
    return {
      background: disabled ? "#FAFAFA" : bg,
      color: disabled ? "#B0B0B0" : "#333",
      border: 'none',
      borderRadius: 6,
      fontWeight: 900,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 19,
      padding: "2px 10px"
    };
  }

  // --- MAIN RENDER ---
  const sortedGoals = [...goals].sort((a, b) => a.priority - b.priority);

  return (
    <div
      style={{
        background: colors.mutedBg,
        minHeight: "100vh",
        paddingTop: 40,
        fontFamily: "Inter, Roboto, Arial, sans-serif"
      }}
    >
      <ReminderNotification />
      <div style={{
        textAlign: "center",
        padding: "42px 0 17px"
      }}>
        <h1 style={{
          color: colors.primary,
          margin: 0,
          fontSize: "2.6rem",
          fontWeight: 700,
          letterSpacing: "-1px",
        }}>
          GoalSaver
        </h1>
        <div style={{ color: colors.subtleText, fontSize: 19, margin: "6px 0 2px" }}>
          Set financial goals, save smarter, track — no bank/UPI needed.
        </div>
        <div style={{ color: colors.accent, fontSize: 14, marginBottom: 19 }}>
          Secure, habit-building, and personalized for you.
        </div>
        <button
          style={btnStyle(colors.primary, false, "10px 34px", 9)}
          onClick={() => setShowGoalForm(true)}
        >+ Add New Goal</button>
      </div>
      {showGoalForm && <GoalForm />}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
          marginBottom: 70
        }}
      >
        {sortedGoals.length === 0 ? (
          <div style={{
            background: "#fff9ed",
            color: colors.secondary,
            padding: "22px 28px",
            fontSize: 19,
            borderRadius: 11,
            margin: "0 auto"
          }}>
            No goals added yet. Start by defining your first savings goal!
          </div>
        ) : sortedGoals.map(goal =>
          <GoalCard key={goal.id} goal={goal} />
        )}
      </div>
      <footer style={{ textAlign: "center", color: "#A8AFB6", fontSize: 13, marginTop: 28, marginBottom: 0 }}>
        GoalSaver Prototype (All data stored locally). <br />
        <span style={{ color: colors.primary }}>#StartYourJourney</span>
      </footer>
    </div>
  );
}

export default GoalSaverMainContainer;
