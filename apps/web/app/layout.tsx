import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VISION AI | Centro de control",
  description: "Dashboard operativo de analítica visual en tiempo real",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
