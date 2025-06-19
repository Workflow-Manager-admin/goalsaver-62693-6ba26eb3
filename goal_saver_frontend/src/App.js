import React from 'react';
import './App.css';
import GoalSaverMainContainer from './GoalSaverMainContainer';

// PUBLIC_INTERFACE
/** App Root: Renders the GoalSaver main container as the core of the app. */
function App() {
  return (
    <div className="app" style={{ background: "#FAFAFA" }}>
      <GoalSaverMainContainer />
    </div>
  );
}

export default App;