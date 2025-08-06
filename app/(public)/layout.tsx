import { PublicLayoutWrapper } from "@/components/auth/publicLayout";
import "@/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayoutWrapper>{children}</PublicLayoutWrapper>;
}
