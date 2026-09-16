import type { Metadata } from "next";
import "./globals.css";
import "./proof.css";
import "./upgrade.css";
import "./return.css";
import "./monitor-v2.css";
import "./sponsors-live.css";
import "../comic.css";

export const metadata: Metadata = {
  title: "Sponsor My Screens",
  description: "Put your SaaS on my screen, every day.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
