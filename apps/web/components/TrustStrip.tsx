// Static trust-promise strip shown directly under the hero carousel.
// Copy matches the approved mockup — five honest, non-numeric promises.
const ITEMS = [
  "Every Vehicle Inspected",
  "Financing · All Credit",
  "24-Hour Cash Offers",
  "Transparent Pricing",
  "Locally Owned · Phnom Penh",
];

export default function TrustStrip() {
  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-around gap-4 px-4 py-4 text-center md:px-8">
        {ITEMS.map((item) => (
          <div key={item} className="flex flex-col items-center gap-1">
            <b className="text-xl font-black text-red-600 dark:text-red-500">✓</b>
            <span className="text-[0.66rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
