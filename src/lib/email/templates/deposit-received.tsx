import { Text } from "@react-email/components";
import {
  EmailShell,
  Card,
  MicroLabel,
  Heading,
  BodyText,
  MetaRow,
  PrimaryCTA,
  Divider,
  COLORS,
  FONT,
} from "./_shared";
import { formatDeadline } from "@/lib/settings/deadlines";

interface DepositReceivedEmailProps {
  userName: string;
  packName: string;
  /** Human-readable -500€ balance coupon code. */
  balanceCode: string;
  /** Pre-formatted remaining balance (e.g. "€ 4.400,00"). */
  balanceTotal: string;
  /** ISO date (YYYY-MM-DD) of the balance deadline. */
  balanceDeadline: string;
  appUrl: string;
}

export function DepositReceivedEmail({
  userName,
  packName,
  balanceCode,
  balanceTotal,
  balanceDeadline,
  appUrl,
}: DepositReceivedEmailProps) {
  const firstName = userName?.trim().split(/\s+/)[0] || "";
  const deadline = formatDeadline(balanceDeadline);

  return (
    <EmailShell
      appUrl={appUrl}
      preview={`Caparra ricevuta — completa l'iscrizione a ${packName}`}
    >
      <MicroLabel>Caparra ricevuta</MicroLabel>
      <Heading size="lg">
        {firstName ? `Grazie ${firstName}.` : "Grazie."}
      </Heading>
      <Heading size="md" style={{ color: COLORS.muted, fontWeight: 800 }}>
        Il tuo posto in {packName} è bloccato.
      </Heading>
      <BodyText muted style={{ marginTop: "12px" }}>
        Abbiamo ricevuto la caparra di 500€ (IVA inclusa, non rimborsabile).
        L&apos;iscrizione si attiva — con ticket e accesso — al saldo
        dell&apos;importo rimanente.
      </BodyText>

      <Card accent="orange">
        <MicroLabel>Saldo da versare</MicroLabel>
        <MetaRow label="Importo rimanente" value={balanceTotal} emphasize />
        <Divider />
        <MetaRow label="Pack" value={packName} valueBold />
        <MetaRow label="Entro il" value={deadline} valueBold />
        <Text
          style={{
            margin: "14px 0 0",
            color: COLORS.muted,
            fontSize: "13px",
            lineHeight: "1.6",
            fontFamily: FONT,
          }}
        >
          Il tuo sconto di 500€ (codice{" "}
          <strong style={{ color: COLORS.text }}>{balanceCode}</strong>) è già
          collegato al tuo account: lo trovi applicato automaticamente quando
          completi il saldo. Oltre il {deadline} la caparra non è più valida.
        </Text>
      </Card>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <PrimaryCTA href={`${appUrl}/account/orders`}>
          Completa il saldo
        </PrimaryCTA>
      </div>
    </EmailShell>
  );
}
