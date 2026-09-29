"use client";

import dynamic from "next/dynamic";



const FarmMap = dynamic(
  () => import("./components/map/FarmMap"),
  {
    ssr: false,
  }
);

import FarmDashboard from "./components/farm/FarmDashboard";


export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Agri<span className="text-green-400">Shift</span>
            </h1>

            <p className="text-xs text-slate-400">
              NASA-Powered Climate Smart Agriculture
            </p>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-green-400">
          NASA Earth Observation + AI
        </p>

        <h2 className="max-w-4xl text-5xl font-bold leading-tight">
          Make smarter farming decisions for a changing climate.
        </h2>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Analyze your farm using NASA environmental data, local
          agricultural information, climate risk, soil conditions
          and crop intelligence.
        </p>

      </section>

      {/* Farm Map */}
      <section className="mx-auto max-w-7xl px-6 pb-20">

        <div className="mb-6">
          <h2 className="text-3xl font-bold">
            Select Your Farm
          </h2>

          <p className="mt-2 text-slate-400">
            Draw your farm boundary on the map.
          </p>
        </div>

        <FarmMap />
        <FarmDashboard />

      </section>

    </main>
  );
}