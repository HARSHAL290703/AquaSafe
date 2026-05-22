import { useEffect, useState } from "react";
import { FaBell, FaWater, FaWifi } from "react-icons/fa";
import AlarmSoundSwitch from "./AlarmSoundSwitch";

function Header({ alertActive, alarmSoundEnabled, onAlarmSoundChange }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass-panel animate-slide-up overflow-hidden rounded-2xl border border-white/50 p-5 shadow-xl">
      <div className="pointer-events-none absolute inset-0 -z-10 animate-gradient-bg bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-cyan-500/5" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl text-white shadow-lg shadow-cyan-500/30">
            <FaWater />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="bg-gradient-to-r from-cyan-700 to-blue-800 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                AquaSafe Monitor
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-live-pulse" />
                LIVE
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Real-time drowning detection & vitals
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <FaWifi className="text-cyan-500" />
              {time.toLocaleString(undefined, {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {onAlarmSoundChange && (
            <AlarmSoundSwitch
              enabled={alarmSoundEnabled}
              onChange={onAlarmSoundChange}
            />
          )}
          <div
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-bold transition-all duration-300 ${
              alertActive
                ? "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/35 scale-105"
                : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
            }`}
          >
            <FaBell className={alertActive ? "animate-bounce text-lg" : "text-lg"} />
            {alertActive ? "EMERGENCY" : "All clear"}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
