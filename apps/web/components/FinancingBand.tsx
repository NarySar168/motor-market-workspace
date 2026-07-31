import Eyebrow from "./Eyebrow";

// Static financing promo band. Always dark regardless of site theme
// (matches the hero/footer treatment). Deliberately has NO specific
// APR/rate numbers — generic reassurance copy only.
const POINTS = ["All credit welcome", "Soft check, no score impact", "Quick decision"];

const PANEL_ITEMS = [
  "Multiple lenders compared for you",
  "Clear terms, explained plainly",
  "Walk away anytime, no cost",
];

export default function FinancingBand() {
  return (
    <section
      id="financing"
      className="relative overflow-hidden bg-[radial-gradient(120%_130%_at_12%_10%,#1a1e24_0%,#0d0f13_60%,#0a0c0f_100%)] text-slate-100"
    >
      <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-b from-red-800 to-red-500" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 px-4 py-12 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-16">
        <div>
          <Eyebrow>Financing</Eyebrow>
          <h2 className="mt-2 text-[clamp(1.7rem,3.6vw,2.5rem)] font-black uppercase leading-tight tracking-tight text-white">
            Get pre-approved in minutes
          </h2>
          <p className="mt-3 max-w-[48ch] text-slate-300">
            Good credit, bad credit, first-time buyer — we work with multiple lenders to get you behind the wheel.
            No pressure, no obligation.
          </p>
          <div className="mt-5 flex flex-wrap gap-5">
            {POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <span className="font-black text-red-500">✓</span> {point}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-sm font-extrabold text-white transition-colors hover:bg-red-700"
            >
              Apply Now →
            </a>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-slate-700/60 bg-white/[0.04] p-6">
          <h3 className="text-sm font-black uppercase tracking-wide text-white">No Pressure, No Obligation</h3>
          <ul className="mt-4 space-y-3">
            {PANEL_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-0.5 font-black text-red-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
