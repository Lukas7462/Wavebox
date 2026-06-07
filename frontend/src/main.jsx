import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import Game from './Game.jsx'

function Root() {
  const [view, setView] = useState('landing'); // 'landing' | 'game' | 'app'

  if (view === 'app')  return <App />;
  if (view === 'game') return <Game onBack={() => setView('landing')} />;

  return (
    <LandingPage
      onEnterApp={() => setView('app')}
      onStartGame={() => setView('game')}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
)
