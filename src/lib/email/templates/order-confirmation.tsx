import type { CSSProperties } from "react";
import { Section, Row, Column, Text, Link } from "@react-email/components";
import {
  EmailShell,
  Card,
  MicroLabel,
  SecondaryCTA,
  Heading,
  BodyText,
  COLORS,
  FONT,
} from "./_shared";

interface OrderConfirmationEmailProps {
  userName: string;
  packName: string;
  orderTotal: string;
  orderId: string;
  ticketCount: number;
  appUrl: string;
}

export function OrderConfirmationEmail({
  userName,
  packName,
  orderTotal,
  orderId,
  ticketCount,
  appUrl,
}: OrderConfirmationEmailProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const firstName = userName?.trim().split(/\s+/)[0] || "";
  const ticketCopy =
    ticketCount === 1
      ? "Il tuo ticket QR è pronto nel tuo account."
      : `I tuoi ${ticketCount} ticket QR sono pronti nel tuo account.`;

  return (
    <EmailShell
      appUrl={appUrl}
      preview={`Il tuo ordine #${shortId} è confermato — ${packName}`}
    >
      {/* Hero */}
      <MicroLabel>Ordine confermato · #{shortId}</MicroLabel>
      <Heading size="lg">
        {firstName ? `Grazie ${firstName}.` : "Grazie."}
      </Heading>
      <Heading size="md" style={{ color: COLORS.muted, fontWeight: 800 }}>
        Il tuo posto è confermato.
      </Heading>
      <BodyText muted style={{ marginTop: "12px" }}>
        Abbiamo ricevuto il pagamento e {ticketCopy.toLowerCase()} Mostra il QR
        al check-in di ogni weekend formativo.
      </BodyText>

      <div style={{ height: "12px" }} />

      {/* Wallet pass — moved above summary: it's the hero of the email */}
      {ticketCount > 0 && (
        <>
          <MicroLabel>I tuoi ticket</MicroLabel>
          <WalletPass
            packName={packName}
            ticketCount={ticketCount}
            shortId={shortId}
            href={`${appUrl}/account/tickets`}
          />
          <Text
            style={{
              margin: "8px 0 24px",
              color: COLORS.muted,
              fontSize: "12px",
              lineHeight: "1.55",
              textAlign: "center",
              fontFamily: FONT,
            }}
          >
            Tocca il pass per aprire il QR di check-in. Non serve stamparlo —
            basta mostrarlo dal telefono all&apos;ingresso.
          </Text>
        </>
      )}

      {/* Payment summary — minimal: total + method only.
          Other order details (pack name, edition, order #) are in the wallet pass above. */}
      <Card accent="orange">
        <MicroLabel>Riepilogo pagamento</MicroLabel>

        <Row>
          <Column style={{ verticalAlign: "middle", paddingRight: "16px" }}>
            <Text
              style={{
                margin: 0,
                color: COLORS.muted,
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontFamily: FONT,
              }}
            >
              Totale pagato
            </Text>
            <Text
              style={{
                margin: "4px 0 0",
                color: COLORS.text,
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "-0.025em",
                lineHeight: "1.1",
                fontFamily: FONT,
              }}
            >
              {orderTotal}
            </Text>
            <Text
              style={{
                margin: "2px 0 0",
                color: COLORS.lightMuted,
                fontSize: "11px",
                fontFamily: FONT,
              }}
            >
              IVA inclusa
            </Text>
          </Column>
          <Column align="right" style={{ verticalAlign: "middle" }}>
            <Text
              style={{
                margin: 0,
                color: COLORS.muted,
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontFamily: FONT,
              }}
            >
              Metodo
            </Text>
            <Text
              style={{
                margin: "4px 0 0",
                color: COLORS.text,
                fontSize: "15px",
                fontWeight: 800,
                fontFamily: FONT,
              }}
            >
              Stripe
            </Text>
            <Text
              style={{
                margin: "2px 0 0",
                color: COLORS.orange,
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: FONT,
              }}
            >
              ✓ Confermato
            </Text>
          </Column>
        </Row>
      </Card>

      {/* Next steps */}
      <Card accent="none">
        <MicroLabel>Cosa succede ora</MicroLabel>
        <NextStep
          n={1}
          title="Salva questa email"
          body="Ti serve come prova d'acquisto e contiene i riferimenti del tuo ordine."
        />
        <NextStep
          n={2}
          title="Calendario in arrivo"
          body="Prima di ogni weekend formativo riceverai una email con date, orari e indicazioni operative."
        />
        <NextStep
          n={3}
          title="Tutto sempre nel tuo account"
          body="Ticket, ordini e dettagli del percorso sono accessibili in qualsiasi momento dall'area personale."
          last
        />
        <div style={{ marginTop: "18px", textAlign: "center" }}>
          <SecondaryCTA href={`${appUrl}/account`}>
            Vai al mio account
          </SecondaryCTA>
        </div>
      </Card>

      {/* Trust note */}
      <Section
        style={{
          background: COLORS.bg,
          padding: "16px 20px",
          marginTop: "8px",
        }}
      >
        <Text
          style={{
            margin: 0,
            color: COLORS.muted,
            fontSize: "12px",
            lineHeight: "1.6",
            fontFamily: FONT,
          }}
        >
          <strong style={{ color: COLORS.text }}>14 giorni di recesso</strong> —
          come previsto dal Codice del Consumo, puoi annullare l&apos;ordine
          gratuitamente fino a 14 giorni prima dell&apos;inizio del percorso.
          Per qualsiasi dubbio rispondi a questa email o scrivi a{" "}
          <a
            href="mailto:academy@lacertosus.com"
            style={{ color: COLORS.orange, textDecoration: "underline" }}
          >
            academy@lacertosus.com
          </a>
          .
        </Text>
      </Section>
    </EmailShell>
  );
}

/* ──────────────────────────────────────────────────────────────
   Wallet pass — bold ticket-stub card, fully clickable.
   No fake QR: the pass is a teaser with key info + an unmistakable
   tap-to-open CTA. The real QR lives in the account.
─────────────────────────────────────────────────────────────── */
function WalletPass({
  packName,
  ticketCount,
  shortId,
  href,
}: {
  packName: string;
  ticketCount: number;
  shortId: string;
  href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <Section
        style={{
          marginBottom: "8px",
          background: COLORS.dark,
          border: `1px solid ${COLORS.dark}`,
          boxShadow: "0 12px 32px rgba(0,0,0,0.22)",
        }}
      >
        {/* Top accent strip */}
        <div
          style={{
            height: "4px",
            background: `linear-gradient(90deg, ${COLORS.orange} 0%, rgba(240,146,38,0.3) 60%, rgba(240,146,38,0.05) 100%)`,
          }}
        />

        {/* Hero — dark band with brand label + ticket chip */}
        <div style={{ padding: "24px 26px 8px" }}>
          <Row>
            <Column style={{ verticalAlign: "middle" }}>
              <Text
                style={{
                  margin: 0,
                  color: COLORS.orange,
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  fontFamily: FONT,
                }}
              >
                Lacertosus · Wallet
              </Text>
            </Column>
            <Column align="right" style={{ verticalAlign: "middle" }}>
              <span
                style={{
                  display: "inline-block",
                  background: COLORS.orange,
                  color: COLORS.dark,
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  padding: "5px 11px",
                  fontFamily: FONT,
                }}
              >
                {ticketCount} {ticketCount === 1 ? "Ticket" : "Ticket"}
              </span>
            </Column>
          </Row>

          <Text
            style={{
              margin: "20px 0 6px",
              color: COLORS.white,
              fontSize: "30px",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: "1.1",
              fontFamily: FONT,
              textTransform: "uppercase",
            }}
          >
            {packName}
          </Text>
          <Text
            style={{
              margin: "0 0 22px",
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px",
              fontFamily: FONT,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Edizione 2026 / 27
          </Text>
        </div>

        {/* Stats grid — three columns, monospace ticket info */}
        <div style={{ padding: "0 26px 22px" }}>
          <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            width="100%"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <tbody>
              <tr>
                <td style={statCell}>
                  <div style={statLabel}>Ordine</div>
                  <div style={statValue}>#{shortId}</div>
                </td>
                <td
                  style={{
                    ...statCell,
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={statLabel}>Pass</div>
                  <div style={statValue}>
                    {String(ticketCount).padStart(2, "0")}
                  </div>
                </td>
                <td
                  style={{
                    ...statCell,
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={statLabel}>Stato</div>
                  <div style={{ ...statValue, color: COLORS.orange }}>
                    Attivo
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Perforation — dashed divider with "punched" notches feel */}
        <div
          style={{
            height: "12px",
            background: COLORS.dark,
            borderTop: "1px dashed rgba(255,255,255,0.22)",
          }}
        />

        {/* CTA bar — orange, full-width "tap" */}
        <div
          style={{
            background: COLORS.orange,
            padding: "18px 26px",
          }}
        >
          <Row>
            <Column style={{ verticalAlign: "middle" }}>
              <Text
                style={{
                  margin: 0,
                  color: COLORS.dark,
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  fontFamily: FONT,
                  opacity: 0.7,
                }}
              >
                Tocca per aprire
              </Text>
              <Text
                style={{
                  margin: "2px 0 0",
                  color: COLORS.dark,
                  fontSize: "18px",
                  fontWeight: 900,
                  letterSpacing: "-0.01em",
                  fontFamily: FONT,
                }}
              >
                Visualizza il QR di check-in
              </Text>
            </Column>
            <Column
              align="right"
              style={{ verticalAlign: "middle", width: "56px" }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: COLORS.dark,
                  color: COLORS.orange,
                  width: "40px",
                  height: "40px",
                  lineHeight: "40px",
                  textAlign: "center" as const,
                  fontSize: "22px",
                  fontWeight: 900,
                  fontFamily: FONT,
                }}
              >
                →
              </span>
            </Column>
          </Row>
        </div>
      </Section>
    </Link>
  );
}

const statCell: CSSProperties = {
  padding: "14px 8px",
  textAlign: "center",
  verticalAlign: "middle",
};

const statLabel: CSSProperties = {
  color: "rgba(255,255,255,0.45)",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  fontFamily: FONT,
  marginBottom: "4px",
};

const statValue: CSSProperties = {
  color: COLORS.white,
  fontSize: "18px",
  fontWeight: 900,
  letterSpacing: "-0.01em",
  fontFamily: FONT,
};

function NextStep({
  n,
  title,
  body,
  last = false,
}: {
  n: number;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <Row style={{ marginBottom: last ? 0 : "14px" }}>
      <Column
        style={{
          verticalAlign: "top",
          width: "36px",
          paddingRight: "12px",
        }}
      >
        <div
          style={{
            background: COLORS.orange,
            color: COLORS.dark,
            width: "24px",
            height: "24px",
            lineHeight: "24px",
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 900,
            fontFamily: FONT,
          }}
        >
          {n}
        </div>
      </Column>
      <Column style={{ verticalAlign: "top" }}>
        <Text
          style={{
            margin: "0 0 2px",
            color: COLORS.text,
            fontSize: "14px",
            fontWeight: 800,
            fontFamily: FONT,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            margin: 0,
            color: COLORS.muted,
            fontSize: "13px",
            lineHeight: "1.55",
            fontFamily: FONT,
          }}
        >
          {body}
        </Text>
      </Column>
    </Row>
  );
}
