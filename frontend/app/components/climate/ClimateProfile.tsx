"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type WeatherRecord = {
  date: string;
  temperature: number | null;
  precipitation: number | null;
  humidity: number | null;
  wind_speed: number | null;
  solar_radiation: number | null;
};

type ClimateProfileProps = {
  farmName: string;
  latitude: number;
  longitude: number;
  records: WeatherRecord[];
};

export default function ClimateProfile({
  farmName,
  latitude,
  longitude,
  records,
}: ClimateProfileProps) {
  // --------------------------------
  // Valid NASA observations
  // --------------------------------

  const validRecords = records.filter(
    (r) =>
      r.temperature !== null ||
      r.precipitation !== null
  );

  // --------------------------------
  // Helper
  // --------------------------------

  const average = (values: number[]) =>
    values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;

  // --------------------------------
  // Extract values
  // --------------------------------

  const temperatures = validRecords
    .map((r) => r.temperature)
    .filter((v): v is number => v !== null);

  const rainfall = validRecords
    .map((r) => r.precipitation)
    .filter((v): v is number => v !== null);

  const humidity = validRecords
    .map((r) => r.humidity)
    .filter((v): v is number => v !== null);

  const wind = validRecords
    .map((r) => r.wind_speed)
    .filter((v): v is number => v !== null);

  const solar = validRecords
    .map((r) => r.solar_radiation)
    .filter((v): v is number => v !== null);

  // --------------------------------
  // Climate summary
  // --------------------------------

  const avgTemperature = average(temperatures);

  const totalRainfall = rainfall.reduce(
    (a, b) => a + b,
    0
  );

  const avgHumidity = average(humidity);

  const avgWind = average(wind);

  const avgSolar = average(solar);

  // --------------------------------
  // Climate Indicators
  // --------------------------------

  const dryDays = validRecords.filter(
    (r) =>
      r.precipitation !== null &&
      r.precipitation < 1
  ).length;

  const rainyDays = validRecords.filter(
    (r) =>
      r.precipitation !== null &&
      r.precipitation >= 1
  ).length;

  const hotDays = validRecords.filter(
    (r) =>
      r.temperature !== null &&
      r.temperature >= 30
  ).length;

  const veryHotDays = validRecords.filter(
    (r) =>
      r.temperature !== null &&
      r.temperature >= 32
  ).length;

  // --------------------------------
  // Heat Stress
  // --------------------------------

  let heatStatus = "Low";
  let heatColor = "text-green-400";

  if (veryHotDays >= 5) {
    heatStatus = "High";
    heatColor = "text-red-400";
  } else if (hotDays >= 5) {
    heatStatus = "Moderate";
    heatColor = "text-yellow-400";
  }

  // --------------------------------
  // Rainfall Pattern
  // --------------------------------

  let rainfallStatus = "Low";
  let rainfallColor = "text-yellow-400";

  if (totalRainfall >= 200) {
    rainfallStatus = "High";
    rainfallColor = "text-blue-400";
  } else if (totalRainfall >= 100) {
    rainfallStatus = "Moderate";
    rainfallColor = "text-green-400";
  }

  // --------------------------------
  // Dry Period
  // --------------------------------

  let dryPeriodStatus = "Normal";
  let dryPeriodColor = "text-green-400";

  if (dryDays >= 15) {
    dryPeriodStatus = "High";
    dryPeriodColor = "text-red-400";
  } else if (dryDays >= 7) {
    dryPeriodStatus = "Moderate";
    dryPeriodColor = "text-yellow-400";
  }

  // --------------------------------
  // Humidity
  // --------------------------------

  let humidityStatus = "Normal";
  let humidityColor = "text-green-400";

  if (avgHumidity >= 85) {
    humidityStatus = "High";
    humidityColor = "text-yellow-400";
  } else if (avgHumidity < 60) {
    humidityStatus = "Low";
    humidityColor = "text-yellow-400";
  }

  // --------------------------------
  // Chart Data
  // --------------------------------

  const chartData = validRecords.map((r) => ({
    date: r.date.slice(5),
    temperature: r.temperature,
    rainfall: r.precipitation,
  }));

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <section className="mt-8 space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
          NASA Climate Profile
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          {farmName}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          NASA POWER agroclimatology data
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Location: {latitude.toFixed(4)},{" "}
          {longitude.toFixed(4)}
        </p>
      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {/* Temperature */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm font-medium text-slate-300">
            Avg Temperature
          </p>

          <p className="mt-3 text-3xl font-bold !text-orange-400">
            {avgTemperature.toFixed(1)}°C
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Average temperature
          </p>
        </div>

        {/* Rainfall */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm font-medium text-slate-300">
            Total Rainfall
          </p>

          <p className="mt-3 text-3xl font-bold !text-blue-400">
            {totalRainfall.toFixed(1)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            mm · 30 days
          </p>
        </div>

        {/* Humidity */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm font-medium text-slate-300">
            Avg Humidity
          </p>

          <p className="mt-3 text-3xl font-bold !text-cyan-400">
            {avgHumidity.toFixed(1)}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Average relative humidity
          </p>
        </div>

        {/* Wind */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm font-medium text-slate-300">
            Avg Wind
          </p>

          <p className="mt-3 text-3xl font-bold !text-green-400">
            {avgWind.toFixed(1)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            m/s
          </p>
        </div>

        {/* Solar */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm font-medium text-slate-300">
            Avg Solar
          </p>

          <p className="mt-3 text-3xl font-bold !text-yellow-400">
            {avgSolar.toFixed(1)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            kWh/m²/day
          </p>
        </div>

      </div>

      {/* =========================================
          CLIMATE INDICATORS
      ========================================= */}

      <div className="space-y-4">

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
            Climate Indicators
          </p>

          <h3 className="mt-1 text-xl font-bold text-white">
            Farm Climate Risk Summary
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Indicative indicators calculated from recent NASA POWER observations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          {/* Heat Stress */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-300">
                Heat Stress
              </p>

              <span className="text-xl">
                🌡️
              </span>
            </div>

            <p
              className={`mt-4 text-2xl font-bold ${heatColor}`}
            >
              {heatStatus}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {hotDays} days ≥ 30°C
            </p>

            <p className="mt-1 text-xs text-slate-600">
              {veryHotDays} days ≥ 32°C
            </p>

          </div>

          {/* Rainfall Pattern */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-300">
                Rainfall Pattern
              </p>

              <span className="text-xl">
                🌧️
              </span>
            </div>

            <p
              className={`mt-4 text-2xl font-bold ${rainfallColor}`}
            >
              {rainfallStatus}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {rainyDays} rainy days
            </p>

            <p className="mt-1 text-xs text-slate-600">
              {totalRainfall.toFixed(1)} mm total
            </p>

          </div>

          {/* Dry Period */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-300">
                Dry Period
              </p>

              <span className="text-xl">
                ☀️
              </span>
            </div>

            <p
              className={`mt-4 text-2xl font-bold ${dryPeriodColor}`}
            >
              {dryPeriodStatus}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {dryDays} dry days
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Rainfall &lt; 1 mm/day
            </p>

          </div>

          {/* Humidity */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-300">
                Humidity
              </p>

              <span className="text-xl">
                💧
              </span>
            </div>

            <p
              className={`mt-4 text-2xl font-bold ${humidityColor}`}
            >
              {humidityStatus}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Average {avgHumidity.toFixed(1)}%
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Relative humidity
            </p>

          </div>

        </div>

      </div>

      {/* =========================================
          CHARTS
      ========================================= */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Temperature */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="mb-5 text-lg font-semibold text-white">
            Temperature Trend
          </h3>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="temperature"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* Rainfall */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="mb-5 text-lg font-semibold text-white">
            Rainfall Trend
          </h3>

          <div className="h-72">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="rainfall"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* =========================================
          DATA SOURCE
      ========================================= */}

      <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-4">

        <p className="text-sm font-medium text-green-400">
          Data Source
        </p>

        <p className="mt-1 text-sm text-slate-400">
          NASA Prediction Of Worldwide Energy Resources (POWER)
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Community: AG · Valid observations:{" "}
          {validRecords.length}
        </p>

      </div>

    </section>
  );
}