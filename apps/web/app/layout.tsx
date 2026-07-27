import "./globals.css";
import Link from "next/link";

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
    <html lang="en">
      <body className="bg-slate-50 font-sans">
        
        {/* --- GLOBAL DEALERSHIP HEADER (SHOWS ON EVERY PAGE) --- */}
        {/* 1. Added frosted glass see-through effect here */}
        <header className="w-full bg-white/85 backdrop-blur-md sticky top-0 z-50 shadow-sm flex flex-col border-b border-gray-200/50">
          
          {/* TOP ROW: Branding & Contact (Thinner padding) */}
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-2.5 flex justify-between items-center">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                
                {/* 2. Shrunk container slightly to w-16 h-16 to keep header thin, kept your zoom scale */}
                <div className="w-16 h-16 flex items-center justify-center overflow-visible">
                  <img 
                    src="/logo.png" 
                    alt="NR MotorMarket Logo" 
                    className="w-full h-full object-contain scale-125"
                  />
                </div>
                
                {/* 3. Modern, sleek font style */}
                <div className="flex flex-col leading-none mt-1">
                  <h1 className="text-2xl font-extrabold tracking-tighter text-slate-900">
                    NR <span className="font-light text-slate-500">MotorMarket</span>
                  </h1>
                  <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest mt-1 hidden sm:block">
                    Find your perfect ride.
                  </span>
                </div>
              </Link>
            </div>

            {/* Contact Info (Preserved your local info!) */}
            <div className="flex flex-col items-end justify-center">
              <a href="tel:8881234567" className="text-xl md:text-2xl font-black text-gray-900 hover:text-red-600 transition-colors leading-none">
                (888) 123-4567
              </a>
              <span className="text-xs text-gray-500 font-medium hidden sm:block mt-1">
                📍 Phnom Penh, Cambodia
              </span>
            </div>
          </div>

          {/* BOTTOM ROW: Navigation Links (Red Background) */}
          <div className="w-full bg-red-600">
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
              
              <nav className="flex gap-6 overflow-x-auto py-3">
                <Link href="/" className="font-bold text-sm text-white uppercase tracking-wider hover:text-red-200 whitespace-nowrap transition-colors">
                  Home
                </Link>
                <Link href="#" className="font-bold text-sm text-white uppercase tracking-wider hover:text-red-200 whitespace-nowrap transition-colors">
                  Inventory
                </Link>
                <Link href="#" className="font-bold text-sm text-white uppercase tracking-wider hover:text-red-200 whitespace-nowrap transition-colors">
                  Financing
                </Link>
                <Link href="#" className="font-bold text-sm text-white uppercase tracking-wider hover:text-red-200 whitespace-nowrap transition-colors">
                  About Us
                </Link>
              </nav>

              {/* Admin Link pushed to the right */}
              <div className="hidden sm:flex items-center py-3">
                 <Link href="/admin" className="text-red-200 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                  Admin Access &rarr;
                </Link>
              </div>

            </div>
          </div>
        </header>

        {/* THIS IS WHERE YOUR PAGES RENDER */}
        {children}

      </body>
    </html>
  );
}