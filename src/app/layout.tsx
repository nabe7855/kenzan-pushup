import AppWrapper from "@/components/AppWrapper";
import { AppProvider } from "@/context/AppContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "研鑽(kenzan)-腕立て",
  description: "次世代プッシュアップ・トラッカー",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} antialiased`}
      >
        <AppProvider>
          <AppWrapper>{children}</AppWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
