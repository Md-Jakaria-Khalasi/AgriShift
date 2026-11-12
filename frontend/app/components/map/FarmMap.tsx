"use client";

import { useState } from "react";

import {
  MapContainer,
  TileLayer,
  FeatureGroup,
} from "react-leaflet";

import { EditControl } from "react-leaflet-draw";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";


export default function FarmMap() {
  const [farmName, setFarmName] = useState("");
  const [boundary, setBoundary] = useState<any>(null);
  const [area, setArea] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState("");


  const calculateArea = async (geoJson: any) => {
    try {
      setError("");
      setSaved(false);

      const response = await fetch(
        "http://127.0.0.1:8000/api/farms/calculate-area",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: farmName || "My Farm",
            boundary: geoJson.geometry,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to calculate area"
        );
      }

      setArea(data.area_hectare);

    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Failed to calculate farm area."
      );
    }
  };


  const handleCreated = (e: any) => {
    const layer = e.layer;

    const geoJson = layer.toGeoJSON();

    console.log(
      "Farm Boundary:",
      JSON.stringify(geoJson, null, 2)
    );

    setBoundary(geoJson);

    calculateArea(geoJson);
  };


  const saveFarm = async () => {
    if (!farmName.trim()) {
      setError("Please enter a farm name.");
      return;
    }

    if (!boundary) {
      setError("Please draw a farm boundary first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const response = await fetch(
        "http://127.0.0.1:8000/api/farms/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: farmName,
            boundary: boundary.geometry,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to save farm."
        );
      }

      console.log("Farm saved:", data);

      setSaved(true);

      setArea(data.area_hectare);

    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Failed to save farm."
      );

    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-6">

      {/* Map */}
      <div className="h-[600px] w-full overflow-hidden rounded-2xl border border-slate-800">

        <MapContainer
          center={[23.8103, 90.4125]}
          zoom={12}
          className="h-full w-full"
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FeatureGroup>

            <EditControl
              position="topright"

              onCreated={handleCreated}

              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: true,
              }}
            />

          </FeatureGroup>

        </MapContainer>

      </div>


      {/* Farm Information */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <h3 className="mb-5 text-2xl font-bold">
          Farm Information
        </h3>


        {/* Farm Name */}
        <div className="mb-5">

          <label className="mb-2 block text-sm font-medium text-slate-300">
            Farm Name
          </label>

          <input
            type="text"
            value={farmName}
            onChange={(e) => {
              setFarmName(e.target.value);
              setSaved(false);
              setError("");
            }}
            placeholder="Enter farm name"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-green-500"
          />

        </div>


        {/* Area */}
        {area !== null && (

          <div className="mb-5 rounded-xl border border-green-900 bg-green-950/30 p-4">

            <p className="text-sm text-slate-400">
              Farm Area
            </p>

            <p className="mt-1 text-3xl font-bold text-green-400">
              {area.toFixed(4)}
            </p>

            <p className="text-sm text-slate-400">
              hectares
            </p>

          </div>

        )}


        {/* Error */}
        {error && (

          <div className="mb-5 rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-400">
            {error}
          </div>

        )}


        {/* Success */}
        {saved && (

          <div className="mb-5 rounded-lg border border-green-800 bg-green-950/30 p-4 text-sm text-green-400">
            Farm saved successfully!
          </div>

        )}


        {/* Save Button */}
        <button
          onClick={saveFarm}
          disabled={saving || !boundary}
          className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "Saving Farm..." : "Save Farm"}
        </button>

      </div>

    </div>
  );
}