/**
 * Shared building blocks for transactional emails.
 * Style language matches /checkout and /conferma:
 *   - squared corners, bold typography, orange accent (#F09226), dark brand bar
 *   - light body bg for inbox readability (Stripe/Apple/Linear pattern)
 *   - inline styles only (Outlook + Gmail safe)
 */
import type { CSSProperties, ReactNode } from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Img,
  Preview,
} from "@react-email/components";

/* ──────────────────────────────────────────────────────────────
   Tokens
─────────────────────────────────────────────────────────────── */
export const COLORS = {
  orange: "#F09226",
  orangeSoft: "rgba(240,146,38,0.08)",
  orangeStrong: "rgba(240,146,38,0.32)",
  dark: "#1a1a1a",
  darkSoft: "#26262a",
  white: "#ffffff",
  bg: "#f5f5f5",
  surface: "#ffffff",
  border: "#e6e6e6",
  borderStrong: "#d4d4d4",
  text: "#0f0f12",
  muted: "#5f6066",
  lightMuted: "#8a8b91",
  danger: "#b91c1c",
  dangerSoft: "rgba(185,28,28,0.08)",
} as const;

export const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/* ──────────────────────────────────────────────────────────────
   Email shell
─────────────────────────────────────────────────────────────── */
export function EmailShell({
  preview,
  appUrl,
  children,
}: {
  preview: string;
  appUrl: string;
  children: ReactNode;
}) {
  return (
    <Html lang="it">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={shellStyles.body}>
        <Container style={shellStyles.container}>
          {/* Brand bar — dark with white "ACADEMY" wordmark.
              Width-driven sizing: 80% of container, max 460px. Height auto. */}
          <Section style={shellStyles.brandBar}>
            <Img
              src={`${appUrl}/scritta-academy.svg`}
              alt="Lacertosus Academy"
              width={460}
              style={shellStyles.brandLogo}
            />
          </Section>
          {/* Orange accent strip */}
          <div style={shellStyles.accentStrip} />

          {/* Body card */}
          <Section style={shellStyles.bodyCard}>{children}</Section>

          {/* Footer */}
          <Section style={shellStyles.footer}>
            <Img
              src={`${appUrl}/logo.svg`}
              alt="Lacertosus Academy"
              height={42}
              style={shellStyles.footerLogo}
            />
            <Text style={shellStyles.footerText}>
              Hai bisogno di aiuto? Scrivici a{" "}
              <Link
                href="mailto:academy@lacertosus.com"
                style={shellStyles.footerLink}
              >
                academy@lacertosus.com
              </Link>
              .
            </Text>
            <Text style={shellStyles.footerText}>
              <Link href={appUrl} style={shellStyles.footerLink}>
                academylacertosus.com
              </Link>
              {" · "}© {new Date().getFullYear()} Lacertosus Academy
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ──────────────────────────────────────────────────────────────
   Building blocks
─────────────────────────────────────────────────────────────── */
export function MicroLabel({
  children,
  color = COLORS.orange,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <Text
      style={{
        ...microLabelStyle,
        color,
        ...style,
      }}
    >
      — {children}
    </Text>
  );
}

export function Card({
  children,
  accent = "orange",
  style,
}: {
  children: ReactNode;
  accent?: "orange" | "danger" | "none";
  style?: CSSProperties;
}) {
  const topColor =
    accent === "orange"
      ? COLORS.orange
      : accent === "danger"
        ? COLORS.danger
        : "transparent";
  return (
    <Section
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderTop:
          accent === "none"
            ? `1px solid ${COLORS.border}`
            : `2px solid ${topColor}`,
        marginBottom: "16px",
        ...style,
      }}
    >
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </Section>
  );
}

export function MetaRow({
  label,
  value,
  valueBold = false,
  emphasize = false,
}: {
  label: string;
  value: string;
  valueBold?: boolean;
  emphasize?: boolean;
}) {
  return (
    <Row style={{ marginBottom: "6px" }}>
      <Column style={{ verticalAlign: "baseline" }}>
        <Text
          style={{
            margin: 0,
            color: COLORS.muted,
            fontSize: emphasize ? "11px" : "13px",
            letterSpacing: emphasize ? "3px" : "0",
            textTransform: emphasize ? "uppercase" : "none",
            fontWeight: emphasize ? 800 : 500,
            fontFamily: FONT,
          }}
        >
          {label}
        </Text>
      </Column>
      <Column align="right" style={{ verticalAlign: "baseline" }}>
        <Text
          style={{
            margin: 0,
            color: emphasize ? COLORS.text : COLORS.text,
            fontSize: emphasize ? "20px" : "14px",
            fontWeight: emphasize ? 900 : valueBold ? 700 : 500,
            fontFamily: FONT,
            letterSpacing: emphasize ? "-0.02em" : "0",
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  );
}

export function PrimaryCTA({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} style={primaryCtaStyle}>
      {children}
    </Link>
  );
}

export function SecondaryCTA({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} style={secondaryCtaStyle}>
      {children}
    </Link>
  );
}

export function Heading({
  children,
  size = "lg",
  style,
}: {
  children: ReactNode;
  size?: "lg" | "md" | "sm";
  style?: CSSProperties;
}) {
  const sizes = {
    lg: { fontSize: "30px", lineHeight: "1.1" },
    md: { fontSize: "20px", lineHeight: "1.25" },
    sm: { fontSize: "16px", lineHeight: "1.35" },
  } as const;
  return (
    <Text
      style={{
        margin: "0 0 8px",
        color: COLORS.text,
        fontWeight: 900,
        letterSpacing: "-0.02em",
        fontFamily: FONT,
        ...sizes[size],
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export function BodyText({
  children,
  muted = false,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: CSSProperties;
}) {
  return (
    <Text
      style={{
        margin: "0 0 12px",
        color: muted ? COLORS.muted : COLORS.text,
        fontSize: "14px",
        lineHeight: "1.6",
        fontFamily: FONT,
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export function Divider() {
  return (
    <div
      style={{
        height: "1px",
        background: COLORS.border,
        margin: "16px 0",
      }}
    />
  );
}

/* ──────────────────────────────────────────────────────────────
   Internal styles
─────────────────────────────────────────────────────────────── */
const shellStyles = {
  body: {
    backgroundColor: COLORS.bg,
    fontFamily: FONT,
    margin: 0,
    padding: 0,
  } as CSSProperties,
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "32px 16px",
  } as CSSProperties,
  brandBar: {
    background: COLORS.dark,
    padding: "36px 24px",
    textAlign: "center" as const,
  } as CSSProperties,
  brandLogo: {
    display: "block",
    margin: "0 auto",
    width: "80%",
    maxWidth: "460px",
    height: "auto",
  } as CSSProperties,
  accentStrip: {
    height: "3px",
    background: `linear-gradient(90deg, ${COLORS.orange} 0%, rgba(240,146,38,0.05) 100%)`,
  } as CSSProperties,
  bodyCard: {
    background: COLORS.surface,
    padding: "32px 24px",
    border: `1px solid ${COLORS.border}`,
    borderTop: "none",
  } as CSSProperties,
  footer: {
    background: COLORS.dark,
    padding: "28px 24px",
    textAlign: "center" as const,
    marginTop: 0,
  } as CSSProperties,
  footerLogo: {
    display: "block",
    margin: "0 auto 16px",
    height: "42px",
    width: "auto",
    maxWidth: "100%",
    opacity: 0.85,
  } as CSSProperties,
  footerText: {
    margin: "4px 0",
    color: "#9ca3af",
    fontSize: "12px",
    lineHeight: "1.6",
    fontFamily: FONT,
  } as CSSProperties,
  footerLink: {
    color: COLORS.orange,
    textDecoration: "none",
    fontWeight: 700,
  } as CSSProperties,
};

const microLabelStyle: CSSProperties = {
  margin: "0 0 12px",
  color: COLORS.orange,
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontFamily: FONT,
};

const primaryCtaStyle: CSSProperties = {
  display: "inline-block",
  background: COLORS.orange,
  color: COLORS.dark,
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "14px 26px",
  textDecoration: "none",
  fontFamily: FONT,
};

const secondaryCtaStyle: CSSProperties = {
  display: "inline-block",
  background: "transparent",
  color: COLORS.text,
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "12px 22px",
  textDecoration: "none",
  border: `1px solid ${COLORS.borderStrong}`,
  fontFamily: FONT,
  marginLeft: "8px",
};
