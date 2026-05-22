import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

function AlarmSoundSwitch({ enabled, onChange, className = "" }) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2.5 transition-all hover:shadow-md ${className}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
          enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
        }`}
      >
        {enabled ? <FaVolumeUp /> : <FaVolumeMute />}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-800">Alarm sound</span>
        <span className="text-xs text-slate-500">
          {enabled ? "On when alert fires" : "Off — no buzzer"}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative ml-auto h-8 w-14 rounded-full transition-colors ${
          enabled ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default AlarmSoundSwitch;
