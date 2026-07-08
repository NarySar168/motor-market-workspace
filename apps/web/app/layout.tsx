import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Motor Market",
  description: "Find your perfect ride.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        
        {/* GLOBAL TOP NAVIGATION */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-black text-slate-900 tracking-tight">
              Motor<span className="text-blue-600">Market</span>
            </Link>
            
            <div className="flex gap-6 font-bold text-sm text-slate-600 items-center">
              <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                🚗 Feed
              </Link>
              <Link href="/post" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                📷 Post
              </Link>
              <Link href="/admin" className="text-blue-600 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1">
                ⚙️ Admin
              </Link>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT GOES HERE */}
        <div className="flex-grow">
          {children}
        </div>

      </body>
    </html>
  );
}