"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ClimateProfile from "../../components/climate/ClimateProfile";

const FarmDetailMap = dynamic(
  () => import("../../components/map/FarmDetailMap"),
  {
    ssr: false,
  }
);

type Farm = {
  id: number;
  name: string;
  area_hectare: number;
  boundary: any;
  created_at: string | null;
};

type WeatherRecord = {
  date: string;
  temperature: number | null;
  precipitation: number | null;
  humidity: number | null;
  wind_speed: number | null;
  solar_radiation: number | null;
};

type WeatherResponse = {
  farm_id: number;
  farm_name: string;
  source: string;
  community: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  records: WeatherRecord[];
  record_count: number;
};

export default function FarmDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [weather, setWeather] =
    useState<WeatherResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;

        // Load farm
        const farmResponse = await fetch(
          `http://127.0.0.1:8000/api/farms/${id}`
        );

        if (!farmResponse.ok) {
          throw new Error("Farm not found.");
        }

        const farmData = await farmResponse.json();

        setFarm(farmData);
        setLoading(false);

        // Load NASA POWER weather
        try {
          const weatherResponse = await fetch(
            `http://127.0.0.1:8000/api/farms/${id}/weather`
          );

          if (!weatherResponse.ok) {
            throw new Error(
              "Failed to load NASA weather data."
            );
          }

          const weatherData =
            await weatherResponse.json();

          setWeather(weatherData);
        } catch (weatherErr: any) {
          console.error(weatherErr);

          setWeatherError(
            weatherErr.message ||
              "Failed to load NASA weather data."
          );
        } finally {
          setWeatherLoading(false);
        }
      } catch (err: any) {
        console.error(err);

        setError(
          err.message || "Failed to load farm."
        );

        setLoading(false);
        setWeatherLoading(false);
      }
    };

    loadData();
  }, [params]);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading farm...
      </main>
    );
  }

  // Error
  if (error || !farm) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p className="text-red-400">
          {error || "Farm not found."}
        </p>

        <Link
          href="/"
          className="mt-5 inline-block text-green-400 hover:text-green-300"
        >
          ← Back to Farms
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <section className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-8">

          <Link
            href="/"
            className="text-sm text-green-400 hover:text-green-300"
          >
            ← Back to Farms
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
                Farm Details
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {farm.name}
              </h1>

              <p className="mt-2 text-slate-400">
                Farm #{farm.id} · Saved farm boundary
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
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

          </div>
        </div>
      </section>

      {/* Farm Map */}
      <section className="mx-auto max-w-7xl px-6 pt-8">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Farm Boundary
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Saved geographic boundary of this farm.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl">
            <FarmDetailMap
              boundary={farm.boundary}
            />
          </div>

        </div>

      </section>

      {/* NASA Climate Profile */}
      <section className="mx-auto max-w-7xl px-6 pb-20">

        {weatherLoading && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

            <div className="text-lg font-semibold text-white">
              Loading NASA climate data...
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Fetching the latest 30 days of NASA POWER data.
            </p>

          </div>
        )}

        {!weatherLoading && weatherError && (
          <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/20 p-6">

            <p className="font-semibold text-red-400">
              NASA data unavailable
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {weatherError}
            </p>

          </div>
        )}

        {!weatherLoading &&
          !weatherError &&
          weather && (
            <ClimateProfile
              farmName={weather.farm_name}
              latitude={weather.latitude}
              longitude={weather.longitude}
              records={weather.records}
            />
          )}

      </section>

    </main>
  );
}