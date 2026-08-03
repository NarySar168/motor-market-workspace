import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata = {
  title: "NR MotorMarket",
  description: "Premium Auto Sales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />

        <LanguageProvider>
          {/* --- GLOBAL DEALERSHIP HEADER (SHOWS ON EVERY PAGE) --- */}
          <SiteHeader />

          {/* THIS IS WHERE YOUR PAGES RENDER */}
          {children}

          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
