import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "客户关系跟进管家",
  description: "协助市场人员高效跟进客户、推进机会的智能管家系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
