"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function SpotMap({ spots, selectedId, onSelect, user, lang }) {
  const mapEl = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const userMarker = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = L.map(mapEl.current, { zoomControl: true }).setView([23.7806, 90.4], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map.current);
    return () => {
      map.current.remove();
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
      const mk = L.marker([s.lat, s.lng], { icon, zIndexOffset: active ? 1000 : 0 })
        .addTo(m)
        .bindTooltip(lang === "bn" ? s.bn : s.en, { direction: "top", offset: [0, -30] })
        .on("click", () => onSelect(s.id));
      markers.current[s.id] = mk;
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
    userMarker.current = L.marker([user.lat, user.lng], { icon, zIndexOffset: 2000 })
      .addTo(m)
      .bindTooltip(lang === "bn" ? "আপনি এখানে" : "You are here", { direction: "top" });
  }, [user, lang]);

  useEffect(() => {
    const m = map.current;
    const s = spots.find((x) => x.id === selectedId);
    if (m && s) m.flyTo([s.lat, s.lng], Math.max(m.getZoom(), 14), { duration: 0.6 });
  }, [selectedId, spots]);

  return (
    <div className="mapwrap">
      <div ref={mapEl} className="map" />
    </div>
  );
}
