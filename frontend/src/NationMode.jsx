import { useState, useEffect, useRef } from "react";
import { simGoals, buildEvents, buildOpponents, BG, Btn, StatBar, PreMatch, MatchScreen, Champion, GameOver } from "./Game.jsx";

// ── Nations Data ──────────────────────────────────────────────────────────────

const NATIONS = [
  { name:"Italy",         flag:"🇮🇹", atk:86,mid:87,def:92, players:["Buffon","Maldini","Baresi","Pirlo","Del Piero"] },
  { name:"Brazil",        flag:"🇧🇷", atk:96,mid:90,def:85, players:["Pelé","Ronaldo","Romário","Ronaldinho","Cafu"] },
  { name:"Argentina",     flag:"🇦🇷", atk:94,mid:87,def:83, players:["Messi","Maradona","Batistuta","Di María","Riquelme"] },
  { name:"France",        flag:"🇫🇷", atk:89,mid:90,def:90, players:["Zidane","Platini","Mbappé","Henry","Thuram"] },
  { name:"Germany",       flag:"🇩🇪", atk:89,mid:89,def:90, players:["Müller","Beckenbauer","Neuer","Klose","Lahm"] },
  { name:"Spain",         flag:"🇪🇸", atk:86,mid:94,def:87, players:["Xavi","Iniesta","Villa","Ramos","Casillas"] },
  { name:"England",       flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", atk:85,mid:83,def:85, players:["Shearer","Lineker","Gerrard","Charlton","Moore"] },
  { name:"Netherlands",   flag:"🇳🇱", atk:89,mid:87,def:83, players:["Cruyff","Van Basten","Gullit","Robben","Bergkamp"] },
  { name:"Portugal",      flag:"🇵🇹", atk:90,mid:84,def:83, players:["Ronaldo","Figo","Eusébio","Rui Costa","Pepe"] },
  { name:"Uruguay",       flag:"🇺🇾", atk:87,mid:83,def:84, players:["Suárez","Cavani","Forlán","Godín","Ghiggia"] },
  { name:"Croatia",       flag:"🇭🇷", atk:84,mid:89,def:84, players:["Modrić","Šuker","Kovačić","Gvardiol","Livaković"] },
  { name:"Belgium",       flag:"🇧🇪", atk:89,mid:86,def:83, players:["De Bruyne","Lukaku","Hazard","Kompany","Courtois"] },
  { name:"Mexico",        flag:"🇲🇽", atk:82,mid:81,def:81, players:["Blanco","Hernández","Sánchez","Moreno","Ochoa"] },
  { name:"Japan",         flag:"🇯🇵", atk:80,mid:83,def:82, players:["Nakata","Kagawa","Endo","Honda","Hasebe"] },
  { name:"Morocco",       flag:"🇲🇦", atk:82,mid:83,def:88, players:["Hakimi","Ziyech","En-Nesyri","Bono","Boufal"] },
  { name:"Senegal",       flag:"🇸🇳", atk:84,mid:82,def:82, players:["Mané","Diouf","Dia","Diatta","Koulibaly"] },
  { name:"United States", flag:"🇺🇸", atk:80,mid:81,def:80, players:["Donovan","Dempsey","Howard","McBride","Pulisic"] },
  { name:"Canada",        flag:"🇨🇦", atk:79,mid:80,def:80, players:["Davies","David","Buchanan","Larin","Borjan"] },
  { name:"Colombia",      flag:"🇨🇴", atk:85,mid:85,def:81, players:["Valderrama","Falcao","James","Higuita","Asprilla"] },
  { name:"Australia",     flag:"🇦🇺", atk:80,mid:78,def:79, players:["Cahill","Kewell","Viduka","Schwarzer","Bresciano"] },
];

const ROUNDS = [
  "Gruppenphase – Spiel 1",
  "Gruppenphase – Spiel 2",
  "Gruppenphase – Spiel 3",
  "Achtelfinale",
  "Viertelfinale",
  "Halbfinale",
  "Finale 🏆",
];

const TACTICS = [
  { id: "attack",   icon: "⚔️", label: "Angriff",       desc: "ATK+8 / DEF−5",  atkB: 8,  defB: -5 },
  { id: "balanced", icon: "⚖️", label: "Ausgeglichen",  desc: "Standard",        atkB: 0,  defB:  0 },
  { id: "defense",  icon: "🛡️", label: "Defensive",     desc: "DEF+8 / ATK−5",  atkB: -5, defB:  8 },
];

const GOLD  = "#f5c842";
const GREEN = "#4ade80";
const RED   = "#f87171";

// ── Nation Select Screen ──────────────────────────────────────────────────────

function NationSelect({ onBack, onSelect }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={BG}>
      <style>{`
        .nation-card:hover {
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(245,200,66,0.3) !important;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <Btn onClick={onBack} variant="ghost" style={{ padding: "7px 14px", fontSize: 13 }}>← BACK</Btn>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>Build Your Nation</h2>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ padding: "16px 18px 8px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>
          Choose your country — then build your all-time World Cup XI.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        padding: "12px 14px 24px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        overflowY: "auto",
        flex: 1,
      }}>
        {NATIONS.map((n, i) => (
          <button
            key={n.name}
            className="nation-card"
            onClick={() => onSelect(n)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "16px 8px",
              textAlign: "center",
              cursor: "pointer",
              color: "#fff",
              fontFamily: "inherit",
              transition: "transform 0.15s, background 0.15s, border-color 0.15s",
            }}
          >
            <div style={{ fontSize: 30, marginBottom: 8 }}>{n.flag}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", lineHeight: 1.3 }}>{n.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NationMode({ onBack }) {
  const [screen,      setScreen]      = useState("nationSelect");
  const [myTeam,      setMyTeam]      = useState(null);
  const [opponents,   setOpponents]   = useState([]);
  const [roundIdx,    setRoundIdx]    = useState(0);
  const [tactic,      setTactic]      = useState("balanced");
  const [matchResult, setMatchResult] = useState(null);
  const [results,     setResults]     = useState([]);

  const selectNation = nation => {
    setMyTeam(nation);
    setOpponents(buildOpponents(nation.name));
    setRoundIdx(0);
    setResults([]);
    setTactic("balanced");
    setScreen("preMatch");
  };

  const startMatch = () => {
    const tObj = TACTICS.find(t => t.id === tactic);
    const opp  = opponents[roundIdx];
    const myG  = simGoals(myTeam.atk + tObj.atkB, opp.def);
    const oppG = simGoals(opp.atk, myTeam.def + tObj.defB);
    setMatchResult({ myGoals: myG, oppGoals: oppG, won: myG > oppG, events: buildEvents(myTeam, opp, myG, oppG) });
    setScreen("match");
  };

  const afterMatch = () => {
    const r = { my: matchResult.myGoals, opp: matchResult.oppGoals, w: matchResult.won };
    const newResults = [...results, r];
    setResults(newResults);
    if (!matchResult.won) { setScreen("gameOver"); return; }
    if (roundIdx >= 6)    { setScreen("champion");  return; }
    setRoundIdx(roundIdx + 1);
    setTactic("balanced");
    setScreen("preMatch");
  };

  const restart = () => {
    setScreen("nationSelect");
    setMyTeam(null);
    setRoundIdx(0);
    setResults([]);
    setMatchResult(null);
  };

  return (
    <>
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
        @keyframes floatTrophy{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      `}</style>

      {screen === "nationSelect" && (
        <NationSelect onBack={onBack} onSelect={selectNation} />
      )}

      {screen === "preMatch" && myTeam && opponents[roundIdx] && (
        <PreMatch
          myTeam={myTeam}
          opp={opponents[roundIdx]}
          roundIdx={roundIdx}
          results={results}
          tactic={tactic}
          setTactic={setTactic}
          onStart={startMatch}
          onBack={restart}
        />
      )}

      {screen === "match" && matchResult && (
        <MatchScreen
          key={roundIdx}
          myTeam={myTeam}
          opp={opponents[roundIdx]}
          roundIdx={roundIdx}
          matchResult={matchResult}
          onContinue={afterMatch}
        />
      )}

      {screen === "champion" && (
        <Champion myTeam={myTeam} results={results} onRestart={restart} />
      )}

      {screen === "gameOver" && (
        <GameOver
          myTeam={myTeam}
          roundIdx={roundIdx}
          matchResult={matchResult}
          results={results}
          onRestart={restart}
        />
      )}
    </>
  );
}
