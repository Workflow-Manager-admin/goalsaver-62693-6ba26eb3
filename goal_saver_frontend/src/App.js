import React from 'react';
import './App.css';
import GoalieMainContainer from './GoalieMainContainer';

// PUBLIC_INTERFACE
/** App Root: Renders the Goalie main container as the core of the app. */
function App() {
  return (
    <div className="app" style={{ background: "var(--lavender-bg)" }}>
      <GoalieMainContainer />
    </div>
  );
}

export default App;