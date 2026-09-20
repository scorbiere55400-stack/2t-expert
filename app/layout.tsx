import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "2T Expert | Configurer, diagnostiquer, comprendre", description: "Plateforme technique spécialisée pour les moteurs 2-temps : configurateur, compatibilités, diagnostic et garage numérique.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="fr"><body>{children}</body></html>; }
