import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Link,
  Button,
} from "@react-email/components";

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
  return (
    <Html lang="it">
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ textAlign: "center", paddingBottom: "24px" }}>
            <Text style={styles.brand}>LACERTOSUS ACADEMY</Text>
            <Heading style={styles.heading}>Ordine Confermato</Heading>
            <Text style={styles.subheading}>
              Grazie per il tuo acquisto, {userName}.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Order summary */}
          <Section style={styles.card}>
            <Text style={styles.label}>Riepilogo Ordine</Text>
            <Text style={styles.productName}>{packName}</Text>
            <Hr style={styles.innerDivider} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text style={styles.meta}>
                Ordine #{orderId.slice(0, 8).toUpperCase()}
              </Text>
              <Text style={styles.price}>{orderTotal}</Text>
            </div>
          </Section>

          {/* Ticket notice */}
          {ticketCount > 0 && (
            <Section style={styles.card}>
              <Text style={styles.label}>I Tuoi Ticket</Text>
              <Text style={styles.bodyText}>
                {ticketCount === 1
                  ? "Il tuo ticket con QR code è disponibile nel tuo account."
                  : `I tuoi ${ticketCount} ticket con QR code sono disponibili nel tuo account.`}{" "}
                Presentali al check-in per accedere ai corsi e workshop.
              </Text>
              <Button href={`${appUrl}/account/tickets`} style={styles.button}>
                Vedi i miei Ticket →
              </Button>
            </Section>
          )}

          {/* CTA */}
          <Section style={{ textAlign: "center", padding: "8px 0 24px" }}>
            <Text style={styles.bodyText}>
              Tieni d&apos;occhio il tuo account per tutti gli aggiornamenti sul
              percorso.
            </Text>
            <Button href={`${appUrl}/account`} style={styles.buttonSecondary}>
              Il mio Account
            </Button>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={{ textAlign: "center", paddingTop: "16px" }}>
            <Text style={styles.footer}>
              Hai domande?{" "}
              <Link href={`${appUrl}`} style={{ color: "#F09226" }}>
                Visita il sito
              </Link>{" "}
              oppure rispondi a questa email.
            </Text>
            <Text style={styles.footer}>
              © {new Date().getFullYear()} Lacertosus Academy. Tutti i diritti
              riservati.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#1a1a1a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: "0",
    padding: "0",
  },
  container: {
    maxWidth: "580px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  brand: {
    color: "#F09226",
    fontSize: "11px",
    letterSpacing: "4px",
    textTransform: "uppercase" as const,
    fontWeight: "bold",
    margin: "0 0 8px",
  },
  heading: {
    color: "#f5f5f7",
    fontSize: "30px",
    fontWeight: "900",
    margin: "0 0 8px",
  },
  subheading: {
    color: "#8e8e93",
    fontSize: "15px",
    margin: "0",
  },
  divider: {
    borderColor: "rgba(240,146,38,0.15)",
    margin: "0 0 24px",
  },
  innerDivider: {
    borderColor: "rgba(255,255,255,0.05)",
    margin: "12px 0",
  },
  card: {
    backgroundColor: "rgba(10,10,58,0.9)",
    border: "1px solid rgba(240,146,38,0.15)",
    padding: "20px 24px",
    marginBottom: "16px",
  },
  label: {
    color: "#F09226",
    fontSize: "10px",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    fontWeight: "bold",
    margin: "0 0 10px",
  },
  productName: {
    color: "#f5f5f7",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0",
  },
  price: {
    color: "#F09226",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0",
  },
  meta: {
    color: "#636366",
    fontSize: "12px",
    margin: "0",
  },
  bodyText: {
    color: "#8e8e93",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  },
  button: {
    backgroundColor: "#F09226",
    color: "#1a1a1a",
    fontSize: "13px",
    fontWeight: "bold",
    padding: "12px 24px",
    textDecoration: "none",
    display: "inline-block",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    border: "1px solid rgba(240,146,38,0.4)",
    color: "#F09226",
    fontSize: "13px",
    fontWeight: "bold",
    padding: "10px 24px",
    textDecoration: "none",
    display: "inline-block",
  },
  footer: {
    color: "#48484a",
    fontSize: "11px",
    margin: "4px 0",
  },
};
