"use client";

interface NavbarProps {
  title: string;
  langLabel: string;
  onToggleLang: () => void;
}

export default function Navbar({ title, langLabel, onToggleLang }: NavbarProps) {
  return (
    <header className="pointer-events-none fixed inset-x-3 top-[max(10px,env(safe-area-inset-top))] z-[1000] min-[900px]:right-[512px] min-[1280px]:right-[572px] flex items-center justify-between gap-2.5">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/90 py-1.5 pr-3.5 pl-2 shadow-[0_6px_18px_rgba(31,45,77,.16)] backdrop-blur">
        <span className="grid size-[30px] place-items-center rounded-full bg-blue-bg text-base" aria-hidden>🛠️</span>
        <h1 className="text-[1.08rem] font-bold text-brand-deep">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onToggleLang}
        className="pointer-events-auto min-h-10 cursor-pointer rounded-full border-0 bg-white/90 px-4 py-2 text-[.92rem] font-bold text-brand-deep shadow-[0_6px_18px_rgba(31,45,77,.16)] backdrop-blur"
      >
        {langLabel}
      </button>
    </header>
  );
}
