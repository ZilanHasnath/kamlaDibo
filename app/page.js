"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { SPOTS } from "../data/spots";

const SpotMap = dynamic(() => import("../components/SpotMap"), {
  ssr: false,
  loading: () => <div className="map map-loading">…</div>,
});

const T = {
  bn: {
    title: "কামলা দিবো",
    menu: "মেনু",
    nearby: "নিকটবর্তী জায়গা",
    nearbySub: "আপনার সবচেয়ে কাছের জমায়েতের জায়গা",
    manual: "Pick manually",
    manualBn: "নিজে বেছে নিন",
    manualSub: "ঢাকার সব নির্ধারিত জায়গা",
    find: "নিকটবর্তী জায়গা খুঁজুন",
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
    time: "সাধারণত সকাল ৬টা – ৯টা",
    go: "রাস্তা দেখুন",
    showcase: "এক নজরে",
    count: "টি জায়গা",
    note: "জায়গাগুলোর অবস্থান ও সময় আনুমানিক। যাওয়ার আগে নিশ্চিত হয়ে নিন।",
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
    time: "Usually 6 AM – 9 AM",
    go: "Get directions",
    showcase: "At a glance",
    count: " spots",
    note: "Locations and times are approximate. Please confirm before you go.",
    lang: "বাংলা",
    modes: { car: "Car", bike: "Bicycle", bus: "Bus", walk: "Walk" },
    away: "away",
  },
};

const MODES = [
  { id: "car", speed: 18, tone: "blue" },
  { id: "bike", speed: 11, tone: "yellow" },
  { id: "bus", speed: 14, tone: "red" },
  { id: "walk", speed: 4.5, tone: "cyan" },
];
const ROAD = 1.35;
const TONES = ["blue", "yellow", "red", "cyan"];

const PHOTOS = [
  { id: "p1", src: "https://protidinerbangladesh.com/uploads/2022/09/online/photos/rupganj-632e9a08eab81.jpg" },
  { id: "p2", src: "https://www.kalbela.com/assets/news_photos/2024/07/09/image_102692_1720499759.webp" },
];

function Ico({ name }) {
  const p = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
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

function dist(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function Showcase({ title }) {
  const [failed, setFailed] = useState({});
  const items = PHOTOS.filter((p) => !failed[p.id]);
  if (items.length === 0) return null;
  return (
    <section className="showcase">
      <h2>{title}</h2>
      <div className="shots">
        {items.map((p) => (
          <figure className="shot" key={p.id}>
            <img src={p.src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed((f) => ({ ...f, [p.id]: true }))} />
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [lang, setLang] = useState("bn");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [selectedId, setSelectedId] = useState(null);
  const t = T[lang];
  const bn = lang === "bn";

  const spots = useMemo(() => {
    const list = SPOTS.map((s) => ({ ...s, d: user ? dist(user, s) : null }));
    return list;
  }, [user]);
  const byDistance = useMemo(() => (user ? [...spots].sort((a, b) => a.d - b.d) : []), [spots, user]);
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

  const pick = useCallback((id) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 899px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const num = (n) => (bn ? n.toLocaleString("bn-BD") : String(n));
  const fmt = (n) => (bn ? n.toLocaleString("bn-BD", { maximumFractionDigits: 1 }) : n.toFixed(1));
  const minutes = (d, speed) => Math.max(1, Math.round(((d * ROAD) / speed) * 60));
  const dur = (m) => {
    if (m < 60) return `${num(m)} ${t.min}`;
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${num(h)} ${t.hr} ${num(r)} ${t.min}` : `${num(h)} ${t.hr}`;
  };
  const loading = status === "loading";
  const isNearest = active && nearest && active.id === nearest.id;
  const more = byDistance.filter((s) => !active || s.id !== active.id).slice(0, 2);
  const name = (s) => (bn ? s.bn : s.en);

  return (
    <div className="shell">
      
      <div className="mapcol">
        <SpotMap spots={spots} selectedId={active ? active.id : null} onSelect={pick} user={user} lang={lang} />
        <header className="floatbar">
          <div className="brand">
            <span className="logo" aria-hidden>🛠️</span>
            <h1>{t.title}</h1>
          </div>
          <button className="lang" onClick={() => setLang(bn ? "en" : "bn")}>{t.lang}</button>
        </header>
      </div>

      <main className="sheet">
        <div className="grabber" aria-hidden />
        <div className="sheet-head">
          <h2>{t.menu}</h2>
          <button className="icon-btn" onClick={locate} disabled={loading} aria-label={t.refresh} title={t.refresh}>
            {loading ? <span className="spin" /> : <Ico name="refresh" />}
          </button>
        </div>

        {(status === "denied" || status === "unsupported") && (
          <p className="msg" role="status">{status === "denied" ? t.denied : t.unsupported}</p>
        )}

        <section className="nearby" aria-labelledby="nearby-h">
          <div className="sec-title">
            <h3 id="nearby-h">{t.nearby}</h3>
            <p>{t.nearbySub}</p>
          </div>

          {!active ? (
            <div className="locate-card">
              <div className="locate-ico"><Ico name="pin" /></div>
              <p>{t.findHint}</p>
              <button className="cta" onClick={locate} disabled={loading}>
                {loading ? <span className="spin light" /> : <Ico name="nav" />}
                {loading ? t.finding : t.find}
              </button>
            </div>
          ) : (
            <div className="feature">
              <div className="feature-top">
                <div>
                  <span className={`badge ${isNearest ? "" : "badge-alt"}`}>{isNearest ? t.nearest : t.selected}</span>
                  <h4>{name(active)}</h4>
                </div>
                {active.d != null && (
                  <div className="bigdist">
                    <b>{fmt(active.d)}</b>
                    <span>{t.km} {t.away}</span>
                  </div>
                )}
              </div>

              {active.d != null ? (
                <div className="tiles">
                  {MODES.map((m) => (
                    <div className={`tile tone-${m.tone}`} key={m.id}>
                      <div className="tile-ico"><Ico name={m.id} /></div>
                      <div className="tile-txt">
                        <small>{t.modes[m.id]}</small>
                        <strong>{dur(minutes(active.d, m.speed))}</strong>
                        <em>{t.distance} {fmt(active.d * ROAD)} {t.km}</em>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button className="soft-cta" onClick={locate} disabled={loading}>
                  {loading ? <span className="spin" /> : <Ico name="pin" />} {loading ? t.finding : t.find}
                </button>
              )}

              <p className="meta road"><Ico name="pin" /> {bn ? active.roadBn : active.road}</p>
              <p className="meta tight"><Ico name="clock" /> {t.time}</p>
              <div className="tags">
                {(bn ? active.workBn : active.work).map((w) => <span className="tag" key={w}>{w}</span>)}
              </div>
              <a
                className="go"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/dir/?api=1&destination=${active.lat},${active.lng}&travelmode=transit`}
              >
                <Ico name="nav" /> {t.go}
              </a>

              {more.length > 0 && (
                <div className="more">
                  <p className="more-h">{t.more}</p>
                  {more.map((s) => (
                    <button className="more-row" key={s.id} onClick={() => pick(s.id)}>
                      <span>{name(s)}</span>
                      <b>{fmt(s.d)} {t.km}</b>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>


        <Showcase title={t.showcase} />




        <section className="manual" aria-labelledby="manual-h">
          <div className="sec-title row">
            <div>
              <h3 id="manual-h">{bn ? t.manualBn : t.manual}{bn && <span className="en-sub"> · {t.manual}</span>}</h3>
              <p>{t.manualSub}</p>
            </div>
            <span className="count">{num(SPOTS.length)}{t.count}</span>
          </div>
          <div className="grid">
            {spots.map((s, i) => {
              const on = active && s.id === active.id;
              return (
                <button
                  key={s.id}
                  className={`spot tone-${TONES[i % 4]} ${on ? "on" : ""}`}
                  onClick={() => pick(s.id)}
                  aria-pressed={on}
                >
                  <span className="spot-ico"><Ico name="pin" /></span>
                  <span className="spot-name">{name(s)}</span>
                  <span className="spot-sub">
                    {s.d != null ? `${fmt(s.d)} ${t.km}` : (bn ? s.workBn[0] : s.work[0])}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        
        <footer>{t.note}</footer>
      </main>
    </div>
  );
}
