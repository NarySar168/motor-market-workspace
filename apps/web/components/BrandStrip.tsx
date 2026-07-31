// Static brand wordmark strip. Decorative only — not linked.
const BRANDS = ["Toyota", "Honda", "BMW", "Lexus", "Ford", "Audi", "Hyundai"];

export default function BrandStrip() {
  return (
    <div className="border-y border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-6 md:gap-x-12 md:px-8">
        {BRANDS.map((brand) => (
          <span
            key={brand}
            className="text-base font-black uppercase tracking-wide text-slate-500 opacity-65 transition-opacity hover:opacity-100 dark:text-slate-400 md:text-lg"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
