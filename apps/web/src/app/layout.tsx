import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const display = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Riflessi d'Auto",
  description: "Novità, schede tecniche e confronto auto in Italia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} bg-bg font-sans text-fg antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
