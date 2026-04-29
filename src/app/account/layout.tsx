import type { Metadata } from "next";
import { AccountShell } from "./_components/account-shell";

export const metadata: Metadata = {
  title: "Area Riservata",
  description:
    "Area riservata Lacertosus Academy: gestisci profilo, ordini e ticket dei tuoi corsi.",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountShell>{children}</AccountShell>;
}
