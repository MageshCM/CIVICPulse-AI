import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { Issue } from "../types";

interface InteractiveMapProps {
  issues: Issue[];
  center: { lat: number; lng: number };
  onSelectLocation?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  interactive?: boolean;
}

export default function InteractiveMap({
  issues,
  center,
  onSelectLocation,
  selectedLocation,
  interactive = true,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const selectedLocationMarkerRef = useRef<L.Marker | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map is already initialized to avoid re-initialization errors
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // CartoDB Voyager tiles (modern, elegant pastel colors that fit both light and dark backgrounds)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle Map Click for reporting locations
      map.on("click", (e) => {
        if (interactive && onSelectLocation) {
          onSelectLocation(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], mapInstanceRef.current.getZoom());
    }
  }, [center.lat, center.lng]);

  // Update Markers when issues data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    issues.forEach((issue) => {
      const color =
        issue.severity === "Critical" ? "#dc2626" :
        issue.severity === "High" ? "#f97316" :
        issue.severity === "Medium" ? "#f59e0b" : "#64748b";

      const showPulse = issue.severity === "Critical" || issue.severity === "High";

      // HTML custom marker styled with Tailwind CSS
      const markerHtml = `
        <div class="relative flex items-center justify-center -translate-y-1/2">
          ${showPulse ? `
            <div class="absolute w-8 h-8 rounded-full opacity-40 animate-ping" style="background-color: ${color};"></div>
          ` : ""}
          <div class="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all hover:scale-110" style="background-color: ${color};">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon })
        .addTo(map)
        .on("click", (e) => {
          // Prevent click propagating to map click handler
          L.DomEvent.stopPropagation(e);
          setSelectedIssue(issue);
        });

      markersRef.current.push(marker);
    });
  }, [issues]);

  // Update Selected / Reporting Pin Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedLocationMarkerRef.current) {
      selectedLocationMarkerRef.current.remove();
      selectedLocationMarkerRef.current = null;
    }

    if (selectedLocation) {
      const markerHtml = `
        <div class="relative flex items-center justify-center -translate-y-1/2 animate-bounce">
          <div class="absolute w-8 h-8 rounded-full opacity-30 bg-indigo-500 animate-ping"></div>
          <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg bg-indigo-600 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "selected-location-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      selectedLocationMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: customIcon })
        .addTo(map);
    }
  }, [selectedLocation]);

  return (
    <div className="w-full h-[380px] md:h-[450px] border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm relative z-0">
      {/* Leaflet container div */}
      <div ref={mapContainerRef} className="w-full h-full" id="leaflet-map-element" />

      {/* Selected Issue Overlay details panel */}
      {selectedIssue && (
        <div className="absolute bottom-4 left-4 right-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xl flex items-start gap-3 text-left transition-all max-w-xl mx-auto z-[1000]">
          <div className={`p-2.5 rounded-lg shrink-0 ${
            selectedIssue.severity === "Critical" ? "bg-red-50 text-red-600" :
            selectedIssue.severity === "High" ? "bg-orange-50 text-orange-600" :
            selectedIssue.severity === "Medium" ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"
          }`}>
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                selectedIssue.severity === "Critical" ? "bg-red-100 text-red-700" :
                selectedIssue.severity === "High" ? "bg-orange-100 text-orange-700" :
                selectedIssue.severity === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
              }`}>
                {selectedIssue.severity} Severity
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full font-semibold">
                {selectedIssue.category}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 mt-1.5 truncate">{selectedIssue.title}</h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{selectedIssue.description}</p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>{selectedIssue.ward} • {selectedIssue.address.split(',')[0]}</span>
              <span className="text-indigo-600 font-semibold">{selectedIssue.confirmationCount} Confirmations</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedIssue(null)}
            className="text-slate-400 hover:text-slate-600 shrink-0 p-1 font-bold text-lg"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
