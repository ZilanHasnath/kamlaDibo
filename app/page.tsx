"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { SPOTS } from "../data/spots";
import type { Coords, Lang, SpotWithDistance } from "../types/spot";
import Navbar from "../components/Navbar";

const SpotMap = dynamic(() => import("../components/SpotMap"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 grid place-items-center bg-[#e3e9f3] text-muted">…</div>,
});

const T: Record<Lang, Record<string, any>> = {
    bn: {
        title: "কামলা দিবো",
        menu: "মেনু",
        nearby: "নিকটবর্তী জমায়েতের জায়গা খুঁজুন",
        nearbySub: "",
        manual: "Pick manually",
        manualBn: "নিজে বেছে নিন",
        manualSub: "ঢাকার সব নির্ধারিত জায়গা",
        find: "ক্লিক করুন",
        findHint: "লোকেশন অন করে এই বাটনে ক্লিক করুন",
        finding: "খুঁজছি…",
        refresh: "আবার খুঁজুন",
        denied: "লোকেশন পাওয়া যায়নি। অনুমতি দিন, অথবা নিচ থেকে নিজে বেছে নিন।",
        unsupported: "এই ডিভাইসে লোকেশন সাপোর্ট নেই।",
        nearest: "সবচেয়ে কাছের",
        selected: "আপনার বেছে নেওয়া",
        distance: "দূরত্ব",
        km: "কিমি",
        min: "মিনিট",
        hr: "ঘণ্টা",
        more: "কাছের আরও জায়গা",
        time: "সাধারণত সকাল ৬টা - ৯টা",
        go: "রাস্তা দেখুন",
        showcase: "এক নজরে",
        count: "টি জায়গা",
        notice: "আইটি সেক্টরে চাকরি সংকট । তাই বেকার বসে না থেকে কামলা দিয়ে অর্থ উপার্জন করুন। কামলা দেওয়ার জন্য উক্ত জায়গাগুলোতে সকাল-সকাল কোদাল-সাবল সাথে নিয়ে বসে থাকুন, রিক্রুটার এসে আপনাকে কাজে নিয়ে যাবে। কাজ শেষে নিজ দায়িত্বে নগদ অর্থ বুঝে নিন।",
        note: "Locations and times are approximate. Please confirm before you go.",
        developer: "zilan",
        lang: "English",
        modes: { car: "গাড়ি", bike: "সাইকেল", bus: "বাস", walk: "হেঁটে" },
        away: "দূরে",
    },
    en: {
        title: "কামলা দিবো",
        menu: "Menu",
        nearby: "Nearby places",
        nearbySub: "The gathering spot closest to you",
        manual: "Pick manually",
        manualBn: "",
        manualSub: "All fixed spots in Dhaka",
        find: "Find spots near me",
        findHint: "Turn on location to see the nearest spot and travel times.",
        finding: "Locating…",
        refresh: "Locate again",
        denied: "Could not get your location. Allow permission, or pick a spot below.",
        unsupported: "Location is not supported on this device.",
        nearest: "Nearest",
        selected: "Your pick",
        distance: "Distance",
        km: "km",
        min: "min",
        hr: "hr",
        more: "More nearby",
        time: "Usually 6 AM - 9 AM",
        go: "Get directions",
        showcase: "At a glance",
        count: " spots",
        notice: "আইটি সেক্টরে চাকরি সংকট । তাই বেকার বসে না থেকে কামলা দিয়ে অর্থ উপার্জন করুন। কামলা দেওয়ার জন্য উক্ত জায়গাগুলোতে সকাল সকাল কোদাল-সাবল সাথে নিয়ে বসে থাকুন রিক্রুটার এসে আপনাকে কাজে নিয়ে যাবে। কাজ শেষে নিজ দায়িত্বে নগদ অর্থ বুঝে নিন।",
        note: "Locations and times are approximate. Please confirm before you go.",
        developer: "zilan",
        lang: "বাংলা",
        modes: { car: "Car", bike: "Bicycle", bus: "Bus", walk: "Walk" },
        away: "away",
    },
};

type Tone = "blue" | "yellow" | "red" | "cyan";
type Mode = "car" | "bike" | "bus" | "walk";

const MODES: { id: Mode; speed: number; tone: Tone }[] = [
    { id: "car", speed: 18, tone: "blue" },
    { id: "bike", speed: 11, tone: "yellow" },
    { id: "bus", speed: 14, tone: "red" },
    { id: "walk", speed: 4.5, tone: "cyan" },
];
const ROAD = 1.35;
const TONES: Tone[] = ["blue", "yellow", "red", "cyan"];
const TONE: Record<Tone, string> = {
    blue: "bg-blue-bg text-blue-fg",
    yellow: "bg-yellow-bg text-yellow-fg",
    red: "bg-red-bg text-red-fg",
    cyan: "bg-cyan-bg text-cyan-fg",
};
const TONE_BORDER: Record<Tone, string> = {
    blue: "border-blue-fg",
    yellow: "border-yellow-fg",
    red: "border-red-fg",
    cyan: "border-cyan-fg",
};

function Spin({ light }: { light?: boolean }) {
    return (
        <span
            className={`inline-block size-5 animate-rot rounded-full border-[3px] ${
                light ? "border-white/35 border-t-white" : "border-blue-bg border-t-brand"
            }`}
        />
    );
}

const PHOTOS = [
    { id: "p1", src: "https://protidinerbangladesh.com/uploads/2022/09/online/photos/rupganj-632e9a08eab81.jpg" },
    { id: "p2", src: "https://www.kalbela.com/assets/news_photos/2024/07/09/image_102692_1720499759.webp" },
];

function Ico({ name }: { name: string }) {
    const p: React.SVGProps<SVGSVGElement> = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
    switch (name) {
        case "car":
            return (<svg {...p}><path d="M5 16V11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11v5" /><path d="M3.5 16h17v2.5a1 1 0 0 1-1 1H18a1 1 0 0 1-1-1V18H7v.5a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V16z" /><circle cx="7.5" cy="13.5" r=".6" fill="currentColor" /><circle cx="16.5" cy="13.5" r=".6" fill="currentColor" /><path d="M5.5 11h13" /></svg>);
        case "bike":
            return (<svg {...p}><circle cx="5.5" cy="16" r="3.5" /><circle cx="18.5" cy="16" r="3.5" /><path d="M5.5 16 9 8h4l3 8M9 8 7.8 5.5H6M13 8l-1.6 5H8.5" /></svg>);
        case "bus":
            return (<svg {...p}><rect x="4.5" y="3.5" width="15" height="14" rx="3" /><path d="M4.5 11h15M8 20.5v-3M16 20.5v-3" /><circle cx="8.3" cy="14.3" r=".7" fill="currentColor" /><circle cx="15.7" cy="14.3" r=".7" fill="currentColor" /></svg>);
        case "walk":
            return (<svg {...p}><circle cx="13" cy="4.5" r="1.7" /><path d="m9.5 21 2-6.5-2.5-2.5 1.2-4.5 3.3-.5 2 3 3 1M11 9.5 8.5 11 7 14" /><path d="m13 14.5 1.5 2.5 1 4" /></svg>);
        case "pin":
            return (<svg {...p}><path d="M12 21s-7-6.2-7-11.2A7 7 0 0 1 19 9.8C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.8" r="2.4" /></svg>);
        case "nav":
            return (<svg {...p}><path d="M20.5 3.5 3.8 10.6a.8.8 0 0 0 .1 1.5l6.3 2.2 2.2 6.3a.8.8 0 0 0 1.5.1z" fill="currentColor" /></svg>);
        case "clock":
            return (<svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>);
        case "refresh":
            return (<svg {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></svg>);
        default:
            return null;
    }
}

function dist(a: Coords, b: Coords): number {
    const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
}

function Showcase({ title }: { title: string }) {
    const [failed, setFailed] = useState<Record<string, boolean>>({});
    const items = PHOTOS.filter((p) => !failed[p.id]);
    if (items.length === 0) return null;
    return (
        <section className="mt-[26px]">
            <h2 className="mx-0.5 mb-2.5 text-[1.1rem] font-bold">{title}</h2>
            <div className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-2">
                {items.map((p) => (
                    <figure className="m-0 overflow-hidden rounded-[20px] bg-[#dbe3ee]" key={p.id}>
                        <img className="block aspect-[16/10] w-full object-cover" src={p.src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed((f) => ({ ...f, [p.id]: true }))} />
                    </figure>
                ))}
            </div>
        </section>
    );
}

export default function Home() {
    const [lang, setLang] = useState<Lang>("bn");
    const [user, setUser] = useState<Coords | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ok" | "denied" | "unsupported">("idle");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const t = T[lang];
    const bn = lang === "bn";

    const spots = useMemo<SpotWithDistance[]>(
        () => SPOTS.map((s) => ({ ...s, d: user ? dist(user, s) : null })),
        [user]
    );
    const byDistance = useMemo(() => (user ? [...spots].sort((a, b) => (a.d ?? 0) - (b.d ?? 0)) : []), [spots, user]);
    const nearest = byDistance[0];
    const active = spots.find((s) => s.id === selectedId) || nearest || null;

    const locate = () => {
        if (!navigator.geolocation) return setStatus("unsupported");
        setStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (p) => {
                const u = { lat: p.coords.latitude, lng: p.coords.longitude };
                setUser(u);
                setStatus("ok");
                const n = SPOTS.map((s) => ({ id: s.id, d: dist(u, s) })).sort((a, b) => a.d - b.d)[0];
                setSelectedId(n.id);
            },
            () => setStatus("denied"),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const pick = useCallback((id: string) => {
        setSelectedId(id);
        if (typeof window !== "undefined" && window.matchMedia("(max-width: 899px)").matches) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const num = (n: number) => (bn ? n.toLocaleString("bn-BD") : String(n));
    const fmt = (n: number) => (bn ? n.toLocaleString("bn-BD", { maximumFractionDigits: 1 }) : n.toFixed(1));
    const minutes = (d: number, speed: number) => Math.max(1, Math.round(((d * ROAD) / speed) * 60));
    const dur = (m: number) => {
        if (m < 60) return `${num(m)} ${t.min}`;
        const h = Math.floor(m / 60), r = m % 60;
        return r ? `${num(h)} ${t.hr} ${num(r)} ${t.min}` : `${num(h)} ${t.hr}`;
    };
    const loading = status === "loading";
    const isNearest = active && nearest && active.id === nearest.id;
    const more = byDistance.filter((s) => !active || s.id !== active.id).slice(0, 2);
    const name = (s: SpotWithDistance) => (bn ? s.bn : s.en);

    const iconBtn = "grid size-11 cursor-pointer place-items-center rounded-full border-0 bg-blue-bg text-blue-fg disabled:cursor-progress disabled:opacity-70";

    return (
        <div className="min-h-dvh min-[900px]:grid min-[900px]:h-dvh min-[900px]:grid-cols-[minmax(0,1fr)_500px] min-[900px]:overflow-hidden min-[1280px]:grid-cols-[minmax(0,1fr)_560px]">
            <Navbar title={t.title} langLabel={t.lang} onToggleLang={() => setLang(bn ? "en" : "bn")} />
            <div className="sticky isolate z-0 top-0 h-[44dvh] min-h-[280px] min-[600px]:h-[48dvh] min-[900px]:relative min-[900px]:h-full min-[900px]:min-h-0">
                <div className="absolute inset-0 bg-[#e3e9f3]">
                    <SpotMap spots={spots} selectedId={active ? active.id : null} onSelect={pick} user={user} lang={lang} />
                </div>
            </div>

            <main className="relative z-[2] -mt-[26px] min-h-[calc(56dvh+26px)] rounded-t-[28px] bg-white px-4 pt-2 pb-7 shadow-[0_-10px_30px_rgba(31,45,77,.12)] min-[600px]:px-7 min-[600px]:pb-8 min-[900px]:mt-0 min-[900px]:h-full min-[900px]:min-h-0 min-[900px]:overflow-y-auto min-[900px]:rounded-none min-[900px]:pt-4 min-[900px]:shadow-[-10px_0_30px_rgba(31,45,77,.1)]">
                <div className="mx-auto mt-1 mb-2.5 h-[5px] w-11 rounded-full bg-[#d7dcea] min-[900px]:hidden" aria-hidden />
                <div className="mb-1.5 flex items-center justify-between">
                    <h2 className="text-[1.15rem] font-bold text-brand-deep">{t.menu}</h2>
                    <button className={iconBtn} onClick={locate} disabled={loading} aria-label={t.refresh} title={t.refresh}>
                        {loading ? <Spin /> : <Ico name="refresh" />}
                    </button>
                </div>

                {(status === "denied" || status === "unsupported") && (
                    <p className="my-1.5 rounded-[14px] border border-[#fde2a8] bg-[#fff7e6] px-3.5 py-[11px] text-[.94rem] text-[#7a5a00]" role="status">
                        {status === "denied" ? t.denied : t.unsupported}
                    </p>
                )}

                <section className="mt-1.5 rounded-[26px] border border-[#e0e8fb] bg-linear-to-b from-[#f5f8ff] to-[#eef3ff] px-3.5 pt-1.5 pb-4" aria-labelledby="nearby-h">
                    <div className="mx-0.5 mt-3.5 mb-3">
                        <h3 id="nearby-h" className="text-[1.28rem] leading-tight font-bold">{t.nearby}</h3>
                        {t.nearbySub && <p className="mt-0.5 text-[.92rem] text-muted">{t.nearbySub}</p>}
                    </div>

                    {!active ? (
                        <div className="grid justify-items-center gap-3.5 px-1.5 pt-2 pb-1 text-center">
                            <div className="grid size-16 place-items-center rounded-full bg-white text-alert shadow-[0_8px_20px_rgba(229,25,91,.18)] [&_svg]:size-8"><Ico name="pin" /></div>
                            <p className="max-w-[340px] text-muted">{t.findHint}</p>
                            <button
                                className="flex min-h-[54px] w-full max-w-[420px] cursor-pointer items-center justify-center gap-2.5 rounded-[18px] border-0 bg-brand px-[18px] py-3 text-[1.08rem] font-bold text-white shadow-[0_12px_24px_rgba(59,110,240,.35)] transition hover:bg-brand-deep active:scale-[.98] disabled:cursor-progress disabled:opacity-80 [&_svg]:size-[22px]"
                                onClick={locate}
                                disabled={loading}
                            >
                                {loading ? <Spin light /> : <Ico name="nav" />}
                                {loading ? t.finding : t.find}
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade">
                            <div className="mb-3.5 flex items-end justify-between gap-3">
                                <div>
                                    <span className={`inline-block rounded-full px-[11px] py-0.5 text-[.78rem] font-bold text-white ${isNearest ? "bg-brand" : "bg-alert"}`}>
                                        {isNearest ? t.nearest : t.selected}
                                    </span>
                                    <h4 className="mt-1.5 text-[1.7rem] leading-tight font-bold max-[360px]:text-[1.4rem]">{name(active)}</h4>
                                </div>
                                {active.d != null && (
                                    <div className="flex-none text-right leading-[1.1]">
                                        <b className="block text-[2rem] font-bold text-brand-deep">{fmt(active.d)}</b>
                                        <span className="text-[.82rem] text-muted">{t.km} {t.away}</span>
                                    </div>
                                )}
                            </div>

                            {active.d != null ? (
                                <div className="grid grid-cols-2 gap-2.5 min-[600px]:grid-cols-4">
                                    {MODES.map((m) => (
                                        <div className={`flex min-w-0 items-center gap-2.5 rounded-[18px] p-3 max-[360px]:p-2.5 min-[600px]:flex-col min-[600px]:items-start ${TONE[m.tone]}`} key={m.id}>
                                            <div className="grid size-[42px] flex-none place-items-center rounded-[13px] bg-white/60 max-[360px]:size-9"><Ico name={m.id} /></div>
                                            <div className="flex min-w-0 flex-col leading-tight">
                                                <small className="text-[.8rem] font-semibold opacity-90">{t.modes[m.id]}</small>
                                                <strong className="text-[1.08rem] font-bold">{dur(minutes(active.d, m.speed))}</strong>
                                                <em className="mt-0.5 text-[.74rem] not-italic opacity-85">{t.distance} {fmt(active.d * ROAD)} {t.km}</em>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    className="mt-1 mb-3 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#aebdf3] bg-white font-bold text-brand-deep [&_svg]:size-5"
                                    onClick={locate}
                                    disabled={loading}
                                >
                                    {loading ? <Spin /> : <Ico name="pin" />} {loading ? t.finding : t.find}
                                </button>
                            )}

                            <p className="mt-3.5 mb-1 flex items-center gap-2 px-0.5 text-[.94rem] font-semibold text-ink [&_svg]:size-5 [&_svg]:flex-none [&_svg]:text-alert"><Ico name="pin" /> {bn ? active.roadBn : active.road}</p>
                            <p className="mt-1 mb-2 flex items-center gap-2 px-0.5 text-[.94rem] text-muted [&_svg]:size-5 [&_svg]:flex-none"><Ico name="clock" /> {t.time}</p>
                            <div className="mb-3.5 flex flex-wrap gap-[7px]">
                                {(bn ? active.workBn : active.work).map((w) => (
                                    <span className="rounded-full border border-[#dbe3f7] bg-white px-3 py-1 text-[.88rem] font-medium" key={w}>{w}</span>
                                ))}
                            </div>
                            <a
                                className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand font-bold text-white no-underline shadow-[0_10px_20px_rgba(59,110,240,.3)] transition hover:bg-brand-deep active:scale-[.98] [&_svg]:size-5"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`https://www.google.com/maps/dir/?api=1&destination=${active.lat},${active.lng}&travelmode=transit`}
                            >
                                <Ico name="nav" /> {t.go}
                            </a>

                            {more.length > 0 && (
                                <div className="mt-4 grid gap-2">
                                    <p className="ml-0.5 text-[.85rem] font-bold text-muted">{t.more}</p>
                                    {more.map((s) => (
                                        <button
                                            className="flex min-h-12 cursor-pointer items-center justify-between rounded-[14px] border border-[#e0e8fb] bg-white px-3.5 py-2 text-left font-semibold hover:border-brand"
                                            key={s.id}
                                            onClick={() => pick(s.id)}
                                        >
                                            <span>{name(s)}</span>
                                            <b className="text-[.92rem] text-blue-fg">{fmt(s.d ?? 0)} {t.km}</b>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <Showcase title={t.showcase} />

                <section className="mt-[18px]" aria-labelledby="manual-h">
                    <div className="mx-0.5 mt-3.5 mb-3 flex items-end justify-between gap-2.5">
                        <div>
                            <h3 id="manual-h" className="text-[1.28rem] leading-tight font-bold">
                                {bn ? t.manualBn : t.manual}
                                {bn && <span className="text-[.9rem] font-medium text-muted"> · {t.manual}</span>}
                            </h3>
                            <p className="mt-0.5 text-[.92rem] text-muted">{t.manualSub}</p>
                        </div>
                        <span className="flex-none rounded-full bg-blue-bg px-[11px] py-[3px] text-[.85rem] font-bold text-blue-fg">{num(SPOTS.length)}{t.count}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 min-[600px]:grid-cols-3">
                        {spots.map((s, i) => {
                            const on = active && s.id === active.id;
                            const tone = TONES[i % 4];
                            return (
                                <button
                                    key={s.id}
                                    className={`flex min-h-[104px] cursor-pointer flex-col items-start gap-0.5 rounded-[20px] border-2 px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(31,45,77,.1)] active:scale-[.98] ${TONE[tone]} ${on ? `${TONE_BORDER[tone]} shadow-[0_0_0_3px_rgba(255,255,255,.8)_inset,0_10px_22px_rgba(31,45,77,.12)]` : "border-transparent"}`}
                                    onClick={() => pick(s.id)}
                                    aria-pressed={!!on}
                                >
                                    <span className="mb-auto grid size-[34px] place-items-center rounded-[11px] bg-white/65 [&_svg]:size-5"><Ico name="pin" /></span>
                                    <span className="mt-2 text-[1.04rem] leading-tight font-bold">{name(s)}</span>
                                    <span className="text-[.8rem] font-medium opacity-90">
                                        {s.d != null ? `${fmt(s.d ?? 0)} ${t.km}` : (bn ? s.workBn[0] : s.work[0])}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-6 rounded-[20px] border border-[#fde2a8] bg-[#fff7e6] px-4 py-3.5">
                    <p className="text-[1rem] leading-relaxed font-medium text-[#7a5a00]">{t.notice}</p>
                </section>

                <footer className="mt-[22px] mb-1 text-center text-[.84rem] text-muted">
                    <p>{t.note}</p>
                    <p className="mt-2">
                        <a href="https://zilanhasnathlithon.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline">
                            {t.developer}
                        </a>
                    </p>
                </footer>
            </main>
        </div>
    );
}
