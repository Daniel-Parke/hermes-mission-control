import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Literata, EB_Garamond, Lora, Merriweather } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const literata = Literata({ variable: "--font-literata", subsets: ["latin"], display: "swap" });
const ebGaramond = EB_Garamond({ variable: "--font-eb-garamond", subsets: ["latin"], display: "swap" });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], display: "swap" });
const merriweather = Merriweather({ variable: "--font-merriweather", weight: ["300", "400", "700"], subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Mission Control | Hermes Agent",
  description: "Monitor, update, and control the essence of your AI agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${literata.variable} ${ebGaramond.variable} ${lora.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-dark-950 text-white">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
