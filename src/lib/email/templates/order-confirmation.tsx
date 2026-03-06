import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  userName: string;
  packName: string;
  workshops: string[];
  orderTotal: string;
  qrCodes: { courseName: string; qrImageUrl: string }[];
}

export function OrderConfirmationEmail({
  userName,
  packName,
  workshops,
  orderTotal,
  qrCodes,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#020026", fontFamily: "system-ui, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
          {/* Header */}
          <Section style={{ textAlign: "center", marginBottom: "32px" }}>
            <Text style={{ color: "#F09226", fontSize: "12px", letterSpacing: "3px", textTransform: "uppercase" as const, fontWeight: "bold" }}>
              LACERTOSUS ACADEMY
            </Text>
            <Heading style={{ color: "#f5f5f7", fontSize: "28px", margin: "8px 0" }}>
              Conferma Ordine
            </Heading>
          </Section>

          <Hr style={{ borderColor: "rgba(240,146,38,0.2)" }} />

          {/* Greeting */}
          <Section style={{ margin: "24px 0" }}>
            <Text style={{ color: "#f5f5f7", fontSize: "16px" }}>
              Ciao {userName},
            </Text>
            <Text style={{ color: "#8e8e93", fontSize: "14px", lineHeight: "1.6" }}>
              Grazie per aver scelto Lacertosus Academy. Il tuo ordine e stato confermato con successo.
            </Text>
          </Section>

          {/* Order details */}
          <Section style={{ background: "rgba(10,10,58,0.8)", padding: "24px", marginBottom: "24px" }}>
            <Text style={{ color: "#F09226", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, fontWeight: "bold", marginBottom: "12px" }}>
              Riepilogo Ordine
            </Text>
            <Text style={{ color: "#f5f5f7", fontSize: "18px", fontWeight: "bold" }}>
              Pack {packName}
            </Text>
            {workshops.length > 0 && (
              <Text style={{ color: "#8e8e93", fontSize: "13px", marginTop: "8px" }}>
                Workshop selezionati: {workshops.join(", ")}
              </Text>
            )}
            <Hr style={{ borderColor: "rgba(255,255,255,0.05)", margin: "16px 0" }} />
            <Text style={{ color: "#F09226", fontSize: "20px", fontWeight: "bold" }}>
              Totale: {orderTotal}
            </Text>
          </Section>

          {/* QR Codes */}
          {qrCodes.length > 0 && (
            <Section style={{ marginBottom: "24px" }}>
              <Text style={{ color: "#F09226", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, fontWeight: "bold", marginBottom: "16px" }}>
                I Tuoi Ticket
              </Text>
              {qrCodes.map((qr, i) => (
                <Section key={i} style={{ background: "rgba(10,10,58,0.8)", padding: "16px", marginBottom: "8px", textAlign: "center" }}>
                  <Text style={{ color: "#f5f5f7", fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>
                    {qr.courseName}
                  </Text>
                  <Img src={qr.qrImageUrl} width={200} height={200} alt={`QR ${qr.courseName}`} style={{ margin: "0 auto" }} />
                </Section>
              ))}
              <Text style={{ color: "#636366", fontSize: "12px", marginTop: "8px" }}>
                Presenta questi QR code al check-in. Li trovi anche nel tuo account.
              </Text>
            </Section>
          )}

          <Hr style={{ borderColor: "rgba(240,146,38,0.2)" }} />

          {/* Footer */}
          <Section style={{ textAlign: "center", marginTop: "24px" }}>
            <Text style={{ color: "#636366", fontSize: "11px" }}>
              &copy; {new Date().getFullYear()} Lacertosus Academy. Tutti i diritti riservati.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
