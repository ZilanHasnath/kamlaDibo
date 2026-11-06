import { writeFileSync } from "node:fs";
import { SPOTS } from "../data/spots.js";

const OVERPASS = process.env.OVERPASS_URL || "https://overpass-api.de/api/interpreter";
const RADIUS = Number(process.env.SNAP_RADIUS || 250);
const PENALTY = { trunk: 0, primary: 0, secondary: 40 };

const M_LAT = 111320;
function nearestOnSegment(p, a, b) {
  const mLng = M_LAT * Math.cos((p.lat * Math.PI) / 180);
  const ax = (a.lon - p.lng) * mLng, ay = (a.lat - p.lat) * M_LAT;
  const bx = (b.lon - p.lng) * mLng, by = (b.lat - p.lat) * M_LAT;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
  const x = ax + t * dx, y = ay + t * dy;
  return { dist: Math.hypot(x, y), lat: p.lat + y / M_LAT, lng: p.lng + x / mLng };
}

async function post(q) {
  const res = await fetch(OVERPASS, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  if (!res.ok) throw new Error("Overpass HTTP " + res.status);
  return (await res.json()).elements || [];
}

async function byOsmId(id) {
  const els = await post(`[out:json][timeout:25];nwr(id:${id});out center tags;`);
  for (const e of els) {
    const lat = e.lat ?? e.center?.lat, lng = e.lon ?? e.center?.lon;
    if (lat != null && lng != null) return { lat, lng, type: e.type };
  }
  return null;
}

async function query(s) {
  const q = `[out:json][timeout:25];way(around:${RADIUS},${s.lat},${s.lng})[highway~"^(trunk|primary|secondary)$"];out geom tags;`;
  return post(q);
}

const out = {};
for (const s of SPOTS) {
  try {
    if (s.osmId) {
      const p = await byOsmId(s.osmId);
      if (p) {
        out[s.id] = { lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6) };
        console.log(`✓ ${s.en}: exact position from OpenStreetMap ${p.type} ${s.osmId}`);
      } else {
        console.log(`✗ ${s.en}: OpenStreetMap id ${s.osmId} not found (kept as is)`);
      }
      await new Promise((r) => setTimeout(r, 1200));
      continue;
    }
    let best = null;
    for (const w of await query(s)) {
      const g = w.geometry || [];
      for (let i = 0; i < g.length - 1; i++) {
        const r = nearestOnSegment(s, g[i], g[i + 1]);
        const score = r.dist + (PENALTY[w.tags.highway] ?? 60);
        if (!best || score < best.score) best = { ...r, score, tags: w.tags };
      }
    }
    if (!best) { console.log(`✗ ${s.en}: no main road within ${RADIUS} m (kept as is)`); continue; }
    const name = best.tags.name || best.tags["name:en"] || "";
    const nameBn = best.tags["name:bn"] || best.tags.name || "";
    out[s.id] = {
      lat: +best.lat.toFixed(6), lng: +best.lng.toFixed(6),
      ...(name ? { road: name, roadBn: nameBn + " এর পাশে" } : {}),
    };
    console.log(`✓ ${s.en}: moved ${best.dist.toFixed(0)} m onto ${best.tags.highway} "${name || "unnamed"}"`);
  } catch (e) {
    console.log(`✗ ${s.en}: ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 1200));
}
writeFileSync(
  new URL("../data/snapped.js", import.meta.url),
  "export default " + JSON.stringify(out, null, 2) + ";\n"
);
console.log("\nSaved data/snapped.js — restart the app to see the new positions.");
