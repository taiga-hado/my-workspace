import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "ハックツ就職コラム | 20代の転職・就職お役立ち情報",
    template: "%s | ハックツ就職コラム",
  },
  description:
    "フリーター・未経験から正社員を目指す20代のための転職・就職情報メディア。ホワイト企業の見つけ方、面接対策、業界研究など役立つ情報を発信します。",
  openGraph: {
    siteName: "ハックツ就職コラム",
    locale: "ja_JP",
    type: "website",
  },
  metadataBase: new URL("https://hakkutu-career.com/column"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
