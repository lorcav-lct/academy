import { Row, Column, Text, Section } from "@react-email/components";
import {
  EmailShell,
  Card,
  MicroLabel,
  PrimaryCTA,
  SecondaryCTA,
  Heading,
  BodyText,
  Divider,
  COLORS,
  FONT,
} from "./_shared";

interface OrderCancelledEmailProps {
  userName: string;
  packName: string;
  orderId: string;
  appUrl: string;
}

export function OrderCancelledEmail({
  userName,
  packName,
  orderId,
  appUrl,
}: OrderCancelledEmailProps) {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const firstName = userName?.trim().split(/\s+/)[0] || "";

  return (
    <EmailShell
      appUrl={appUrl}
      preview={`Ordine #${shortId} annullato — ${packName}`}
    >
      {/* Hero */}
      <MicroLabel color={COLORS.danger}>
        Ordine annullato · #{shortId}
      </MicroLabel>
      <Heading size="lg">{firstName ? `Ciao ${firstName},` : "Ciao,"}</Heading>
      <Heading size="md" style={{ color: COLORS.muted, fontWeight: 800 }}>
        il tuo ordine è stato annullato.
      </Heading>
      <BodyText muted style={{ marginTop: "12px" }}>
        Abbiamo annullato l&apos;ordine come richiesto. Se l&apos;avevi pagato,
        l&apos;eventuale rimborso viene gestito direttamente da Stripe sul
        metodo originale entro 5–10 giorni lavorativi.
      </BodyText>

      <div style={{ height: "12px" }} />

      {/* Order summary */}
      <Card accent="danger">
        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ verticalAlign: "baseline" }}>
            <MicroLabel color={COLORS.danger} style={{ marginBottom: 0 }}>
              Ordine annullato
            </MicroLabel>
          </Column>
          <Column align="right" style={{ verticalAlign: "baseline" }}>
            <span style={badgeStyle}>Annullato</span>
          </Column>
        </Row>

        <Text
          style={{
            margin: 0,
            color: COLORS.text,
            fontSize: "16px",
            fontWeight: 800,
            lineHeight: "1.3",
            fontFamily: FONT,
          }}
        >
          {packName}
        </Text>

        <Divider />

        <Row style={{ marginBottom: "6px" }}>
          <Column style={{ verticalAlign: "baseline" }}>
            <Text style={metaLabelStyle}>Riferimento</Text>
          </Column>
          <Column align="right" style={{ verticalAlign: "baseline" }}>
            <Text style={metaValueStyle}>#{shortId}</Text>
          </Column>
        </Row>
        <Row>
          <Column style={{ verticalAlign: "baseline" }}>
            <Text style={metaLabelStyle}>Stato ticket</Text>
          </Column>
          <Column align="right" style={{ verticalAlign: "baseline" }}>
            <Text style={{ ...metaValueStyle, color: COLORS.danger }}>
              Invalidati
            </Text>
          </Column>
        </Row>
      </Card>

      {/* Info card */}
      <Section
        style={{
          background: COLORS.dangerSoft,
          border: `1px solid rgba(185,28,28,0.18)`,
          padding: "18px 22px",
          marginBottom: "16px",
        }}
      >
        <Text
          style={{
            margin: "0 0 6px",
            color: COLORS.danger,
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            fontFamily: FONT,
          }}
        >
          Cosa succede ai tuoi ticket
        </Text>
        <Text
          style={{
            margin: 0,
            color: COLORS.text,
            fontSize: "13px",
            lineHeight: "1.65",
            fontFamily: FONT,
          }}
        >
          I ticket QR collegati a questo ordine sono stati invalidati e non
          consentono più l&apos;accesso ai weekend formativi. Se ritieni si
          tratti di un errore, rispondi a questa email o scrivi a{" "}
          <a
            href="mailto:academy@lacertosus.com"
            style={{ color: COLORS.danger, textDecoration: "underline" }}
          >
            academy@lacertosus.com
          </a>{" "}
          citando il riferimento <strong>#{shortId}</strong>.
        </Text>
      </Section>

      {/* CTA */}
      <Card accent="none">
        <MicroLabel>Riparti quando vuoi</MicroLabel>
        <BodyText style={{ marginBottom: "16px" }}>
          I posti per la prossima edizione sono ancora aperti. Esplora i pack
          oppure dai un&apos;occhiata alle masterclass singole.
        </BodyText>
        <PrimaryCTA href={`${appUrl}/pack`}>Esplora i pack →</PrimaryCTA>
        <SecondaryCTA href={`${appUrl}/masterclass`}>Masterclass</SecondaryCTA>
      </Card>
    </EmailShell>
  );
}

const badgeStyle = {
  display: "inline-block",
  background: COLORS.danger,
  color: COLORS.white,
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  padding: "4px 10px",
  fontFamily: FONT,
};

const metaLabelStyle = {
  margin: 0,
  color: COLORS.muted,
  fontSize: "12px",
  fontFamily: FONT,
};

const metaValueStyle = {
  margin: 0,
  color: COLORS.text,
  fontSize: "13px",
  fontWeight: 700,
  fontFamily: FONT,
};
