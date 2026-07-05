import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "לומדים שיווק דיגיטלי",
  description: "מערכת לימוד אישית לשיווק דיגיטלי בעברית — מאפס ועד רמה מקצועית",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
