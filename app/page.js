"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { SPOTS } from "../data/spots";

const SpotMap = dynamic(() => import("../components/SpotMap"), {
  ssr: false,
  loading: () => (
    <div className="mapwrap">
      <div className="map map-loading">Loading map…</div>
    </div>
  ),
});

const T = {
  bn: {
    title: "কামলা দিবো",
    tagline: ["আজকের কাজ,", "কাছের মোড়েই"],
    sub: "ঢাকার যেসব জায়গায় সকালে দিনমজুররা জড়ো হন, এক নজরে দেখুন।",
    find: "আমার কাছের জায়গা খুঁজুন",
    finding: "খুঁজছি…",
    denied: "লোকেশন পাওয়া যায়নি। অনুমতি দিন, অথবা তালিকা থেকে বেছে নিন।",
    unsupported: "এই ফোনে লোকেশন সাপোর্ট নেই।",
    nearest: "সবচেয়ে কাছের",
    km: "কিমি",
    work: "সাধারণ কাজ",
    time: "সাধারণত সকাল ৬টা – ৯টা",
    go: "রাস্তা দেখুন",
    places: "জমায়েতের জায়গা",
    showcase: "এক নজরে",
    source: "ছবি সূত্র",
    count: "টি জায়গা",
    note: "জায়গাগুলোর অবস্থান আনুমানিক। যাওয়ার আগে নিশ্চিত হয়ে নিন।",
    lang: "English",
  },
  en: {
    title: "Kamla Dibo",
    tagline: ["Today's work,", "at a nearby crossing"],
    sub: "See where day laborers gather in Dhaka every morning.",
    find: "Find spots near me",
    finding: "Locating…",
    denied: "Could not get your location. Allow permission, or pick from the list.",
    unsupported: "Location is not supported on this device.",
    nearest: "Nearest",
    km: "km",
    work: "Usual work",
    time: "Usually 6 AM – 9 AM",
    go: "Get directions",
    places: "Gathering spots",
    showcase: "At a glance",
    source: "Photo source",
    count: " spots",
    note: "Locations are approximate. Please confirm before you go.",
    lang: "বাংলা",
  },
};

const PHOTOS = [
  { id: "p1", src: "https://protidinerbangladesh.com/uploads/2022/09/online/photos/rupganj-632e9a08eab81.jpg"},
  { id: "p2", src: "https://www.kalbela.com/assets/news_photos/2024/07/09/image_102692_1720499759.webp"},
];

function Showcase({ title, sourceLabel }) {
  const [failed, setFailed] = useState({});
  const items = PHOTOS.filter((p) => !failed[p.id]);
  if (items.length === 0) return null;
  return (
    <section className="showcase">
      <h2>{title}</h2>
      <div className="shots">
        {items.map((p) => (
          <figure className="shot" key={p.id}>
            <img
              src={p.src}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setFailed((f) => ({ ...f, [p.id]: true }))}
            />
            
          </figure>
        ))}
      </div>
    </section>
  );
}

function dist(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export default function Home() {
  const [lang, setLang] = useState("bn");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [selected, setSelected] = useState("town-hall");
  const t = T[lang];

  const spots = useMemo(() => {
    const list = SPOTS.map((s) => ({ ...s, d: user ? dist(user, s) : null }));
    return user ? list.sort((a, b) => a.d - b.d) : list;
  }, [user]);

  const locate = () => {
    if (!navigator.geolocation) return setStatus("unsupported");
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const u = { lat: p.coords.latitude, lng: p.coords.longitude };
        setUser(u);
        setStatus("ok");
        const nearest = SPOTS.map((s) => ({ id: s.id, d: dist(u, s) })).sort((a, b) => a.d - b.d)[0];
        setSelected(nearest.id);
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onSelect = useCallback((id) => setSelected(id), []);
  const bn = lang === "bn";
  const num = (n) => (bn ? n.toLocaleString("bn-BD") : String(n));
  const fmt = (n) => (bn ? n.toLocaleString("bn-BD", { maximumFractionDigits: 1 }) : n.toFixed(1));
  const loading = status === "loading";

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="top">
            <div className="brand">
              <div className="logo">🛠️</div>
              <h1>{t.title}</h1>
            </div>
            <button className="lang" onClick={() => setLang(bn ? "en" : "bn")}>{t.lang}</button>
          </div>
          <p className="tagline">
            {t.tagline[0]} {t.tagline[1]}
          </p>
          <p className="sub">{t.sub}</p>
        </div>
      </section>

      <main className="app">
        <button className="cta" onClick={locate} disabled={loading}>
          {loading ? <span className="spin" /> : <span>📍</span>}
          {loading ? t.finding : t.find}
        </button>
        {status === "denied" && <p className="msg">{t.denied}</p>}
        {status === "unsupported" && <p className="msg">{t.unsupported}</p>}

        <div className="layout">
          <SpotMap spots={spots} selectedId={selected} onSelect={onSelect} user={user} lang={lang} />

          <div>
            <div className="list-head">
              <h2>{t.places}</h2>
              <span>{num(spots.length)}{t.count}</span>
            </div>
            <ul className="list">
              {spots.map((s, i) => {
                const open = s.id === selected;
                return (
                  <li key={s.id} className={`card ${open ? "open" : ""}`}>
                    <button className="row" onClick={() => setSelected(s.id)} aria-expanded={open}>
                      <span className="num">{num(i + 1)}</span>
                      <span className="info">
                        <span className="name">{bn ? s.bn : s.en}</span>
                        {user && i === 0 && <span className="badge">{t.nearest}</span>}
                      </span>
                      {s.d != null && <span className="dist">{fmt(s.d)} {t.km}</span>}
                      <span className="chev" aria-hidden>›</span>
                    </button>
                    {open && (
                      <div className="detail">
                        <p className="meta">🕕 {t.time}</p>
                        <div className="tags" aria-label={t.work}>
                          {(bn ? s.workBn : s.work).map((w) => (
                            <span className="tag" key={w}>{w}</span>
                          ))}
                        </div>
                        <a
                          className="go"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=transit`}
                        >
                          🧭 {t.go}
                        </a>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <Showcase title={t.showcase} sourceLabel={t.source} />
        <footer>{t.note}</footer>
      </main>
    </>
  );
}
