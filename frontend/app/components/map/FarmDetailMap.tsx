"use client";

import {
  MapContainer,
  TileLayer,
  GeoJSON,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

type FarmDetailMapProps = {
  boundary: any;
};

export default function FarmDetailMap({
  boundary,
}: FarmDetailMapProps) {
  return (
    <div className="h-[550px] w-full overflow-hidden rounded-2xl border border-slate-800">

      <MapContainer
        center={[23.8103, 90.4125]}
        zoom={12}
        className="h-full w-full"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          data={boundary}
          style={{
            weight: 4,
            fillOpacity: 0.3,
          }}
        />

      </MapContainer>

    </div>
  );
}