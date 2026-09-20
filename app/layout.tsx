import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "2T Expert | Pièces, éclatés et fiches techniques 2 temps", description: "Retrouvez les pièces, vues éclatées 2D et 3D, fiches techniques et échanges communautaires dédiés aux machines deux temps.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="fr"><body>{children}</body></html>; }
