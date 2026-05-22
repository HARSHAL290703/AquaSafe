import {
  FaHeartbeat,
  FaLungs,
  FaThermometerHalf,
  FaExclamationTriangle,
  FaShieldAlt,
} from "react-icons/fa";
import {
  isHeartRateCritical,
  isSpO2Critical,
  isTemperatureCritical,
  THRESHOLDS,
} from "../config/vitalsThresholds";
import AnimatedValue from "./AnimatedValue";

function VitalCard({ title, value, unit, icon: Icon, accent, warn, hint }) {
  return (
    <div
      className={`card-hover group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-md ${
        warn ? "border-red-300 ring-2 ring-red-100" : "border-slate-100"
      }`}
    >
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-xl bg-gradient-to-br ${accent}`}
      />
      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${accent}`}
        >
          <Icon />
        </div>
        {warn && (
          <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            CRITICAL
          </span>
        )}
      </div>
      <p className="relative mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p
        className={`relative mt-1 text-3xl font-bold md:text-4xl ${
          warn ? "text-red-600" : "text-slate-800"
        }`}
      >
        <AnimatedValue value={value} />
        {unit && (
          <span className="ml-1 text-lg font-semibold text-slate-400">{unit}</span>
        )}
      </p>
      {hint && <p className="relative mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function DashboardCards({ data }) {
  const cards = [
    {
      title: "Heart Rate",
      value: data.HeartRate,
      unit: "bpm",
      icon: FaHeartbeat,
      accent: "from-rose-500 to-pink-600",
      warn: isHeartRateCritical(data.HeartRate),
      hint: `${THRESHOLDS.heartRate.min}–${THRESHOLDS.heartRate.max} bpm`,
    },
    {
      title: "SpO2",
      value: data.SpO2,
      unit: "%",
      icon: FaLungs,
      accent: "from-sky-500 to-cyan-600",
      warn: isSpO2Critical(data.SpO2),
      hint: `≥ ${THRESHOLDS.spO2.min}%`,
    },
    {
      title: "Temperature",
      value: data.Temperature,
      unit: "°C",
      icon: FaThermometerHalf,
      accent: "from-amber-500 to-orange-600",
      warn: isTemperatureCritical(data.Temperature),
      hint: `${THRESHOLDS.temperature.min}–${THRESHOLDS.temperature.max} °C`,
    },
    {
      title: "Status",
      value: data.Alert ? "EMERGENCY" : "SAFE",
      unit: "",
      icon: data.Alert ? FaExclamationTriangle : FaShieldAlt,
      accent: data.Alert ? "from-red-600 to-rose-700" : "from-emerald-500 to-green-600",
      warn: data.Alert,
      hint: data.Alert ? "Respond now" : "Monitoring active",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={`animate-slide-up opacity-0 stagger-${Math.min(i + 1, 4)}`}
          style={{ animationFillMode: "forwards" }}
        >
          <VitalCard {...card} />
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;
