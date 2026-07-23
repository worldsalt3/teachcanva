import type { Metadata, Viewport } from "next";
import { Sora, Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { AppProvider } from "@/lib/store/app-provider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/* Editorial serif accent — landing page only */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "TeachCanvas — Learn live. Teach live.",
  description:
    "Mobile-first live knowledge platform. Professionals host live cohort and 1:1 sessions on a synced teaching canvas — join, annotate, replay, and earn verified points.",
  manifest: "/manifest.json",
  applicationName: "TeachCanvas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TeachCanvas",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#090d18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${fraunces.variable} antialiased`}
    >
      <body>
        <AppProvider>
          <div className="app-shell">{children}</div>
        </AppProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
