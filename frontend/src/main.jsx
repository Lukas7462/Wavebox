import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LandingPage from './LandingPage.jsx'
import Game from './Game.jsx'
import FriendsMode from './FriendsMode.jsx'
import NationMode from './NationMode.jsx'

function Root() {
  const [view, setView] = useState('landing'); // 'landing' | 'game' | 'nation' | 'friends' | 'app'

  if (view === 'app')     return <App />;
  if (view === 'game')    return <Game        onBack={() => setView('landing')} />;
  if (view === 'friends') return <FriendsMode onBack={() => setView('landing')} />;
  if (view === 'nation')  return <NationMode  onBack={() => setView('landing')} />;

  return (
    <LandingPage
      onEnterApp={() => setView('app')}
      onStartGame={(mode) => setView(mode)}
    />
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
)
