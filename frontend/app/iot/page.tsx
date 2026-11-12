
"use client";

import { useState } from "react";
import type { ReactNode } from "react";

/* =========================
   TYPES
========================= */

type Tab =
  | "overview"
  | "irrigation"
  | "soil"
  | "weather"
  | "crop"
  | "energy"
  | "automation"
  | "alerts"
  | "devices"
  | "history";

type Device = {
  id: number;
  name: string;
  type: string;
  location: string;
  status: boolean;
};

type AlertItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  level: "warning" | "success" | "danger";
  read: boolean;
};

/* =========================
   NAVIGATION
========================= */

const navigation: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "irrigation", label: "Smart Irrigation", icon: "💧" },
  { id: "soil", label: "Soil Monitoring", icon: "🌱" },
  { id: "weather", label: "Weather Station", icon: "☀" },
  { id: "crop", label: "Crop Monitoring", icon: "🌿" },
  { id: "energy", label: "Energy Monitoring", icon: "⚡" },
  { id: "automation", label: "Automation & Rules", icon: "⚙" },
  { id: "alerts", label: "Alerts & Notifications", icon: "🔔" },
  { id: "devices", label: "Device Management", icon: "▣" },
  { id: "history", label: "Sensor History", icon: "▤" },
];

const initialDevices: Device[] = [
  { id: 1, name: "ESP32 Main Controller", type: "Controller", location: "Farm Zone A", status: true },
  { id: 2, name: "Soil Moisture Sensor 01", type: "Soil Sensor", location: "Farm Zone A", status: true },
  { id: 3, name: "DHT22 Weather Sensor", type: "Weather Sensor", location: "Weather Station", status: true },
  { id: 4, name: "Water Flow Sensor", type: "Flow Sensor", location: "Water Pump", status: true },
  { id: 5, name: "Tank Level Sensor", type: "Level Sensor", location: "Water Tank", status: true },
  { id: 6, name: "Soil pH Sensor", type: "Soil Sensor", location: "Farm Zone B", status: false },
];

const initialAlerts: AlertItem[] = [
  {
    id: 1,
    title: "Soil Moisture Low",
    message: "Farm Zone A moisture is below the configured threshold.",
    time: "10 minutes ago",
    level: "warning",
    read: false,
  },
  {
    id: 2,
    title: "Tank Level Normal",
    message: "Water tank level is currently sufficient.",
    time: "25 minutes ago",
    level: "success",
    read: false,
  },
  {
    id: 3,
    title: "pH Sensor Offline",
    message: "Soil pH Sensor 01 is not responding.",
    time: "1 hour ago",
    level: "danger",
    read: false,
  },
];

/* =========================
   REUSABLE COMPONENTS
========================= */

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 p-5 ${className}`}>
      {children}
    </div>
  );
}

function Heading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  icon,
  color = "emerald",
  detail,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: string;
  color?: string;
  detail: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    purple: "bg-purple-500/10 text-purple-400",
    red: "bg-red-500/10 text-red-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{value}</span>
            {unit && <span className="text-sm text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${colors[color] || colors.emerald}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">{detail}</p>
    </Card>
  );
}

function Toggle({
  value,
  onChange,
  disabled = false,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!value)}
      aria-label={value ? "Turn off" : "Turn on"}
      className={`relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${
        value ? "bg-emerald-500" : "bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
          value ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function Progress({
  label,
  value,
  color = "bg-emerald-400",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

/* =========================
   MAIN DASHBOARD
========================= */

export default function IoTDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [pumpOn, setPumpOn] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [valves, setValves] = useState([true, false, false]);
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [rules, setRules] = useState([
    { id: 1, name: "Low Soil Moisture Irrigation", description: "Start irrigation when soil moisture falls below 30%", enabled: true },
    { id: 2, name: "Rain Detection Protection", description: "Pause irrigation during rainfall", enabled: true },
    { id: 3, name: "Low Tank Protection", description: "Prevent pump operation when tank level is low", enabled: true },
    { id: 4, name: "Maximum Pump Runtime", description: "Stop pump after maximum allowed runtime", enabled: true },
    { id: 5, name: "Night Irrigation Schedule", description: "Schedule irrigation during selected hours", enabled: false },
  ]);

  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [threshold, setThreshold] = useState(30);
  const [pumpSchedule, setPumpSchedule] = useState("06:00");
  const [historyRange, setHistoryRange] = useState("24 Hours");
  const [zone, setZone] = useState("Farm Zone A");

  const enabledDevices = devices.filter((device) => device.status).length;
  const pageTitle = navigation.find((item) => item.id === activeTab)?.label;

  const toggleValve = (index: number) => {
    setValves((previous) =>
      previous.map((value, i) => (i === index ? !value : value))
    );
  };

  /* =========================
     OVERVIEW
  ========================= */

  const renderOverview = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Soil Moisture" value="32" unit="%" icon="💧" color="blue" detail="Farm Zone A · Demo" />
        <Metric label="Temperature" value="29.5" unit="°C" icon="☀" color="yellow" detail="Local reading · Demo" />
        <Metric label="Humidity" value="68" unit="%" icon="☁" color="cyan" detail="Atmospheric humidity · Demo" />
        <Metric label="Water Tank" value="82" unit="%" icon="🛢" color="purple" detail="Tank capacity · Demo" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <Heading title="Smart Irrigation Control" subtitle="Monitor and control your water pump" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Water Pump</span>
                <span className={`rounded-full px-3 py-1 text-xs ${pumpOn ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                  {pumpOn ? "ON" : "OFF"}
                </span>
              </div>
              <div className="my-6 text-5xl">🚰</div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Main Pump</p>
                  <p className="text-xs text-slate-500">Illustrative control state</p>
                </div>
                <Toggle value={pumpOn} disabled={autoMode} onChange={setPumpOn} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">Irrigation Mode</p>
              <h3 className="mt-4 text-2xl font-bold text-white">{autoMode ? "Automatic" : "Manual"}</h3>
              <p className="mt-2 text-xs text-slate-500">Select your irrigation mode.</p>
              <div className="mt-6 flex gap-2">
                <button onClick={() => { setAutoMode(true); setPumpOn(false); }} className={`flex-1 rounded-lg px-3 py-2 text-sm ${autoMode ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>Auto</button>
                <button onClick={() => setAutoMode(false)} className={`flex-1 rounded-lg px-3 py-2 text-sm ${!autoMode ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>Manual</button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Metric label="Water Flow" value={pumpOn ? "12.5" : "0"} unit="L/min" icon="↗" color="blue" detail="Demo reading" />
            <Metric label="Today's Usage" value="450" unit="L" icon="💧" color="cyan" detail="Demo consumption" />
            <Metric label="Pump Runtime" value={pumpOn ? "Running" : "Stopped"} icon="◷" color="purple" detail="Demo state" />
          </div>
        </Card>

        <Card>
          <Heading title="Device Status" subtitle="Connected hardware overview" />
          <div className="mb-5 flex items-center justify-between rounded-xl bg-slate-950 p-4">
            <div>
              <p className="text-3xl font-bold text-white">{enabledDevices}/{devices.length}</p>
              <p className="text-xs text-slate-500">Enabled devices (demo)</p>
            </div>
            <div className="text-3xl text-emerald-400">◉</div>
          </div>
          <div className="space-y-4">
            {devices.slice(0, 5).map((device) => (
              <div key={device.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-slate-200">{device.name}</p>
                  <p className="text-xs text-slate-500">{device.location}</p>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${device.status ? "bg-emerald-400" : "bg-red-400"}`} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Heading title="Soil Conditions" subtitle="Latest soil sensor readings" />
          <div className="space-y-5">
            <Progress label="Soil Moisture" value={32} color="bg-blue-400" />
            <Progress label="Soil pH indicator" value={65} />
            <Progress label="Soil EC indicator" value={48} color="bg-purple-400" />
            <Progress label="Soil Temperature indicator" value={57} color="bg-yellow-400" />
          </div>
          <p className="mt-4 text-xs text-slate-500">Illustrative indicators, not laboratory-calibrated measurements.</p>
        </Card>

        <Card>
          <Heading title="Recent Alerts" subtitle="Latest system notifications" />
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex gap-3 rounded-xl bg-slate-950 p-3">
                <span className={alert.level === "danger" ? "text-red-400" : alert.level === "warning" ? "text-yellow-400" : "text-emerald-400"}>●</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{alert.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{alert.message}</p>
                  <p className="mt-2 text-[10px] text-slate-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab("alerts")} className="mt-4 text-sm text-emerald-400">View all alerts →</button>
        </Card>
      </div>
    </>
  );

  /* =========================
     SMART IRRIGATION
  ========================= */

  const renderIrrigation = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Water Tank Level" value="82" unit="%" icon="🛢" color="blue" detail="Tank capacity · Demo" />
        <Metric label="Water Flow Rate" value={pumpOn ? "12.5" : "0"} unit="L/min" icon="↗" color="cyan" detail="Demo flow reading" />
        <Metric label="Water Consumption" value="450" unit="L" icon="💧" color="purple" detail="Today's total · Demo" />
        <Metric label="Pump Status" value={pumpOn ? "ON" : "OFF"} icon="🚰" color="emerald" detail="Illustrative pump state" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <Heading title="Main Water Pump" subtitle="Pump operation and manual control" />
          <div className="rounded-xl bg-slate-950 p-6 text-center">
            <div className="text-6xl">🚰</div>
            <h3 className="mt-4 text-2xl font-bold text-white">{pumpOn ? "Pump Running" : "Pump Stopped"}</h3>
            <p className="mt-2 text-sm text-slate-400">Simulated control state</p>
            <button disabled={autoMode} onClick={() => setPumpOn(!pumpOn)} className={`mt-6 rounded-xl px-10 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${pumpOn ? "bg-red-500 text-white" : "bg-emerald-600 text-white"}`}>
              {pumpOn ? "STOP PUMP" : "START PUMP"}
            </button>
            {autoMode && <p className="mt-3 text-xs text-yellow-400">Switch to Manual mode to enable pump control.</p>}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Automatic Mode</p>
              <p className="text-xs text-slate-500">Rule-based irrigation mode</p>
            </div>
            <Toggle value={autoMode} onChange={(v) => { setAutoMode(v); if (v) setPumpOn(false); }} />
          </div>
        </Card>

        <Card>
          <Heading title="Irrigation Settings" subtitle="Configure your irrigation conditions" />
          <label className="mb-3 block text-sm text-slate-300">
            Soil moisture threshold: <strong className="text-emerald-400">{threshold}%</strong>
          </label>
          <input type="range" min="10" max="70" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-emerald-500" />
          <div className="mt-2 flex justify-between text-xs text-slate-500"><span>10% (Dry)</span><span>70% (Wet)</span></div>
          <div className="mt-6">
            <label className="mb-2 block text-sm text-slate-300">Scheduled irrigation time</label>
            <input type="time" value={pumpSchedule} onChange={(e) => setPumpSchedule(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white" />
          </div>
          <div className="mt-5 rounded-xl bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-400">Configured Threshold</p>
            <p className="mt-1 text-xs text-slate-400">Moisture below {threshold}% can request irrigation, subject to safety checks.</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <Heading title="Zone Valve Control" subtitle="Manage water supply for different farm zones" />
        <div className="grid gap-4 md:grid-cols-3">
          {["Farm Zone A", "Farm Zone B", "Farm Zone C"].map((name, i) => (
            <div key={name} className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="flex justify-between">
                <span className="text-2xl">💧</span>
                <Toggle value={valves[i]} onChange={() => toggleValve(i)} />
              </div>
              <h3 className="mt-4 font-semibold text-white">{name}</h3>
              <p className={`mt-1 text-xs ${valves[i] ? "text-emerald-400" : "text-slate-500"}`}>{valves[i] ? "Valve Open" : "Valve Closed"}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Water Tank</h3>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative flex h-32 w-20 items-end overflow-hidden rounded-lg border-2 border-blue-400/50 bg-slate-950">
              <div className="w-full bg-blue-500/70" style={{ height: "82%" }} />
            </div>
            <div>
              <p className="text-3xl font-bold text-white">82%</p>
              <p className="text-sm text-slate-400">Tank capacity</p>
              <p className="mt-3 text-xs text-emerald-400">Demo reading</p>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-white">Water Flow Monitoring</h3>
          <p className="mt-5 text-3xl font-bold text-white">{pumpOn ? "12.5" : "0"} <span className="text-sm font-normal text-slate-400">L/min</span></p>
          <p className="mt-2 text-xs text-slate-500">Illustrative flow sensor value</p>
          <div className="mt-5"><Progress label="Daily water target" value={45} color="bg-blue-400" /></div>
        </Card>
      </div>
    </>
  );

  /* =========================
     SOIL MONITORING
  ========================= */

  const renderSoil = () => (
    <>
      <div className="mb-6">
        <label className="mr-3 text-sm text-slate-400">Farm zone</label>
        <select value={zone} onChange={(e) => setZone(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white">
          <option>Farm Zone A</option>
          <option>Farm Zone B</option>
          <option>Farm Zone C</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Soil Moisture" value="32" unit="%" icon="💧" color="blue" detail={`${zone} · Demo`} />
        <Metric label="Soil Temperature" value="26.4" unit="°C" icon="🌡" color="yellow" detail="Demo reading" />
        <Metric label="Soil pH" value="6.5" icon="⚗" color="emerald" detail="Demo reading" />
        <Metric label="Soil EC" value="1.2" unit="mS/cm" icon="〰" color="purple" detail="Demo reading" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Heading title="Soil Nutrient Monitoring" subtitle="NPK sensor readings (illustrative)" />
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Nitrogen", "45", "mg/kg", "text-emerald-400"],
              ["Phosphorus", "32", "mg/kg", "text-blue-400"],
              ["Potassium", "38", "mg/kg", "text-yellow-400"],
            ].map(([name, value, unit, color]) => (
              <div key={name} className="rounded-xl bg-slate-950 p-4 text-center">
                <p className="text-xs text-slate-400">{name}</p>
                <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500">{unit}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">Actual nutrient values require a compatible, calibrated sensor.</p>
        </Card>

        <Card>
          <Heading title="Soil Condition Summary" subtitle="Selected zone sensor indicators" />
          <div className="space-y-5">
            <Progress label="Moisture" value={32} color="bg-blue-400" />
            <Progress label="pH display indicator" value={65} />
            <Progress label="EC indicator" value={48} color="bg-purple-400" />
          </div>
          <div className="mt-5 rounded-xl bg-slate-950 p-4">
            <p className="text-sm text-white">Soil monitoring status</p>
            <p className="mt-1 text-xs text-emerald-400">Demo sensor readings displayed</p>
          </div>
        </Card>
      </div>
    </>
  );

  /* =========================
     WEATHER STATION
  ========================= */

  const renderWeather = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Air Temperature" value="29.5" unit="°C" icon="☀" color="yellow" detail="Demo reading" />
        <Metric label="Humidity" value="68" unit="%" icon="☁" color="blue" detail="Relative humidity · Demo" />
        <Metric label="Rainfall" value="2.4" unit="mm" icon="🌧" color="cyan" detail="Daily rainfall · Demo" />
        <Metric label="Wind Speed" value="12" unit="km/h" icon="💨" color="purple" detail="Demo reading" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Heading title="Environmental Conditions" subtitle="Local weather station measurements" />
          <div className="space-y-5">
            <Progress label="Humidity" value={68} color="bg-blue-400" />
            <Progress label="Light intensity indicator" value={75} color="bg-yellow-400" />
            <Progress label="Rainfall indicator" value={24} color="bg-cyan-400" />
          </div>
        </Card>

        <Card>
          <Heading title="Additional Weather Sensors" subtitle="Environmental monitoring" />
          <div className="space-y-4">
            {[
              ["Wind Direction", "NE", "🧭"],
              ["Light Intensity", "12,500 lux", "☀"],
              ["Leaf Wetness", "28%", "🍃"],
              ["Rain Sensor", "No active rain", "🌧"],
            ].map(([name, value, icon]) => (
              <div key={name} className="flex items-center justify-between rounded-lg bg-slate-950 p-3">
                <span className="text-sm text-slate-300">{icon} {name}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );

  /* =========================
     CROP MONITORING
  ========================= */

  const renderCrop = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Metric label="Leaf Wetness" value="28" unit="%" icon="🍃" color="emerald" detail="Demo reading" />
        <Metric label="Plant Environment" value="29.5" unit="°C" icon="🌿" color="yellow" detail="Environmental temperature" />
        <Metric label="Light Intensity" value="12,500" unit="lux" icon="☀" color="purple" detail="Demo reading" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Heading title="Crop Environment" subtitle="Plant growing condition indicators" />
          <div className="space-y-5">
            <Progress label="Leaf wetness indicator" value={28} color="bg-cyan-400" />
            <Progress label="Light intensity indicator" value={75} color="bg-yellow-400" />
            <Progress label="Environment humidity" value={68} color="bg-blue-400" />
          </div>
        </Card>

        <Card>
          <Heading title="Crop Observation" subtitle="Camera and plant monitoring integration" />
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center">
            <span className="text-5xl">📷</span>
            <p className="mt-4 font-semibold text-white">Crop Camera Integration</p>
            <p className="mt-2 text-xs text-slate-500">Connect an IP camera or ESP32-CAM for image-based crop observation.</p>
            <span className="mt-4 rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">Not Connected</span>
          </div>
        </Card>
      </div>
    </>
  );

  /* =========================
     ENERGY MONITORING
  ========================= */

  const renderEnergy = () => (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Voltage" value="220" unit="V" icon="⚡" color="yellow" detail="Illustrative reading" />
        <Metric label="Current" value="2.5" unit="A" icon="〰" color="blue" detail="Illustrative reading" />
        <Metric label="Power" value="550" unit="W" icon="🔌" color="purple" detail="Illustrative reading" />
        <Metric label="Energy Today" value="3.2" unit="kWh" icon="☀" color="emerald" detail="Illustrative consumption" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Heading title="Pump Energy Monitoring" subtitle="Electrical consumption and equipment status" />
          <div className="space-y-4">
            {[
              ["Pump Voltage", "220 V"],
              ["Pump Current", "2.5 A"],
              ["Active Power", "550 W"],
              ["Power Factor", "0.90"],
              ["Running Hours", "3.2 hours"],
            ].map(([name, value]) => (
              <div key={name} className="flex justify-between border-b border-slate-800 pb-3">
                <span className="text-sm text-slate-400">{name}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Heading title="Solar Energy" subtitle="Future solar monitoring integration" />
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl bg-slate-950 p-6 text-center">
            <span className="text-5xl">☀</span>
            <p className="mt-4 font-semibold text-white">Solar Panel Monitoring</p>
            <p className="mt-2 text-xs text-slate-500">Connect a compatible energy meter or solar inverter to monitor generation.</p>
            <span className="mt-4 inline-block rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">Hardware Required</span>
          </div>
        </Card>
      </div>
    </>
  );

  /* =========================
     AUTOMATION
  ========================= */

  const renderAutomation = () => (
    <Card>
      <Heading title="Automation Rules" subtitle="Configure automatic farm operations" />

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex-1">
              <p className="font-semibold text-white">{rule.name}</p>
              <p className="mt-1 text-xs text-slate-400">{rule.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${rule.enabled ? "text-emerald-400" : "text-slate-500"}`}>
                {rule.enabled ? "Enabled" : "Disabled"}
              </span>
              <Toggle value={rule.enabled} onChange={(v) => setRules((previous) => previous.map((r) => r.id === rule.id ? { ...r, enabled: v } : r))} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-yellow-500/10 p-4">
        <p className="text-sm font-semibold text-yellow-400">Automation Configuration</p>
        <p className="mt-1 text-xs text-slate-400">These are interface-level demo rules. Actual execution requires backend logic, sensor readings and a connected controller.</p>
      </div>
    </Card>
  );

  /* =========================
     ALERTS
  ========================= */

  const renderAlerts = () => (
    <Card>
      <Heading
        title="Alerts & Notifications"
        subtitle="Monitor sensor, equipment and irrigation notifications"
        action={
          <button onClick={() => setAlerts((previous) => previous.map((a) => ({ ...a, read: true })))} className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-white hover:bg-slate-700">
            Mark all read
          </button>
        }
      />

      <div className="space-y-3">
        {alerts.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No alerts available.</p>}

        {alerts.map((alert) => (
          <div key={alert.id} className={`flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4 ${alert.read ? "border-slate-800 bg-slate-950/50" : "border-slate-700 bg-slate-950"}`}>
            <div className="flex gap-3">
              <span className={`mt-1 text-xl ${alert.level === "danger" ? "text-red-400" : alert.level === "warning" ? "text-yellow-400" : "text-emerald-400"}`}>●</span>
              <div>
                <p className="font-semibold text-white">{alert.title}</p>
                <p className="mt-1 text-sm text-slate-400">{alert.message}</p>
                <p className="mt-2 text-xs text-slate-500">{alert.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{alert.read ? "Read" : "Unread"}</span>
              <button onClick={() => setAlerts((previous) => previous.map((a) => a.id === alert.id ? { ...a, read: true } : a))} className="text-xs text-emerald-400">Mark read</button>
              <button onClick={() => setAlerts((previous) => previous.filter((a) => a.id !== alert.id))} className="text-xs text-red-400">Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  /* =========================
     DEVICE MANAGEMENT
  ========================= */

  const renderDevices = () => (
    <Card>
      <Heading title="Device Management" subtitle="Monitor and manage IoT hardware devices" />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Total Devices" value={String(devices.length)} icon="▣" detail="Registered devices" />
        <Metric label="Online" value={String(enabledDevices)} icon="◉" color="emerald" detail="Enabled in this demo" />
        <Metric label="Offline" value={String(devices.length - enabledDevices)} icon="○" color="red" detail="Disabled in this demo" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-slate-800 text-xs text-slate-500">
            <tr>
              <th className="p-3">Device</th>
              <th className="p-3">Type</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Control</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id} className="border-b border-slate-800/70">
                <td className="p-3 font-medium text-white">{device.name}</td>
                <td className="p-3 text-slate-400">{device.type}</td>
                <td className="p-3 text-slate-400">{device.location}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${device.status ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {device.status ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="p-3">
                  <Toggle value={device.status} onChange={(v) => setDevices((previous) => previous.map((d) => d.id === device.id ? { ...d, status: v } : d))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">Device status controls are simulated locally. They do not connect or disconnect physical hardware.</p>
    </Card>
  );

  /* =========================
     SENSOR HISTORY
  ========================= */

  const renderHistory = () => {
    const chartData =
      historyRange === "24 Hours"
        ? [30, 38, 34, 42, 39, 48, 44, 52, 45, 58, 50, 62]
        : historyRange === "7 Days"
        ? [38, 45, 41, 56, 48, 60, 52, 65, 58, 70, 62, 68]
        : [45, 40, 55, 48, 62, 53, 66, 58, 72, 64, 76, 68];

    return (
      <>
        <Card>
          <Heading
            title="Sensor History"
            subtitle="Historical sensor readings and trends"
            action={
              <select value={historyRange} onChange={(e) => setHistoryRange(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white">
                <option>24 Hours</option>
                <option>7 Days</option>
                <option>30 Days</option>
              </select>
            }
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Average Moisture" value="42" unit="%" icon="💧" color="blue" detail="Illustrative average" />
            <Metric label="Average Temperature" value="28.6" unit="°C" icon="🌡" color="yellow" detail="Illustrative average" />
            <Metric label="Water Consumption" value="450" unit="L" icon="↗" color="cyan" detail="Illustrative total" />
          </div>

          <div className="mt-8">
            <p className="mb-4 text-sm font-semibold text-white">Soil Moisture Trend</p>
            <div className="flex h-56 items-end gap-2 border-b border-l border-slate-700 px-2">
              {chartData.map((value, i) => (
                <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                  <span className="mb-1 text-[9px] text-slate-500 opacity-0 group-hover:opacity-100">{value}%</span>
                  <div className="w-full max-w-10 rounded-t-md bg-emerald-500/80 transition hover:bg-emerald-400" style={{ height: `${value * 2.2}px` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-slate-500">
              <span>Start</span><span>Time progression</span><span>Latest</span>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <Heading title="Sensor Data Records" subtitle="Example historical records" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b border-slate-800 text-xs text-slate-500">
                <tr>
                  <th className="p-3">Time</th>
                  <th className="p-3">Sensor</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["10:00 AM", "Soil Moisture", "32%", "Normal"],
                  ["09:30 AM", "Temperature", "29.5°C", "Normal"],
                  ["09:00 AM", "Humidity", "68%", "Normal"],
                  ["08:30 AM", "Water Flow", "0 L/min", "Pump Off"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b border-slate-800/70">
                    <td className="p-3 text-slate-400">{row[0]}</td>
                    <td className="p-3 text-white">{row[1]}</td>
                    <td className="p-3 text-white">{row[2]}</td>
                    <td className="p-3 text-emerald-400">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-500">Example records only; no historical database is connected.</p>
        </Card>
      </>
    );
  };

  /* =========================
     PAGE RENDERER
  ========================= */

  const pages: Record<Tab, () => ReactNode> = {
    overview: renderOverview,
    irrigation: renderIrrigation,
    soil: renderSoil,
    weather: renderWeather,
    crop: renderCrop,
    energy: renderEnergy,
    automation: renderAutomation,
    alerts: renderAlerts,
    devices: renderDevices,
    history: renderHistory,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">◉</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                AGRISHIFT / IoT SYSTEM
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              IoT Monitoring
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Smart Farm Automation & Environmental Monitoring
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2">
              <p className="text-[10px] text-slate-400">CONTROLLER STATUS</p>
              <p className="mt-1 text-xs font-semibold text-yellow-400">DEMO MODE</p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
              <p className="text-[10px] text-slate-400">ENABLED DEVICES</p>
              <p className="mt-1 text-xs font-semibold text-emerald-400">
                {enabledDevices} / {devices.length}
              </p>
            </div>
          </div>
        </div>

        {/* INTERNAL NAVIGATION */}
        <div className="mb-8 overflow-x-auto border-b border-slate-800">
          <div className="flex min-w-max gap-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === item.id
                    ? "border-emerald-400 bg-emerald-500/5 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div>
          <Heading
            title={pageTitle || "IoT Dashboard"}
            subtitle="AgriShift Smart Agriculture IoT Platform"
            action={
              <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-400">
                ● Simulated Data
              </span>
            }
          />

          {pages[activeTab]()}
        </div>

        {/* FOOTER */}
        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-slate-800 pt-5 text-xs text-slate-500">
          <p>AgriShift · Smart Agriculture & IoT Platform</p>
          <p>Hardware Integration: Pending · Demo UI</p>
        </div>

      </div>
    </main>
  );
}
