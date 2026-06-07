import { useState } from "react";

const GOLD   = "#f5c842";
const GREEN  = "#4ade80";
const PURPLE = "#7c3aed";

const BG = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0c1d38 0%, #091426 60%, #070f1e 100%)",
  fontFamily: "'SF Pro Display','Helvetica Neue',system-ui,sans-serif",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
};

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function FriendsMode({ onBack }) {
  const [view, setView]         = useState("main"); // "main" | "create" | "join"
  const [groupCode]             = useState(() => generateCode());
  const [copied, setCopied]     = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(groupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={BG}>
      <style>{`
        .friends-card:hover { border-color: rgba(124,58,237,0.6) !important; background: rgba(124,58,237,0.12) !important; }
        .friends-card-dark:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.07) !important; }
        .friends-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .back-btn:hover { background: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <button
          className="back-btn"
          onClick={view === "main" ? onBack : () => setView("main")}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10,
            padding: "7px 14px",
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            transition: "background 0.15s, transform 0.15s",
          }}
        >
          ← BACK
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fff", margin: 0 }}>
          Play with Friends
        </h2>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: "24px 16px", maxWidth: 480, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {view === "main" && (
          <>
            {/* Create a Group card */}
            <div
              className="friends-card"
              onClick={() => setView("create")}
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1.5px solid rgba(124,58,237,0.5)",
                borderRadius: 18,
                padding: "24px 20px",
                cursor: "pointer",
                marginBottom: 14,
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  fontSize: 32,
                  width: 54,
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(124,58,237,0.2)",
                  borderRadius: 14,
                  flexShrink: 0,
                }}>
                  🏆
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                    Create a Group
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0 }}>
                    Pick your team, share a link with 3–5 friends. Tournament starts when everyone's in.
                  </p>
                </div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: 4 }}>›</div>
              </div>
            </div>

            {/* Join with a Code card */}
            <div
              className="friends-card-dark"
              onClick={() => setView("join")}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18,
                padding: "24px 20px",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  fontSize: 28,
                  width: 54,
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  flexShrink: 0,
                }}>
                  🔗
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                    Join with a Code
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0 }}>
                    Got a code from a friend? Enter it here.
                  </p>
                </div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: 4 }}>›</div>
              </div>
            </div>
          </>
        )}

        {view === "create" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🏆</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
              Your Group Code
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 28px", lineHeight: 1.5 }}>
              Share this code with your friends so they can join your tournament.
            </p>

            {/* Code display */}
            <div style={{
              background: "rgba(124,58,237,0.1)",
              border: "1.5px solid rgba(124,58,237,0.4)",
              borderRadius: 16,
              padding: "20px 24px",
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: "8px",
                color: "#a78bfa",
                fontFamily: "monospace",
                marginBottom: 8,
              }}>
                {groupCode}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>6-Zeichen Code</div>
            </div>

            {/* Copy button */}
            <button
              className="friends-btn"
              onClick={copyCode}
              style={{
                width: "100%",
                padding: "14px",
                background: copied
                  ? `rgba(74,222,128,0.15)`
                  : `linear-gradient(135deg, ${PURPLE}, #6d28d9)`,
                border: copied ? "1px solid rgba(74,222,128,0.3)" : "none",
                borderRadius: 12,
                color: copied ? GREEN : "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                marginBottom: 20,
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ Kopiert!" : "📋 Code kopieren"}
            </button>

            {/* Coming soon notice */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, textAlign: "left" }}>
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>Multiplayer kommt bald!</strong> Aktuell kannst du den Code mit Freunden teilen, aber das Live-Turnier wird gerade entwickelt.
              </p>
            </div>
          </div>
        )}

        {view === "join" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔗</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
              Code eingeben
            </h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 28px", lineHeight: 1.5 }}>
              Gib den 6-stelligen Code ein, den du von deinem Freund bekommen hast.
            </p>

            {/* Code input */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: "6px 16px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                maxLength={6}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: "6px",
                  color: "#fff",
                  textAlign: "center",
                  fontFamily: "monospace",
                  padding: "14px 0",
                }}
              />
            </div>

            <button
              className="friends-btn"
              onClick={() => {
                /* multiplayer not yet implemented */
              }}
              disabled={joinCode.length < 6}
              style={{
                width: "100%",
                padding: "14px",
                background: joinCode.length === 6
                  ? `linear-gradient(135deg, ${GOLD}, #e89c00)`
                  : "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: 12,
                color: joinCode.length === 6 ? "#000" : "rgba(255,255,255,0.25)",
                fontSize: 15,
                fontWeight: 700,
                cursor: joinCode.length === 6 ? "pointer" : "default",
                fontFamily: "inherit",
                marginBottom: 20,
                transition: "all 0.2s",
                boxShadow: joinCode.length === 6 ? "0 4px 20px rgba(245,200,66,0.3)" : "none",
              }}
            >
              Beitreten ⚽
            </button>

            {/* Coming soon notice */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, textAlign: "left" }}>
                <strong style={{ color: "rgba(255,255,255,0.7)" }}>Multiplayer kommt bald!</strong> Das Live-Turnier mit Freunden wird gerade entwickelt.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}>
        <span style={{
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "1.5px",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
        }}>
          POWERED BY INBOX ZERO
        </span>
        <span style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "1.5px",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
        }}>
          DRAFT FANTASY
        </span>
      </div>
    </div>
  );
}
