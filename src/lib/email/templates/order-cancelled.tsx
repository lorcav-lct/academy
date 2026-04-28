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
  return (
    <Html lang="it">
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={{ textAlign: "center", paddingBottom: "24px" }}>
            <Text style={styles.brand}>LACERTOSUS ACADEMY</Text>
            <Heading style={styles.heading}>Ordine Annullato</Heading>
            <Text style={styles.subheading}>
              Ciao {userName}, il tuo ordine è stato annullato.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Order summary */}
          <Section style={styles.card}>
            <Text style={styles.label}>Ordine Annullato</Text>
            <Text style={styles.productName}>{packName}</Text>
            <Hr style={styles.innerDivider} />
            <Text style={styles.meta}>
              Ordine #{orderId.slice(0, 8).toUpperCase()}
            </Text>
          </Section>

          {/* Info */}
          <Section style={styles.infoCard}>
            <Text style={styles.infoText}>
              I ticket associati a questo ordine sono stati invalidati. Se
              ritieni che si tratti di un errore, contattaci rispondendo a
              questa email.
            </Text>
          </Section>

          {/* CTA */}
          <Section style={{ textAlign: "center", padding: "8px 0 24px" }}>
            <Text style={styles.bodyText}>
              Puoi effettuare un nuovo acquisto in qualsiasi momento.
            </Text>
            <Button href={`${appUrl}/pack`} style={styles.button}>
              Acquista un Pack →
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
    border: "1px solid rgba(220,38,38,0.2)",
    padding: "20px 24px",
    marginBottom: "16px",
  },
  infoCard: {
    backgroundColor: "rgba(220,38,38,0.05)",
    border: "1px solid rgba(220,38,38,0.15)",
    padding: "16px 24px",
    marginBottom: "24px",
  },
  label: {
    color: "#f87171",
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
    textAlign: "center" as const,
  },
  infoText: {
    color: "#8e8e93",
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "0",
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
  footer: {
    color: "#48484a",
    fontSize: "11px",
    margin: "4px 0",
  },
};
