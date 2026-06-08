"use client";

function ArrowCircleIcon() {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black"
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </span>
  );
}

function MarqueeItem() {
  return (
    <li className="flex shrink-0 items-center gap-8 md:gap-12">
      <span className="whitespace-nowrap text-xl font-normal tracking-tight text-white md:text-2xl">
        TASTE, ARCHIVED
      </span>
      <ArrowCircleIcon />
    </li>
  );
}

const MARQUEE_REPEAT = 6;

function MarqueeStrip() {
  const items = Array.from({ length: MARQUEE_REPEAT }, (_, i) => (
    <MarqueeItem key={i} />
  ));

  return (
    <div
      className="glass-panel overflow-hidden rounded-2xl shadow-soft"
      aria-hidden
    >
      <div className="discovery-marquee-track flex w-max gap-8 md:gap-12">
        <ul className="flex items-center gap-8 py-4 md:gap-12 md:py-5">
          {items}
        </ul>
        <ul className="flex items-center gap-8 py-4 md:gap-12 md:py-5">
          {items}
        </ul>
      </div>
    </div>
  );
}

export function DiscoveryFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-24">
      <MarqueeStrip />
      <div className="hairline mt-6 flex flex-wrap items-center justify-between gap-3 pt-6 text-sm text-muted">
        <span className="font-mono text-xs uppercase tracking-[0.2em]">
          © 2026
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.2em]">
          Discurse
        </span>
        <button
          type="button"
          onClick={scrollToTop}
          className="transition-colors hover:text-foreground"
        >
          回到顶部
        </button>
      </div>
    </footer>
  );
}
