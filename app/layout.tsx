import "@/styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import clsx from "clsx";
import SessionWatcher from "../components/layout/sessionWatcher";

export const metadata: Metadata = {
  title: "BMS",
  description: "Business Management System for Avolution!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={clsx("font-sans antialiased", fontSans.className)}>
        <Providers>
          <SessionWatcher />
          {children}
        </Providers>
      </body>
    </html>
  );
}
