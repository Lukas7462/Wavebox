import { useState, useEffect, useRef } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

const LEGENDARY_TEAMS = [
  { id: "brazil1970", name: "Brasilien 1970", flag: "🇧🇷", atk: 95, mid: 90, def: 82, players: ["Pelé", "Jairzinho", "Rivelino", "Tostão", "C. Alberto"] },
  { id: "wgermany1974", name: "W.-Deutschland 74", flag: "🇩🇪", atk: 87, mid: 88, def: 90, players: ["G. Müller", "Beckenbauer", "Breitner", "Overath", "Maier"] },
  { id: "argentina1986", name: "Argentinien 1986", flag: "🇦🇷", atk: 96, mid: 85, def: 80, players: ["Maradona", "Valdano", "Burruchaga", "Ruggeri", "Pumpido"] },
  { id: "france1998", name: "Frankreich 1998", flag: "🇫🇷", atk: 88, mid: 92, def: 90, players: ["Zidane", "Henry", "Thuram", "Desailly", "Barthez"] },
  { id: "spain2010", name: "Spanien 2010", flag: "🇪🇸", atk: 85, mid: 96, def: 88, players: ["Villa", "Xavi", "Iniesta", "Ramos", "Casillas"] },
  { id: "germany2014", name: "Deutschland 2014", flag: "🇩🇪", atk: 90, mid: 90, def: 88, players: ["Müller", "Götze", "Neuer", "Lahm", "Khedira"] },
  { id: "france2018", name: "Frankreich 2018", flag: "🇫🇷", atk: 90, mid: 88, def: 90, players: ["Mbappé", "Griezmann", "Pogba", "Kanté", "Lloris"] },
  { id: "argentina2022", name: "Argentinien 2022", flag: "🇦🇷", atk: 93, mid: 87, def: 85, players: ["Messi", "Álvarez", "Di María", "De Paul", "Otamendi"] },
];

const OPP_POOL = [
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", atk: 84, mid: 83, def: 85, players: ["Kane", "Bellingham", "Saka", "Stones", "Pickford"] },
  { name: "Niederlande", flag: "🇳🇱", atk: 86, mid: 84, def: 82, players: ["Van Dijk", "Depay", "Gakpo", "De Jong", "Timber"] },
  { name: "Portugal", flag: "🇵🇹", atk: 89, mid: 83, def: 83, players: ["Ronaldo", "Félix", "Pepe", "Rúben Dias", "Costa"] },
  { name: "Uruguay", flag: "🇺🇾", atk: 85, mid: 82, def: 84, players: ["Suárez", "Cavani", "Valverde", "Godín", "Muslera"] },
  { name: "Kroatien", flag: "🇭🇷", atk: 83, mid: 88, def: 84, players: ["Modrić", "Kovačić", "Gvardiol", "Perisic", "Livaković"] },
  { name: "Belgien", flag: "🇧🇪", atk: 88, mid: 86, def: 83, players: ["Lukaku", "De Bruyne", "Hazard", "Tielemans", "Courtois"] },
  { name: "Marokko", flag: "🇲🇦", atk: 82, mid: 83, def: 89, players: ["Boufal", "Ziyech", "En-Nesyri", "Hakimi", "Bounou"] },
  { name: "Japan", flag: "🇯🇵", atk: 80, mid: 84, def: 83, players: ["Mitoma", "Kubo", "Morita", "Tomiyasu", "Gonda"] },
  { name: "Mexiko", flag: "🇲🇽", atk: 81, mid: 80, def: 80, players: ["Jiménez", "Lozano", "Guardado", "Moreno", "Ochoa"] },
  { name: "Senegal", flag: "🇸🇳", atk: 83, mid: 81, def: 82, players: ["Mané", "Dia", "Mendy", "Kouyaté", "Diallo"] },
  { name: "Brasilien", flag: "🇧🇷", atk: 88, mid: 85, def: 84, players: ["Vinícius Jr.", "Neymar", "Casemiro", "Thiago Silva", "Alisson"] },
  { name: "Deutschland", flag: "🇩🇪", atk: 85, mid: 88, def: 87, players: ["Havertz", "Musiala", "Kroos", "Rüdiger", "Neuer"] },
  { name: "Frankreich", flag: "🇫🇷", atk: 87, mid: 90, def: 88, players: ["Mbappé", "Giroud", "Kanté", "Varane", "Lloris"] },
  { name: "Spanien", flag: "🇪🇸", atk: 84, mid: 92, def: 86, players: ["Morata", "Pedri", "Busquets", "Alba", "Unai Simón"] },
  { name: "Argentinien", flag: "🇦🇷", atk: 90, mid: 86, def: 83, players: ["Messi", "Lautaro", "Mac Allister", "Otamendi", "E. Martínez"] },
  { name: "Italien", flag: "🇮🇹", atk: 82, mid: 85, def: 91, players: ["Immobile", "Insigne", "Jorginho", "Chiellini", "Donnarumma"] },
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

// ── Engine ────────────────────────────────────────────────────────────────────

function simGoals(atk, def) {
  const prob = Math.max(0.06, Math.min(0.52, 0.18 + (atk - def) / 380));
  let g = 0;
  for (let i = 0; i < 9 + Math.floor(Math.random() * 5); i++) {
    if (Math.random() < prob) g++;
  }
  return Math.min(g, 7);
}

function buildEvents(myTeam, opp, myG, oppG) {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const oppGeneric = ["García", "Santos", "Müller", "Smith", "Rossi", "Martin"];
  const oppPlayers = opp.players || oppGeneric;

  // Unique random minutes
  const usedMins = new Set();
  const randMin = () => { let m; do { m = 1 + Math.floor(Math.random() * 89); } while (usedMins.has(m)); usedMins.add(m); return m; };

  const myMins  = Array.from({ length: myG  }, randMin).sort((a, b) => a - b);
  const oppMins = Array.from({ length: oppG }, randMin).sort((a, b) => a - b);

  const raw = [
    ...myMins.map(m => ({ m, team: "my" })),
    ...oppMins.map(m => ({ m, team: "opp" })),
  ].sort((a, b) => a.m - b.m);

  const events = [];
  let ms = 0, os = 0, htDone = false;

  for (const e of raw) {
    if (e.m > 45 && !htDone) { events.push({ min: 45, type: "ht", score: `${ms}:${os}` }); htDone = true; }
    if (e.team === "my") { ms++; events.push({ min: e.m, type: "goal", team: "my",  player: pick(myTeam.players), score: `${ms}:${os}` }); }
    else                 { os++; events.push({ min: e.m, type: "goal", team: "opp", player: pick(oppPlayers),      score: `${ms}:${os}` }); }
  }
  if (!htDone) events.push({ min: 45, type: "ht", score: `${ms}:${os}` });
  events.push({ min: 90, type: "ft", score: `${myG}:${oppG}` });
  return events;
}

function buildOpponents(excludeName) {
  const pool = [...OPP_POOL.filter(o => o.name !== excludeName)].sort(() => Math.random() - 0.5);
  const sorted = [...pool].sort((a, b) => (a.atk + a.mid + a.def) - (b.atk + b.mid + b.def));
  const easy   = sorted.slice(0, Math.floor(sorted.length / 2));
  const hard   = sorted.slice(Math.floor(sorted.length / 2));
  const pick   = arr => arr[Math.floor(Math.random() * arr.length)];
  // 3 group stage (easier), 2 medium, 1 semi, 1 final (hardest)
  const chosen = [pick(easy), pick(easy), pick(easy), pick(hard), pick(hard), pick(hard), pick(hard)];
  return chosen.map((o, i) => ({ ...o, atk: Math.min(99, o.atk + i * 2 | 0), mid: Math.min(99, o.mid + i * 2 | 0), def: Math.min(99, o.def + i * 2 | 0) }));
}

// ── Shared Styles ─────────────────────────────────────────────────────────────

const BG = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0c1d38 0%, #091426 60%, #070f1e 100%)",
  fontFamily: "'SF Pro Display','Helvetica Neue',system-ui,sans-serif",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
};

function Btn({ children, onClick, variant = "gold", style = {} }) {
  const base = {
    border: "none", borderRadius: 12, padding: "13px 32px",
    fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    transition: "opacity 0.15s, transform 0.15s",
    ...style,
  };
  const variants = {
    gold:  { background: `linear-gradient(135deg,${GOLD},#e89c00)`, color: "#000", boxShadow: `0 4px 20px rgba(245,200,66,0.3)` },
    ghost: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" },
    red:   { background: "rgba(248,113,113,0.12)", border: `1px solid rgba(248,113,113,0.25)`, color: RED },
    green: { background: "rgba(74,222,128,0.12)",  border: `1px solid rgba(74,222,128,0.25)`,  color: GREEN },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = ""; }}>
      {children}
    </button>
  );
}

function StatBar({ label, my, opp, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, width: 30, textAlign: "right", color }}>{my}</span>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(my / (my + opp)) * 100}%`, background: color, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 13, width: 30, color: "rgba(255,255,255,0.35)" }}>{opp}</span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", width: 70 }}>{label}</span>
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────────

function TeamSelect({ onBack, onSelect }) {
  return (
    <div style={BG}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Btn onClick={onBack} variant="ghost" style={{ padding: "7px 14px", fontSize: 13 }}>← Zurück</Btn>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: GOLD }}>Wähle dein Legendenteam</h2>
      </div>
      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, overflowY: "auto" }}>
        {LEGENDARY_TEAMS.map(t => (
          <button key={t.id} onClick={() => onSelect(t)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 14px", textAlign: "left", cursor: "pointer", color: "#fff", fontFamily: "inherit", transition: "transform 0.15s, background 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = ""; }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>{t.flag}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginBottom: 6 }}>{t.name}</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
              {[["ATK", t.atk, RED], ["MID", t.mid, "#60a5fa"], ["DEF", t.def, GREEN]].map(([l, v, c]) => (
                <span key={l} style={{ fontSize: 10, fontWeight: 700, background: c + "22", color: c, padding: "2px 6px", borderRadius: 5 }}>{l} {v}</span>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>{t.players.slice(0, 3).join(" · ")}…</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreMatch({ myTeam, opp, roundIdx, results, tactic, setTactic, onStart, onBack }) {
  return (
    <div style={BG}>
      {/* Header */}
      <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Spiel {roundIdx + 1} / 7</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: GOLD }}>{ROUNDS[roundIdx]}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{myTeam.flag} {myTeam.name.split(" ")[0]}</div>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.07)" }}>
        <div style={{ width: `${(roundIdx / 7) * 100}%`, height: "100%", background: `linear-gradient(90deg,${GOLD},#e89c00)`, transition: "width 0.5s" }} />
      </div>

      {/* VS */}
      <div style={{ padding: "28px 20px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginBottom: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 5 }}>{myTeam.flag}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{myTeam.name}</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: GOLD, letterSpacing: -1 }}>VS</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 5 }}>{opp.flag}</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{opp.name}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "16px 20px", maxWidth: 360, margin: "0 auto 24px" }}>
          <StatBar label="Angriff"    my={myTeam.atk} opp={opp.atk} color={RED} />
          <StatBar label="Mittelfeld" my={myTeam.mid} opp={opp.mid} color="#60a5fa" />
          <StatBar label="Abwehr"     my={myTeam.def} opp={opp.def} color={GREEN} />
        </div>
      </div>

      {/* Tactics */}
      <div style={{ padding: "0 18px 20px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", textAlign: "center", marginBottom: 10 }}>TAKTIK WÄHLEN</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {TACTICS.map(t => (
            <button key={t.id} onClick={() => setTactic(t.id)}
              style={{ flex: 1, maxWidth: 115, padding: "12px 8px", borderRadius: 12, border: tactic === t.id ? `1.5px solid ${GOLD}` : "1px solid rgba(255,255,255,0.08)", background: tactic === t.id ? "rgba(245,200,66,0.12)" : "rgba(255,255,255,0.04)", color: tactic === t.id ? GOLD : "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "inherit", textAlign: "center", transition: "all 0.18s" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{t.label}</div>
              <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Previous results */}
      {results.length > 0 && (
        <div style={{ padding: "0 18px 16px", display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {results.map((r, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: r.w ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", border: `1px solid ${r.w ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`, color: r.w ? GREEN : RED }}>
              {r.my}:{r.opp}
            </span>
          ))}
        </div>
      )}

      <div style={{ padding: "0 18px 32px", textAlign: "center" }}>
        <Btn onClick={onStart}>Spiel starten ⚽</Btn>
      </div>
    </div>
  );
}

function MatchScreen({ myTeam, opp, roundIdx, matchResult, onContinue }) {
  const [events, setEvents]     = useState([]);
  const [running, setRunning]   = useState(true);
  const tickerRef               = useRef(null);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < matchResult.events.length) {
        setEvents(prev => [...prev, matchResult.events[i++]]);
      } else {
        clearInterval(id);
        setRunning(false);
      }
    }, 550);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (tickerRef.current) tickerRef.current.scrollTop = tickerRef.current.scrollHeight;
  }, [events]);

  const myG  = events.filter(e => e.type === "goal" && e.team === "my").length;
  const oppG = events.filter(e => e.type === "goal" && e.team === "opp").length;
  const last = events[events.length - 1];
  const done = !running && events.length === matchResult.events.length;

  return (
    <div style={BG}>
      {/* Scoreboard */}
      <div style={{ padding: "20px 18px 10px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{ROUNDS[roundIdx]}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 4 }}>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 30, marginBottom: 3 }}>{myTeam.flag}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{myTeam.name.split(" ")[0]}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 58, fontWeight: 900, color: GOLD, lineHeight: 1, letterSpacing: -2 }}>{myG} – {oppG}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              {running ? (last?.min ? `${last.min}'` : "⚽") : done ? "⏱ Abpfiff" : ""}
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 30, marginBottom: 3 }}>{opp.flag}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{opp.name}</div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div ref={tickerRef} style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        {events.map((e, i) => {
          if (e.type === "ht" || e.type === "ft") return (
            <div key={i} style={{ textAlign: "center", padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                {e.type === "ht" ? "⏸ Halbzeit" : "⏱ Abpfiff"} — {e.score}
              </span>
            </div>
          );
          const isMy = e.team === "my";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${isMy ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`, flexDirection: isMy ? "row" : "row-reverse" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", minWidth: 26 }}>{e.min}'</span>
              <span style={{ fontSize: 18 }}>⚽</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: isMy ? GREEN : RED, textAlign: isMy ? "left" : "right" }}>{e.player}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{e.score}</span>
            </div>
          );
        })}
        {running && (
          <div style={{ display: "flex", justifyContent: "center", padding: 10, gap: 4 }}>
            {[0, 1, 2].map(b => (
              <div key={b} style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, opacity: 0.5, animation: `bounce 0.9s ${b * 0.2}s infinite` }} />
            ))}
          </div>
        )}
      </div>

      {/* Result */}
      {done && (
        <div style={{ padding: "20px 18px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 6 }}>{matchResult.won ? "🎉" : "😔"}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: matchResult.won ? GREEN : RED, marginBottom: 16 }}>
            {matchResult.won ? "Sieg!" : "Niederlage!"}
          </div>
          <Btn onClick={onContinue} variant={matchResult.won ? "gold" : "red"}>
            {matchResult.won ? (roundIdx < 6 ? "Weiter →" : "🏆 Finale!") : "Nochmal versuchen"}
          </Btn>
        </div>
      )}
    </div>
  );
}

function Champion({ myTeam, results, onRestart }) {
  return (
    <div style={{ ...BG, alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px" }}>
      <style>{`@keyframes floatTrophy{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
      <div style={{ fontSize: 80, animation: "floatTrophy 2.5s ease-in-out infinite", marginBottom: 12 }}>🏆</div>
      <h1 style={{ fontSize: 80, fontWeight: 900, background: `linear-gradient(180deg,${GOLD},#e89c00)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: -4, lineHeight: 1, margin: "0 0 8px" }}>7-0</h1>
      <p style={{ fontSize: 18, fontWeight: 800, color: GOLD, marginBottom: 6 }}>WELTMEISTER!</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>{myTeam.flag} {myTeam.name} hat alle 7 Spiele gewonnen!</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
        {results.map((r, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 7, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", color: GREEN }}>{r.my}:{r.opp}</span>
        ))}
      </div>
      <Btn onClick={onRestart}>Nochmal spielen</Btn>
    </div>
  );
}

function GameOver({ myTeam, roundIdx, matchResult, results, onRestart }) {
  return (
    <div style={{ ...BG, alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px" }}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>😔</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: RED, marginBottom: 6 }}>Ausgeschieden!</h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
        {myTeam.flag} {myTeam.name} scheitert im {ROUNDS[roundIdx]}
      </p>
      <div style={{ fontSize: 44, fontWeight: 900, color: RED, marginBottom: 22 }}>
        {matchResult.myGoals}:{matchResult.oppGoals}
      </div>
      {results.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
          {results.map((r, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: r.w ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", border: `1px solid ${r.w ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, color: r.w ? GREEN : RED }}>{r.my}:{r.opp}</span>
          ))}
        </div>
      )}
      <Btn onClick={onRestart} variant="ghost">Nochmal versuchen</Btn>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Game({ onBack }) {
  const [screen,      setScreen]      = useState("teamSelect");
  const [myTeam,      setMyTeam]      = useState(null);
  const [opponents,   setOpponents]   = useState([]);
  const [roundIdx,    setRoundIdx]    = useState(0);
  const [tactic,      setTactic]      = useState("balanced");
  const [matchResult, setMatchResult] = useState(null);
  const [results,     setResults]     = useState([]);

  const selectTeam = t => {
    setMyTeam(t);
    setOpponents(buildOpponents(t.name));
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

  const restart = () => { setScreen("teamSelect"); setMyTeam(null); setRoundIdx(0); setResults([]); setMatchResult(null); };

  return (
    <>
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }
      `}</style>

      {screen === "teamSelect" && <TeamSelect onBack={onBack} onSelect={selectTeam} />}

      {screen === "preMatch" && myTeam && opponents[roundIdx] && (
        <PreMatch
          myTeam={myTeam} opp={opponents[roundIdx]}
          roundIdx={roundIdx} results={results}
          tactic={tactic} setTactic={setTactic}
          onStart={startMatch} onBack={restart}
        />
      )}

      {screen === "match" && matchResult && (
        <MatchScreen
          key={roundIdx}
          myTeam={myTeam} opp={opponents[roundIdx]}
          roundIdx={roundIdx} matchResult={matchResult}
          onContinue={afterMatch}
        />
      )}

      {screen === "champion" && <Champion myTeam={myTeam} results={results} onRestart={restart} />}
      {screen === "gameOver" && <GameOver myTeam={myTeam} roundIdx={roundIdx} matchResult={matchResult} results={results} onRestart={restart} />}
    </>
  );
}
