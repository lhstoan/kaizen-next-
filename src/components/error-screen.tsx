import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// Styled with inline styles on purpose: this screen renders both inside the (site)
// layout — where the legacy stylesheets are linked after globals.css and win on
// equal specificity — and outside it, where Tailwind is the only CSS there is.
const wrap: CSSProperties = {
  position: "relative",
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 24,
  overflow: "hidden",
  padding: "64px 24px",
  backgroundColor: "#000",
  color: "#fff",
  textAlign: "center",
  fontFamily: "var(--font-sans, system-ui, sans-serif)",
};

const glow: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background: "radial-gradient(60% 50% at 50% 0%, rgba(224,3,39,0.28) 0%, rgba(224,3,39,0) 70%)",
};

const codeStyle: CSSProperties = {
  position: "relative",
  margin: 0,
  color: "#e00327",
  fontSize: "clamp(88px, 18vw, 180px)",
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: "-0.02em",
};

const titleStyle: CSSProperties = {
  position: "relative",
  margin: 0,
  fontSize: "clamp(22px, 4vw, 32px)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

const jpStyle: CSSProperties = { position: "relative", margin: "6px 0 0", color: "#e00327", fontSize: 14 };

const descStyle: CSSProperties = {
  position: "relative",
  margin: 0,
  maxWidth: 460,
  color: "#a3a3a3",
  fontSize: 14,
  lineHeight: 1.8,
};

const buttonBase: CSSProperties = {
  display: "inline-block",
  padding: "14px 30px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  textDecoration: "none",
  cursor: "pointer",
};

export const errorPrimaryButton: CSSProperties = {
  ...buttonBase,
  border: "1px solid #e00327",
  backgroundColor: "#e00327",
  color: "#fff",
};

export const errorSecondaryButton: CSSProperties = {
  ...buttonBase,
  border: "1px solid rgba(255,255,255,0.25)",
  backgroundColor: "transparent",
  color: "#fff",
};

export default function ErrorScreen({
  code,
  title,
  jp,
  description,
  action,
}: {
  code: string;
  title: string;
  jp: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div style={wrap}>
      <div style={glow} />

      {/* logo.png is the dark-on-light mark; this screen is black, so use the white one. */}
      <Image src="/images/logo-w.png" alt="Kaizen Badminton" width={150} height={58} priority style={{ position: "relative", height: "auto" }} />

      <p style={codeStyle}>{code}</p>

      <div style={{ position: "relative" }}>
        <h1 style={titleStyle}>{title}</h1>
        <p style={jpStyle}>{jp}</p>
      </div>

      <p style={descStyle}>{description}</p>

      <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {action}
        <Link href="/" style={errorPrimaryButton}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
