"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", icon: "▦", href: "/" },
    ],
  },
  {
    title: "FARM MANAGEMENT",
    items: [
      { name: "My Farms", icon: "⌂", href: "/farms" },
      { name: "Environmental Intelligence", icon: "☁", href: "#" },
      { name: "Field Monitoring", icon: "◎", href: "#" },
    ],
  },
  {
    title: "AGRICULTURE INTELLIGENCE",
    items: [
      { name: "Crop Lab", icon: "♧", href: "#" },
      { name: "Crop Rotation Studio", icon: "⟳", href: "#" },
      { name: "Climate Center", icon: "☀", href: "#" },
      { name: "Water Management", icon: "♢", href: "#" },
      { name: "Risk & Alerts", icon: "⚠", href: "#" },
      { name: "Adaptation Plan", icon: "▤", href: "#" },
    ],
  },
  {
    title: "SMART IOT MONITORING",
    items: [
      { name: "IoT Monitoring", icon: "◉", href: "/iot" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Reports & Analytics", icon: "▥", href: "#" },
      { name: "Data Integrations", icon: "⇄", href: "#" },
      { name: "Settings", icon: "⚙", href: "#" },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white transition-all duration-300 ${
        collapsed ? "w-[76px]" : "w-[270px]"
      }`}
    >
      {/* Logo and Toggle */}
      <div className="flex h-[76px] items-center justify-between border-b border-slate-800 px-4">

        {!collapsed && (
          <Link href="/" className="min-w-0">
            <h1 className="text-2xl font-bold">
              Agri<span className="text-emerald-400">Shift</span>
            </h1>
            <p className="text-[10px] text-slate-400">
              Smart Agriculture Platform
            </p>
          </Link>
        )}

        {collapsed && (
          <Link href="/" className="text-xl font-bold text-emerald-400">
            A
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <span className="text-xl">
            {collapsed ? "☰" : "◀"}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-5">

        {menuGroups.map((group) => (
          <div key={group.title}>

            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-bold tracking-widest text-slate-500">
                {group.title}
              </p>
            )}

            {collapsed && (
              <div className="mb-3 border-t border-slate-800" />
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href !== "#" &&
                  (item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href));

                const isIoT = item.href === "/iot";

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`group flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                      active
                        ? "bg-emerald-700 text-white shadow-lg shadow-emerald-950/30"
                        : isIoT
                        ? "text-emerald-400 hover:bg-emerald-500/10"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg">
                      {item.icon}
                    </span>

                    {!collapsed && (
                      <span className="truncate text-[13px] font-medium">
                        {item.name}
                      </span>
                    )}

                    {!collapsed && isIoT && !active && (
                      <span className="ml-auto rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                        IoT
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 p-3">
        {!collapsed ? (
          <div className="rounded-lg bg-slate-900 p-3">
            <p className="text-xs font-semibold text-slate-300">
              AgriShift
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Climate-Smart Agriculture
            </p>
          </div>
        ) : (
          <div
            title="AgriShift"
            className="text-center text-emerald-400"
          >
            ✦
          </div>
        )}
      </div>
    </aside>
  );
}