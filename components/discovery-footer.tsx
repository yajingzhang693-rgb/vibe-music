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
      className="overflow-hidden rounded-xl border border-white/25 bg-white/[0.03]"
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
    <footer className="mt-20">
      <MarqueeStrip />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
        <span>© 2026</span>
        <span>Discurse</span>
        <button
          type="button"
          onClick={scrollToTop}
          className="transition hover:text-white"
        >
          Go all the way up
        </button>
      </div>
    </footer>
  );
}
