import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import SimpleAppLayout from "@/components/SimpleAppLayout";

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Sponsorship Platform",
  description: "Manage sponsors, events, and sponsorship relationships",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SpeedInsights/>
      <Analytics/>
      <body
        className={`${leagueSpartan.variable} font-sans antialiased`}
      >
        <SimpleAppLayout>
          {children}
        </SimpleAppLayout>
        
      </body>
    </html>
  );
}
