"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function curve(a, b) {
  const mid = [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2];
  const dx = b.lng - a.lng, dy = b.lat - a.lat;
  const ctrl = [mid[0] + dx * 0.22, mid[1] - dy * 0.22];
  const pts = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28, u = 1 - t;
    pts.push([
      u * u * a.lat + 2 * u * t * ctrl[0] + t * t * b.lat,
      u * u * a.lng + 2 * u * t * ctrl[1] + t * t * b.lng,
    ]);
  }
  return pts;
}

export default function SpotMap({ spots, selectedId, onSelect, user, lang }) {
  const mapEl = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const userMarker = useRef(null);
  const route = useRef(null);

  useEffect(() => {
    if (map.current) return;
    const m = L.map(mapEl.current, { zoomControl: false, attributionControl: true }).setView([23.7806, 90.395], 12);
    L.control.zoom({ position: "topright" }).addTo(m);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(m);
    map.current = m;

    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(mapEl.current);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
      markers.current = {};
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    Object.values(markers.current).forEach((mk) => mk.remove());
    markers.current = {};
    spots.forEach((s) => {
      const active = s.id === selectedId;
      const icon = L.divIcon({
        className: "",
        html: `<div class="pin ${active ? "pin-active" : ""}"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      markers.current[s.id] = L.marker([s.lat, s.lng], { icon, zIndexOffset: active ? 1000 : 0, keyboard: false })
        .addTo(m)
        .bindTooltip(lang === "bn" ? s.bn : s.en, { direction: "top", offset: [0, -30] })
        .on("click", () => onSelect(s.id));
    });
  }, [spots, selectedId, lang, onSelect]);

  useEffect(() => {
    const m = map.current;
    if (!m || !user) return;
    if (userMarker.current) userMarker.current.remove();
    const icon = L.divIcon({
      className: "",
      html: '<div class="me"><b></b><i></i></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    userMarker.current = L.marker([user.lat, user.lng], { icon, zIndexOffset: 2000, keyboard: false })
      .addTo(m)
      .bindTooltip(lang === "bn" ? "আপনি এখানে" : "You are here", { direction: "top" });
  }, [user, lang]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (route.current) { route.current.remove(); route.current = null; }
    const s = spots.find((x) => x.id === selectedId);
    if (!s) return;
    if (user) {
      route.current = L.polyline(curve(user, s), { color: "#3b82f6", weight: 5, opacity: 0.95, lineCap: "round" }).addTo(m);
      m.flyToBounds(L.latLngBounds([user.lat, user.lng], [s.lat, s.lng]), {
        paddingTopLeft: [40, 70], paddingBottomRight: [40, 40], maxZoom: 15, duration: 0.7,
      });
    } else {
      m.flyTo([s.lat, s.lng], Math.max(m.getZoom(), 14), { duration: 0.6 });
    }
  }, [selectedId, spots, user]);

  return <div ref={mapEl} className="map" />;
}
