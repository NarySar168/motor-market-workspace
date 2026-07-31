import Eyebrow from "./Eyebrow";

// Static three-card value-prop section. Icons/copy match the approved mockup.
const PROPS = [
  {
    title: "Search Inventory",
    body: "Every vehicle is inspected for reliability before it hits the lot. Browse cars and motorcycles you can trust.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "Visit the Showroom",
    body: "No pressure, no gimmicks. Come see every vehicle in person at our Phnom Penh showroom and take it for a spin.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    title: "Book a Test Drive",
    body: "The best way to decide is to feel it. Reserve a test drive online in under a minute.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3V9l3-4h9l4 4h1a2 2 0 0 1 2 2v6h-3" />
        <circle cx="7.5" cy="17" r="1.6" />
        <circle cx="17.5" cy="17" r="1.6" />
      </svg>
    ),
  },
];

export default function ValueProps() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Eyebrow>Why NR MotorMarket</Eyebrow>
        <h2 className="mt-2 text-[clamp(1.6rem,3.4vw,2.4rem)] font-black uppercase leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          The easiest way to your next ride
        </h2>
      </div>
      <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-4 px-4 md:grid-cols-3 md:px-8">
        {PROPS.map((prop) => (
          <div
            key={prop.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
          >
            <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-red-600 dark:bg-red-500/15 dark:text-red-500">
              {prop.icon}
            </div>
            <h3 className="mb-1.5 text-[1.1rem] font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {prop.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{prop.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
