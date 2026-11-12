"use client";

import { useEffect, useState } from "react";

type Farm = {
  id: number;
  name: string;
  area_hectare: number;
  created_at: string | null;
};

export default function FarmDashboard() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFarms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/farms"
      );

      if (!response.ok) {
        throw new Error("Failed to load farms.");
      }

      const data = await response.json();

      setFarms(data);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message || "Failed to load farms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const handleViewFarm = (farmId: number) => {
    window.location.href = `/farms/${farmId}`;
  };

  const handleAnalyzeFarm = (farm: Farm) => {
  window.location.href = `/farms/${farm.id}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
          Farm Management
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          My Farms
        </h2>

        <p className="mt-2 text-slate-400">
          View and manage your saved farm locations.
        </p>
      </div>


      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
          Loading farms...
        </div>
      )}


      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-800 bg-red-950/30 p-6 text-red-400">
          <p className="font-medium">
            Failed to load farms
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>

          <button
            onClick={loadFarms}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Try Again
          </button>
        </div>
      )}


      {/* No Farms */}
      {!loading && !error && farms.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

          <div className="text-5xl">
            🌾
          </div>

          <p className="mt-4 text-lg text-slate-300">
            No farms found.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Create your first farm using the map.
          </p>

        </div>
      )}


      {/* Farm Cards */}
      {!loading && !error && farms.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {farms.map((farm) => (
            <div
              key={farm.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-green-700"
            >

              {/* Card Header */}
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-green-400">
                    Farm #{farm.id}
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    {farm.name}
                  </h3>
                </div>

                <div className="text-3xl">
                  🌾
                </div>

              </div>


              {/* Area */}
              <div className="mt-6 rounded-xl bg-slate-950 p-4">

                <p className="text-sm text-slate-500">
                  Farm Area
                </p>

                <p className="mt-1 text-2xl font-bold text-green-400">
                  {farm.area_hectare.toFixed(4)}
                </p>

                <p className="text-sm text-slate-500">
                  hectares
                </p>

              </div>


              {/* Created */}
              <div className="mt-5">

                <p className="text-xs text-slate-500">
                  Created
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {farm.created_at
                    ? new Date(
                        farm.created_at
                      ).toLocaleDateString()
                    : "Unknown"}
                </p>

              </div>


              {/* Actions */}
              <div className="mt-6 flex gap-3">

                {/* View Farm */}
                <button
                  type="button"
                  onClick={() =>
                    handleViewFarm(farm.id)
                  }
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-green-600 hover:text-green-400"
                >
                  View Farm
                </button>


                {/* Analyze */}
                <button
                  type="button"
                  onClick={() =>
                    handleAnalyzeFarm(farm)
                  }
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                >
                  Analyze
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}