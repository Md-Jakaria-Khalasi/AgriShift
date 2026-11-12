
"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import FarmDashboard from "./components/farm/FarmDashboard";

const FarmMap = dynamic(
  () => import("./components/map/FarmMap"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <h1 className="text-2xl font-bold">
              Agri<span className="text-green-400">Shift</span>
            </h1>
            <p className="text-xs text-slate-400">
              NASA-Powered Climate Smart Agriculture
            </p>
          </Link>

          {/* Navigation Menu */}
          <div className="flex items-center gap-3 sm:gap-6">

            <Link
              href="/"
              className="text-sm font-medium text-slate-300 transition hover:text-green-400"
            >
              Home
            </Link>

            <Link
              href="/iot"
              className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400 transition hover:bg-green-500/20"
            >
              <span>◉</span>
              IoT Monitoring
            </Link>

          </div>
        </div>
      </nav>

      {/* Hero Section */}
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

      {/* Farm Map Section */}
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
