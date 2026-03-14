"use client";
import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MapPin, RefreshCw, Tag, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/i18n/LanguageContext";

import L from "leaflet";
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({ iconRetinaUrl: null, iconUrl: null, shadowUrl: null });
}

function FitBounds({ members }: { members: any[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = members
      .filter((m: any) => m.latitude != null && m.longitude != null && !isNaN(parseFloat(m.latitude)) && !isNaN(parseFloat(m.longitude)))
      .map((m: any) => [parseFloat(m.latitude), parseFloat(m.longitude)] as [number, number]);
    if (pts.length > 0) {
      try {
        map.fitBounds(pts, { padding: [40, 40], animate: false });
      } catch { }
    }
  }, [members, map]);
  return null;
}

const MARITAL_LABELS = {
  en: { Single: "Single", Married: "Married", Widowed: "Widowed", Divorced: "Divorced" },
  vi: { Single: "Độc thân", Married: "Đã kết hôn", Widowed: "Góa", Divorced: "Ly hôn" },
};

const POP_LABELS = {
  en: { male: "♂ Male", female: "♀ Female", active: "Active", inactive: "Inactive", yearsOld: "yrs old", onMap: "members on map", noCoords: "missing coordinates", geocodeBtn: "Geocode addresses", geocoding: "Geocoding...", filterGroup: "Filter group:", allGroups: "All", noMapTitle: "No member coordinates", noMapSub: 'Click "Geocode addresses" to auto-fetch coordinates', tip: "Click a dot to view member info. Purple = active, gray = inactive." },
  vi: { male: "♂ Nam", female: "♀ Nữ", active: "Hoạt động", inactive: "Không hoạt động", yearsOld: "tuổi", onMap: "thành viên trên bản đồ", noCoords: "chưa có tọa độ", geocodeBtn: "Geocode địa chỉ", geocoding: "Đang xử lý...", filterGroup: "Lọc nhóm:", allGroups: "Tất cả", noMapTitle: "Chưa có tọa độ thành viên", noMapSub: 'Nhấn "Geocode địa chỉ" để tự động lấy tọa độ', tip: "Click vào chấm tròn để xem thông tin thành viên. Màu tím = hoạt động, xám = không hoạt động." },
};

function getAge(birthday: string | null | undefined) {
  if (!birthday) return null;
  const today = new Date();
  const birth = new Date(birthday);
  if (isNaN(birth.getTime())) return null; // Ensure valid date
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

interface MemberMapViewProps {
  members: any[];
  onMemberUpdated?: () => void;
  groups?: any[];
}

export default function MemberMapView({ members, onMemberUpdated, groups = [] }: MemberMapViewProps) {
  const { lang } = useLang();
  const L2 = POP_LABELS[lang] || POP_LABELS.en;
  const ML = MARITAL_LABELS[lang] || MARITAL_LABELS.en;
  const [geocoding, setGeocoding] = useState(false);
  const [progress, setProgress] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [groupSearch, setGroupSearch] = useState("");

  // Build a map of group ID -> group name
  const groupMap = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach((g: any) => { map[g.id] = g.name; });
    return map;
  }, [groups]);

  // Show ALL groups from the groups prop (not just ones appearing in members)
  const allGroups = useMemo(() => {
    return groups.map(g => g.id);
  }, [groups]);

  // Filtered groups by search
  const visibleGroups = useMemo(() => {
    if (!groupSearch.trim()) return allGroups;
    const q = groupSearch.toLowerCase();
    return allGroups.filter(id => (groupMap[id] || "").toLowerCase().includes(q));
  }, [allGroups, groupMap, groupSearch]);

  // Build a set of member IDs for the selected group (using Group.member_ids)
  const selectedGroupMemberIds = useMemo(() => {
    if (selectedGroup === "all") return null;
    const group = groups.find(g => g.id === selectedGroup);
    return new Set(group?.member_ids || []);
  }, [groups, selectedGroup]);

  // Filter members by selected group
  const filteredMembers = useMemo(() => {
    if (selectedGroup === "all") return members;
    return members.filter((m: any) => selectedGroupMemberIds?.has(m.id));
  }, [members, selectedGroup, selectedGroupMemberIds]);

  const withCoords = filteredMembers.filter(m => m.latitude != null && m.longitude != null && !isNaN(parseFloat(m.latitude)) && !isNaN(parseFloat(m.longitude)))
    .map(m => ({ ...m, latitude: parseFloat(m.latitude), longitude: parseFloat(m.longitude) }));
  const withoutCoords = members.filter(m => m.address && (m.latitude == null || m.longitude == null || isNaN(parseFloat(m.latitude)) || isNaN(parseFloat(m.longitude))));

  const geocodeAddress = async (address: string) => {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "ChurchCRM/1.0" } });
    const data = await res.json();
    if (data && data.length > 0) {
      const item = data[0];
      const postal_code = item.address?.postcode || "";
      return { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon), postal_code };
    }
    return null;
  };

  const geocodeAll = async () => {
    if (withoutCoords.length === 0) return;
    setGeocoding(true);
    for (let i = 0; i < withoutCoords.length; i++) {
      const m = withoutCoords[i];
      setProgress(`${i + 1}/${withoutCoords.length}: ${m.first_name} ${m.last_name}...`);
      // Add city/country context if not in address
      const fullAddress = m.address?.includes("Toronto") ? m.address : `${m.address}, Toronto, ON, Canada`;
      const coords = await geocodeAddress(fullAddress);
      if (coords) {
        const supabase = createClient();
        const { error } = await supabase.from('members').update({
          latitude: coords.latitude,
          longitude: coords.longitude,
          postal_code: coords.postal_code || m.postal_code || ""
        }).eq('id', m.id);
        if (error) console.error("Error geocoding member", m.id, error);
      }
      // Respect Nominatim rate limit: 1 req/sec
      await new Promise(r => setTimeout(r, 1100));
    }
    setGeocoding(false);
    setProgress("");
    if (onMemberUpdated) onMemberUpdated();
  };

  return (
    <div className="space-y-3">
      {/* Stats + filters bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-violet-500" /> {withCoords.length} {L2.onMap}
          </span>
          {withoutCoords.length > 0 && (
            <span className="text-amber-600">{withoutCoords.length} {L2.noCoords}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {withoutCoords.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={geocodeAll}
              disabled={geocoding}
              className="text-violet-700 border-violet-300 hover:bg-violet-50"
            >
              {geocoding ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
              {geocoding ? progress : `${L2.geocodeBtn} (${withoutCoords.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Group filter */}
      {allGroups.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <Filter className="w-3.5 h-3.5" /> {L2.filterGroup}
            </span>
            <input
              type="text"
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
              placeholder="Search group..."
              className="text-xs border border-slate-200 rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400 w-40"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedGroup === "all" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}
            >
              {L2.allGroups}
            </button>
            {visibleGroups.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition-colors ${selectedGroup === g ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}
              >
                <Tag className="w-3 h-3" /> {groupMap[g] || g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      {withCoords.length === 0 ? (
        <div className="h-96 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-400">
          <MapPin className="w-10 h-10" />
          <p className="text-sm font-medium">{L2.noMapTitle}</p>
          <p className="text-xs">{L2.noMapSub}</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 480, zIndex: 0, position: "relative" }}>
          <MapContainer
            center={[16.0, 108.0]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds members={withCoords} />
            {withCoords.map(m => (
              <CircleMarker
                key={m.id}
                center={[m.latitude, m.longitude]}
                radius={9}
                pathOptions={{
                  fillColor: m.status === "active" ? "#8b5cf6" : "#94a3b8",
                  color: "#fff",
                  weight: 2,
                  fillOpacity: 0.85
                }}
              >
                <Popup>
                  <div className="text-sm space-y-1 min-w-[180px]">
                    <p className="font-semibold text-slate-900">{m.first_name} {m.last_name}</p>

                    {/* Sex & Marital status */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {m.sex && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${m.sex === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                          {m.sex === "M" ? L2.male : L2.female}
                        </span>
                      )}
                      {m.marital_status && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                          {(ML as any)[m.marital_status] || m.marital_status}
                        </span>
                      )}
                    </div>

                    {/* Groups */}
                    {m.groups?.map((g: string) => (
                      <span key={g} className="inline-flex items-center gap-0.5 text-xs bg-violet-100 text-violet-700 rounded-full px-2 py-0.5">
                        <Tag className="w-2.5 h-2.5" /> {groupMap[g as keyof typeof groupMap] || g}
                      </span>
                    ))}

                    {m.birthday && getAge(m.birthday) !== null && (
                      <p className="text-slate-500 text-xs">🎂 {getAge(m.birthday)} {L2.yearsOld}</p>
                    )}
                    {m.role && <p className="text-slate-500 text-xs">{m.role}</p>}
                    {m.address && <p className="text-slate-600 text-xs">{m.address}</p>}
                    {m.postal_code && <p className="text-slate-400 text-xs">📮 {m.postal_code}</p>}
                    {m.phone && <p className="text-slate-500 text-xs">📞 {m.phone}</p>}

                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {m.status === "active" ? L2.active : L2.inactive}
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}

      <p className="text-xs text-slate-400">💡 {L2.tip}</p>
    </div>
  );
}