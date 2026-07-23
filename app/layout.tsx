import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 스마트 설문 제작 플랫폼",
  description: "AI 기반 글로벌 맞춤형 설문 제작 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}