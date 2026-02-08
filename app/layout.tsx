import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valentine's Day Compatibility Quiz ❤️",
  description: "Find out if you're the perfect match!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-pink-200 via-red-200 to-purple-300">
        {children}
      </body>
    </html>
  );
}
