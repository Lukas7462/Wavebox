import { useState, useEffect, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────
const SURFACES = [
  { id: "hard",  name: "Hartplatz",  accent: "#42a5f5", bg: "#0a1929" },
  { id: "clay",  name: "Sandplatz",  accent: "#ff7043", bg: "#1a0800" },
  { id: "grass", name: "Rasen",      accent: "#66bb6a", bg: "#061209" },
];

const PLAYER_COUNTS = [4, 8, 16, 32];
const MATCH_H   = 72;
const BASE_GAP  = 20;
const COL_W     = 200;
const CONN_W    = 36;

// ─── Utilities ───────────────────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function slotH(round) {
  return (MATCH_H + BASE_GAP) * Math.pow(2, round - 1);
}

function matchTop(round, pos) {
  const sh = slotH(round);
  return pos * sh + (sh - MATCH_H) / 2;
}

function totalBracketH(n) {
  return n * (MATCH_H + BASE_GAP) - BASE_GAP;
}

function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function getRoundLabel(round, totalRounds) {
  const back = totalRounds - round;
  if (back === 0) return "Finale";
  if (back === 1) return "Halbfinale";
  if (back === 2) return "Viertelfinale";
  if (back === 3) return "Achtelfinale";
  return `Runde ${round}`;
}

function loadTournaments() {
  try { return JSON.parse(localStorage.getItem("tennis_tournaments") || "[]"); }
  catch { return []; }
}

function saveTournaments(t) {
  localStorage.setItem("tennis_tournaments", JSON.stringify(t));
}

// ─── Bracket builder ─────────────────────────────────────────────────────────
function buildBracket(players) {
  const n = players.length;
  const totalRounds = Math.log2(n);
  const matches = [];

  for (let i = 0; i < n / 2; i++) {
    const p1 = players[i * 2];
    const p2 = players[i * 2 + 1];
    const isByeP2 = p2?.name === "Freilos";
    const isByeP1 = p1?.name === "Freilos";
    matches.push({
      id: genId(), round: 1, position: i,
      p1Id: p1?.id ?? null,
      p2Id: p2?.id ?? null,
      winnerId: isByeP2 ? p1.id : isByeP1 ? p2.id : null,
      score: "",
    });
  }

  for (let r = 2; r <= totalRounds; r++) {
    const cnt = n / Math.pow(2, r);
    for (let i = 0; i < cnt; i++) {
      matches.push({ id: genId(), round: r, position: i, p1Id: null, p2Id: null, winnerId: null, score: "" });
    }
  }

  // Propagate bye auto-wins
  let result = [...matches];
  for (const m of result.filter(x => x.round === 1 && x.winnerId)) {
    result = doPropagate(result, m, totalRounds);
  }
  return result;
}

function doPropagate(matches, match, totalRounds) {
  if (match.round >= totalRounds || !match.winnerId) return matches;
  const nextRound = match.round + 1;
  const nextPos   = Math.floor(match.position / 2);
  const isP1Slot  = match.position % 2 === 0;
  return matches.map(m => {
    if (m.round !== nextRound || m.position !== nextPos) return m;
    return isP1Slot ? { ...m, p1Id: match.winnerId } : { ...m, p2Id: match.winnerId };
  });
}

// ─── ScoreModal ──────────────────────────────────────────────────────────────
function ScoreModal({ winnerName, onConfirm, onCancel }) {
  const [score, setScore] = useState("");
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 12, padding: 28, width: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>Gewinner</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 20 }}>{winnerName}</div>
        <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 8 }}>
          Ergebnis (optional, z.B. 6-3 7-5)
        </label>
        <input
          autoFocus
          value={score}
          onChange={e => setScore(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onConfirm(score); if (e.key === "Escape") onCancel(); }}
          placeholder="6-3 7-5"
          style={{
            width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
            color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={btnStyle("#333", "#fff")}>Abbrechen</button>
          <button onClick={() => onConfirm(score)} style={btnStyle("#42a5f5", "#fff", true)}>
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg, color, primary = false) {
  return {
    flex: 1, padding: "10px 0", background: primary ? bg : "rgba(255,255,255,0.08)",
    color, border: primary ? "none" : "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
  };
}

// ─── PlayerSlot ──────────────────────────────────────────────────────────────
function PlayerSlot({ player, isWinner, seed, onClick }) {
  const isBye = player?.name === "Freilos";
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      style={{
        flex: 1, display: "flex", alignItems: "center", gap: 6,
        padding: "0 10px", background: isWinner ? "rgba(255,255,255,0.13)" : "transparent",
        border: "none", cursor: onClick ? "pointer" : "default",
        textAlign: "left", width: "100%",
        transition: "background 0.12s",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.background = isWinner ? "rgba(255,255,255,0.13)" : "transparent"; }}
    >
      {seed != null && !isBye && (
        <span style={{ fontSize: 9, color: "#555", minWidth: 12 }}>{seed}</span>
      )}
      {isWinner && <span style={{ color: "#ffd700", fontSize: 9 }}>▶</span>}
      <span style={{
        fontSize: 12, fontWeight: isWinner ? 600 : 400,
        color: isBye ? "#444" : isWinner ? "#fff" : "#aaa",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {isBye ? "Freilos" : (player?.name ?? "—")}
      </span>
    </button>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────
function MatchCard({ match, playerMap, onSelectWinner, onReset, accentColor }) {
  const p1 = match.p1Id ? playerMap[match.p1Id] : null;
  const p2 = match.p2Id ? playerMap[match.p2Id] : null;
  const won = !!match.winnerId;
  const isBye1 = p1?.name === "Freilos";
  const isBye2 = p2?.name === "Freilos";

  return (
    <div style={{
      position: "absolute", width: COL_W, height: MATCH_H,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${won ? accentColor + "55" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 8, display: "flex", flexDirection: "column", overflow: "visible",
    }}>
      <PlayerSlot player={p1} isWinner={match.winnerId === match.p1Id} seed={p1?.seed}
        onClick={!won && p1 && p2 && !isBye1 ? () => onSelectWinner(match, "p1") : undefined}
      />
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
      <PlayerSlot player={p2} isWinner={match.winnerId === match.p2Id} seed={p2?.seed}
        onClick={!won && p1 && p2 && !isBye2 ? () => onSelectWinner(match, "p2") : undefined}
      />
      {match.score && (
        <span style={{
          position: "absolute", top: -11, right: 4,
          fontSize: 10, color: accentColor, background: "#111",
          padding: "1px 5px", borderRadius: 3, letterSpacing: 0.5,
        }}>
          {match.score}
        </span>
      )}
      {won && (
        <button
          onClick={() => onReset(match)}
          title="Zurücksetzen"
          style={{
            position: "absolute", top: -10, left: -8,
            width: 18, height: 18, borderRadius: "50%",
            background: "rgba(255,80,80,0.2)", border: "1px solid rgba(255,80,80,0.4)",
            color: "#ff6060", fontSize: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── ConnectorSVG ─────────────────────────────────────────────────────────────
function ConnectorSVG({ numPlayers, fromRound, accentColor }) {
  const h = totalBracketH(numPlayers) + MATCH_H;
  const matchesInRound = numPlayers / Math.pow(2, fromRound);
  const lines = [];

  for (let j = 0; j < matchesInRound / 2; j++) {
    const cy1 = matchTop(fromRound, j * 2)     + MATCH_H / 2;
    const cy2 = matchTop(fromRound, j * 2 + 1) + MATCH_H / 2;
    const cy3 = matchTop(fromRound + 1, j)     + MATCH_H / 2;
    const mx  = CONN_W / 2;

    lines.push(
      <g key={j} stroke={accentColor} strokeWidth={1.5} opacity={0.4}>
        <line x1={0}      y1={cy1} x2={mx}     y2={cy1} />
        <line x1={0}      y1={cy2} x2={mx}     y2={cy2} />
        <line x1={mx}     y1={cy1} x2={mx}     y2={cy2} />
        <line x1={mx}     y1={cy3} x2={CONN_W} y2={cy3} />
      </g>
    );
  }

  return (
    <svg width={CONN_W} height={h} style={{ flexShrink: 0, display: "block" }}>
      {lines}
    </svg>
  );
}

// ─── BracketView ──────────────────────────────────────────────────────────────
function BracketView({ tournament, onUpdate }) {
  const [pending, setPending] = useState(null); // { match, side }
  const surface = SURFACES.find(s => s.id === tournament.surface) || SURFACES[0];
  const accent  = surface.accent;

  const playerMap = {};
  for (const p of tournament.players) playerMap[p.id] = p;

  const n           = tournament.players.length;
  const totalRounds = Math.log2(n);
  const h           = totalBracketH(n);
  const finalMatch  = tournament.matches.find(m => m.round === totalRounds);
  const champion    = finalMatch?.winnerId ? playerMap[finalMatch.winnerId] : null;

  function handleSelectWinner(match, side) {
    setPending({ match, side });
  }

  function handleConfirmWinner(score) {
    const { match, side } = pending;
    const winnerId = side === "p1" ? match.p1Id : match.p2Id;
    setPending(null);

    let matches = tournament.matches.map(m =>
      m.id === match.id ? { ...m, winnerId, score: score.trim() } : m
    );
    // Propagate to next round
    const updated = { ...match, winnerId, score: score.trim() };
    matches = doPropagate(matches, updated, totalRounds);

    // Auto-advance if next match has a bye opponent
    const nextRound = match.round + 1;
    if (nextRound <= totalRounds) {
      const nextPos = Math.floor(match.position / 2);
      const next = matches.find(m => m.round === nextRound && m.position === nextPos);
      if (next) {
        const op = next.p1Id === winnerId ? playerMap[next.p2Id] : playerMap[next.p1Id];
        if (op?.name === "Freilos") {
          const autoWin = { ...next, winnerId };
          matches = matches.map(m => m.id === autoWin.id ? autoWin : m);
          matches = doPropagate(matches, autoWin, totalRounds);
        }
      }
    }

    onUpdate({ ...tournament, matches, status: champion || nextRound > totalRounds ? "completed" : "active" });
  }

  function handleReset(match) {
    // Reset this match and all downstream matches
    const winnerToRemove = match.winnerId;
    let matches = tournament.matches.map(m =>
      m.id === match.id ? { ...m, winnerId: null, score: "" } : m
    );
    // Remove from subsequent rounds recursively
    function clearDownstream(round, pos, playerId) {
      if (round > totalRounds || !playerId) return;
      const nextPos = Math.floor(pos / 2);
      const isP1    = pos % 2 === 0;
      const idx     = matches.findIndex(m => m.round === round && m.position === nextPos);
      if (idx < 0) return;
      const m = matches[idx];
      const wasInNext = isP1 ? m.p1Id === playerId : m.p2Id === playerId;
      if (!wasInNext) return;
      const removedWinner = m.winnerId === playerId ? playerId : null;
      matches[idx] = { ...m, ...(isP1 ? { p1Id: null } : { p2Id: null }), winnerId: null, score: "" };
      if (removedWinner) clearDownstream(round + 1, nextPos, removedWinner);
    }
    clearDownstream(match.round + 1, match.position, winnerToRemove);
    onUpdate({ ...tournament, matches, status: "active" });
  }

  const columns = [];
  for (let r = 1; r <= totalRounds; r++) {
    const label = getRoundLabel(r, totalRounds);
    columns.push(
      <div key={`round-${r}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 1.2,
          textTransform: "uppercase", marginBottom: 12, whiteSpace: "nowrap",
        }}>
          {label}
        </div>
        <div style={{ position: "relative", width: COL_W, height: h }}>
          {tournament.matches.filter(m => m.round === r).map(match => (
            <div key={match.id} style={{ position: "absolute", top: matchTop(r, match.position), left: 0 }}>
              <MatchCard
                match={match} playerMap={playerMap}
                onSelectWinner={handleSelectWinner}
                onReset={handleReset}
                accentColor={accent}
              />
            </div>
          ))}
        </div>
      </div>
    );
    if (r < totalRounds) {
      columns.push(
        <div key={`conn-${r}`} style={{ paddingTop: 30, flexShrink: 0 }}>
          <ConnectorSVG numPlayers={n} fromRound={r} accentColor={accent} />
        </div>
      );
    }
  }

  // Winner trophy
  if (champion) {
    columns.push(
      <div key="trophy" style={{ paddingTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 1, height: MATCH_H / 2 + 10, background: `${accent}40` }} />
        <div style={{
          background: `${accent}22`, border: `1px solid ${accent}66`,
          borderRadius: 10, padding: "12px 18px", textAlign: "center",
          boxShadow: `0 0 24px ${accent}44`,
        }}>
          <div style={{ fontSize: 22 }}>🏆</div>
          <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginTop: 4, letterSpacing: 0.5 }}>SIEGER</div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 700, marginTop: 2 }}>{champion.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 0,
        padding: "24px 32px 40px", minWidth: "fit-content",
      }}>
        {columns}
      </div>
      {pending && (
        <ScoreModal
          winnerName={pending.side === "p1"
            ? playerMap[pending.match.p1Id]?.name
            : playerMap[pending.match.p2Id]?.name}
          onConfirm={handleConfirmWinner}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

// ─── CreateTournament ─────────────────────────────────────────────────────────
function CreateTournament({ onSave, onCancel }) {
  const [name, setName]         = useState("");
  const [surface, setSurface]   = useState("hard");
  const [count, setCount]       = useState(8);
  const [names, setNames]       = useState(Array(8).fill(""));
  const [error, setError]       = useState("");

  function handleCountChange(n) {
    setCount(n);
    setNames(prev => {
      const next = Array(n).fill("");
      for (let i = 0; i < Math.min(prev.length, n); i++) next[i] = prev[i];
      return next;
    });
  }

  function handleSubmit() {
    if (!name.trim()) { setError("Bitte Turniernamen eingeben."); return; }
    const filledNames = names.map(n => n.trim());
    const filled = filledNames.filter(Boolean);
    if (filled.length < 2) { setError("Bitte mindestens 2 Spieler eintragen."); return; }

    // Fill remaining slots with "Freilos"
    const n = nextPow2(Math.max(filled.length, count));
    const players = [];
    for (let i = 0; i < n; i++) {
      const pName = filledNames[i] || "Freilos";
      players.push({ id: genId(), name: pName, seed: i + 1 });
    }

    const tournament = {
      id: genId(),
      name: name.trim(),
      surface,
      createdAt: new Date().toISOString(),
      status: "active",
      players,
      matches: buildBracket(players),
    };
    onSave(tournament);
  }

  const accent = SURFACES.find(s => s.id === surface)?.accent ?? "#42a5f5";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>
      <h2 style={{ color: "#fff", marginBottom: 24, fontSize: 22 }}>Neues Turnier</h2>

      <Field label="Turniername">
        <input
          autoFocus value={name} onChange={e => setName(e.target.value)}
          placeholder="z.B. Sommercup 2026"
          style={inputStyle}
        />
      </Field>

      <Field label="Belag">
        <div style={{ display: "flex", gap: 8 }}>
          {SURFACES.map(s => (
            <button key={s.id} onClick={() => setSurface(s.id)} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
              fontWeight: 600, fontSize: 12,
              background: surface === s.id ? `${s.accent}33` : "rgba(255,255,255,0.06)",
              border: `1px solid ${surface === s.id ? s.accent : "rgba(255,255,255,0.12)"}`,
              color: surface === s.id ? s.accent : "#888",
              transition: "all 0.15s",
            }}>{s.name}</button>
          ))}
        </div>
      </Field>

      <Field label="Spieleranzahl (Felder)">
        <div style={{ display: "flex", gap: 8 }}>
          {PLAYER_COUNTS.map(c => (
            <button key={c} onClick={() => handleCountChange(c)} style={{
              flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
              fontWeight: 700, fontSize: 14,
              background: count === c ? `${accent}33` : "rgba(255,255,255,0.06)",
              border: `1px solid ${count === c ? accent : "rgba(255,255,255,0.12)"}`,
              color: count === c ? accent : "#888",
              transition: "all 0.15s",
            }}>{c}</button>
          ))}
        </div>
      </Field>

      <Field label="Spieler eintragen">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {names.map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#555", minWidth: 16, textAlign: "right" }}>{i + 1}.</span>
              <input
                value={n}
                onChange={e => { const next = [...names]; next[i] = e.target.value; setNames(next); }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    const el = document.querySelectorAll(".player-input")[i + 1];
                    if (el) el.focus(); else handleSubmit();
                  }
                }}
                className="player-input"
                placeholder={`Spieler ${i + 1}`}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
          ))}
        </div>
      </Field>

      {error && <div style={{ color: "#ff6060", fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={btnStyle("", "", false)}>Abbrechen</button>
        <button onClick={handleSubmit} style={{
          ...btnStyle(accent, "#000", true),
          flex: 2,
        }}>
          Turnier starten
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", boxSizing: "border-box",
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)",
  borderRadius: 8, color: "#fff", fontSize: 13, outline: "none",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── TournamentList ───────────────────────────────────────────────────────────
function TournamentList({ tournaments, onSelect, onCreate, onDelete }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 22 }}>Tennis Turniere</h2>
        <button onClick={onCreate} style={{
          padding: "10px 20px", background: "#42a5f5", border: "none",
          borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}>
          + Neues Turnier
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎾</div>
          <div style={{ color: "#666", fontSize: 14 }}>Noch keine Turniere angelegt.</div>
          <button onClick={onCreate} style={{
            marginTop: 20, padding: "12px 24px", background: "rgba(66,165,245,0.15)",
            border: "1px solid #42a5f5", borderRadius: 8, color: "#42a5f5",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>
            Erstes Turnier erstellen
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tournaments.map(t => {
            const s = SURFACES.find(s => s.id === t.surface) || SURFACES[0];
            const totalRounds = Math.log2(t.players.length);
            const final = t.matches.find(m => m.round === totalRounds);
            const champion = final?.winnerId ? t.players.find(p => p.id === final.winnerId) : null;
            const realPlayers = t.players.filter(p => p.name !== "Freilos").length;
            const date = new Date(t.createdAt).toLocaleDateString("de-AT");
            return (
              <div key={t.id} onClick={() => onSelect(t.id)} style={{
                background: "rgba(255,255,255,0.04)", border: `1px solid ${s.accent}33`,
                borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 14,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: `${s.accent}22`, border: `1px solid ${s.accent}44`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>🎾</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{t.name}</div>
                  <div style={{ color: "#666", fontSize: 11 }}>
                    {s.name} · {realPlayers} Spieler · {date}
                  </div>
                  {champion && (
                    <div style={{ color: "#ffd700", fontSize: 11, marginTop: 2 }}>
                      🏆 {champion.name}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4,
                  background: champion ? "#ffd70022" : `${s.accent}22`,
                  color: champion ? "#ffd700" : s.accent,
                  border: `1px solid ${champion ? "#ffd70044" : s.accent + "44"}`,
                }}>
                  {champion ? "Abgeschlossen" : "Laufend"}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); if (confirm("Turnier löschen?")) onDelete(t.id); }}
                  style={{
                    padding: "6px 8px", background: "rgba(255,60,60,0.1)",
                    border: "1px solid rgba(255,60,60,0.25)", borderRadius: 6,
                    color: "#ff6060", fontSize: 12, cursor: "pointer",
                  }}
                >
                  🗑
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TennisTournament() {
  const [tournaments, setTournaments] = useState(loadTournaments);
  const [view, setView]               = useState("list"); // list | create | bracket
  const [activeId, setActiveId]       = useState(null);

  useEffect(() => { saveTournaments(tournaments); }, [tournaments]);

  const activeTournament = tournaments.find(t => t.id === activeId) ?? null;
  const surface = activeTournament
    ? (SURFACES.find(s => s.id === activeTournament.surface) || SURFACES[0])
    : SURFACES[0];

  function handleCreate(tournament) {
    setTournaments(prev => [...prev, tournament]);
    setActiveId(tournament.id);
    setView("bracket");
  }

  function handleUpdate(updated) {
    setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t));
  }

  function handleDelete(id) {
    setTournaments(prev => prev.filter(t => t.id !== id));
    if (activeId === id) { setActiveId(null); setView("list"); }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: view === "bracket" && activeTournament ? surface.bg : "#080c10",
      color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 24px",
        background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${view === "bracket" && activeTournament ? surface.accent + "33" : "rgba(255,255,255,0.08)"}`,
        flexShrink: 0,
      }}>
        {view !== "list" && (
          <button onClick={() => setView(view === "bracket" ? "list" : "list")} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "6px 12px", color: "#aaa", cursor: "pointer", fontSize: 13,
          }}>
            ← Zurück
          </button>
        )}
        <span style={{ fontSize: 18 }}>🎾</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>
          {view === "bracket" && activeTournament ? activeTournament.name : "Tennis Turniere"}
        </span>
        {view === "bracket" && activeTournament && (
          <span style={{
            fontSize: 11, color: surface.accent, fontWeight: 600, letterSpacing: 0.5,
            padding: "3px 8px", background: `${surface.accent}18`,
            border: `1px solid ${surface.accent}44`, borderRadius: 4,
          }}>
            {surface.name} · {activeTournament.players.filter(p => p.name !== "Freilos").length} Spieler
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {view === "list" && (
          <TournamentList
            tournaments={tournaments}
            onSelect={id => { setActiveId(id); setView("bracket"); }}
            onCreate={() => setView("create")}
            onDelete={handleDelete}
          />
        )}
        {view === "create" && (
          <CreateTournament
            onSave={handleCreate}
            onCancel={() => setView("list")}
          />
        )}
        {view === "bracket" && activeTournament && (
          <BracketView tournament={activeTournament} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
}
