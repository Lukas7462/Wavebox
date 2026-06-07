import { useState } from "react";

const CARDS = [
  {
    icon: "🏆",
    title: "Als Legende spielen",
    desc: "Wähle ein historisches Meisterteam und führe es durch den Gauntlet.",
    highlight: null,
  },
  {
    icon: "🌍",
    title: "Bau deine Nation",
    desc: "Wähle dein Land. Stelle dein All-Time XI zusammen. Dann kämpfe.",
    highlight: null,
  },
  {
    icon: "👥",
    title: "Mit Freunden spielen",
    desc: "Team aufbauen und Freunde herausfordern.",
    highlight: "gold",
  },
  {
    icon: "🌐",
    title: "WC2026 Fantasy",
    desc: "Pick GK · DEF · MID · ATT · ST from real WC2026 players. Fight 7 rounds to win the Cup.",
    highlight: "green",
  },
];

export default function LandingPage({ onEnterApp }) {
  const [lang, setLang] = useState("DE");
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0c1d38 0%, #091426 60%, #070f1e 100%)",
      fontFamily: "'SF Pro Display', 'Helvetica Neue', -apple-system, system-ui, sans-serif",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      userSelect: "none",
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .card-item:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }
        .landing-btn:hover {
          background: rgba(255,255,255,0.18) !important;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 18px",
      }}>
        <button
          className="landing-btn"
          onClick={onEnterApp}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "9px",
            padding: "8px 18px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            fontFamily: "inherit",
            transition: "background 0.2s",
          }}
        >
          Anmelden
        </button>

        <button
          className="landing-btn"
          onClick={() => setLang(lang === "DE" ? "EN" : "DE")}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "9px",
            padding: "8px 14px",
            color: "#fff",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "background 0.2s",
          }}
        >
          {lang === "DE" ? "🇩🇪" : "🇬🇧"} {lang}
        </button>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        textAlign: "center",
        padding: "32px 20px 28px",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Trophy */}
        <div style={{
          fontSize: "52px",
          marginBottom: "10px",
          animation: "float 3s ease-in-out infinite",
          display: "inline-block",
        }}>
          🏆
        </div>

        {/* Big score */}
        <h1 style={{
          fontSize: "clamp(90px, 22vw, 150px)",
          fontWeight: "900",
          margin: "0 0 14px",
          background: "linear-gradient(180deg, #f7d060 0%, #e89c00 55%, #c97c00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-5px",
          lineHeight: 0.95,
          textShadow: "none",
        }}>
          7-0
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.6)",
          maxWidth: "280px",
          lineHeight: 1.55,
          margin: 0,
        }}>
          {lang === "DE"
            ? "Kannst du die WM 7-0 gewinnen, ohne ein Spiel zu verlieren?"
            : "Can you win the World Cup 7-0, without losing a single game?"}
        </p>
      </div>

      {/* ── Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        maxWidth: "680px",
        margin: "0 auto",
        padding: "0 14px 28px",
        width: "100%",
        boxSizing: "border-box",
      }}>
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="card-item"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background:
                card.highlight === "gold"
                  ? "rgba(120, 75, 20, 0.55)"
                  : card.highlight === "green"
                  ? "rgba(15, 80, 40, 0.65)"
                  : "rgba(255,255,255,0.055)",
              border:
                card.highlight === "green"
                  ? "1.5px solid rgba(52, 211, 100, 0.45)"
                  : card.highlight === "gold"
                  ? "1.5px solid rgba(220, 160, 40, 0.35)"
                  : "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px",
              padding: "18px 15px 16px",
              cursor: "pointer",
              transition: "transform 0.2s ease, filter 0.2s ease",
            }}
          >
            <div style={{ fontSize: "26px", marginBottom: "9px" }}>{card.icon}</div>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "700",
              color: card.highlight === "green" ? "#4ade80" : "#f5c842",
              marginBottom: "5px",
              lineHeight: 1.3,
            }}>
              {card.title}
            </h3>
            <p style={{
              fontSize: "11.5px",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.45,
              margin: 0,
            }}>
              {card.desc}
            </p>
          </div>
        ))}
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
          fontSize: "11px",
          color: "rgba(255,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}>
          <span style={{ fontSize: "14px" }}>🏆</span> WM 2026 Edition
        </span>
        <span style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "1.5px",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
        }}>
          POWERED BY WAVEBOX
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
