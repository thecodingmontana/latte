import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { RootProvider } from "@/providers/root";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const broela = localFont({
  src: "./fonts/Broela.otf",
  variable: "--font-broela",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Latte",
  description: "The personal finance app for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${bricolageGrotesque.variable} ${broela.variable} h-full antialiased`}
      lang="en"
      style={{ fontFamily: "var(--font-bricolage)" }}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
