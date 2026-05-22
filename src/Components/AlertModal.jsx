import { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaPhone,
  FaStop,
  FaUserShield,
  FaCheck,
  FaVolumeUp,
  FaSpinner,
} from "react-icons/fa";
import { createAlarmSound } from "../utils/alarmSound";
import {
  dispatchLifeguard,
  callEmergency,
  formatActionTime,
} from "../utils/emergencyActions";
import { EMERGENCY_NUMBER } from "../config/emergency";
import { buildAlertVitals } from "../config/vitalsThresholds";
import AlarmSoundSwitch from "./AlarmSoundSwitch";

function AlertModal({
  data,
  onResolved,
  soundEnabled = false,
  onSoundEnabledChange,
}) {
  const alarmRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [alarmStopped, setAlarmStopped] = useState(false);

  const [lifeguardLoading, setLifeguardLoading] = useState(false);
  const [lifeguardDone, setLifeguardDone] = useState(null);
  const [lifeguardError, setLifeguardError] = useState("");

  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyDone, setEmergencyDone] = useState(null);
  const [emergencyError, setEmergencyError] = useState("");

  const startAlarm = async () => {
    if (alarmStopped || !soundEnabled) return;

    if (!alarmRef.current) {
      alarmRef.current = createAlarmSound();
    }

    const ok = await alarmRef.current.start();
    if (ok) {
      setSoundOn(true);
      setNeedsTap(false);
    } else {
      setNeedsTap(true);
    }
  };

  useEffect(() => {
    if (!soundEnabled) {
      alarmRef.current?.stop();
      setSoundOn(false);
      setNeedsTap(false);
      return;
    }
    startAlarm();
    return () => {
      alarmRef.current?.stop();
      alarmRef.current = null;
    };
  }, [soundEnabled]);

  const handleStopAlarm = () => {
    alarmRef.current?.stop();
    setSoundOn(false);
    setAlarmStopped(true);
    setNeedsTap(false);
  };

  const handleEnableSound = () => {
    onSoundEnabledChange?.(true);
    setAlarmStopped(false);
    startAlarm();
  };

  const handleDispatchLifeguard = async () => {
    if (lifeguardDone || lifeguardLoading) return;

    setLifeguardLoading(true);
    setLifeguardError("");

    try {
      const result = await dispatchLifeguard(data);
      setLifeguardDone(result?.timestamp ?? new Date().toISOString());
    } catch (err) {
      console.error(err);
      setLifeguardError("Could not log dispatch. Check Firebase connection.");
    } finally {
      setLifeguardLoading(false);
    }
  };

  const handleCallEmergency = async () => {
    if (emergencyLoading) return;

    const confirmed = window.confirm(
      `Call emergency services (${EMERGENCY_NUMBER})?\n\nThis will open your phone dialer and log the call in AquaSafe.`
    );
    if (!confirmed) return;

    setEmergencyLoading(true);
    setEmergencyError("");

    try {
      const result = await callEmergency(data);
      setEmergencyDone(result?.timestamp ?? new Date().toISOString());
    } catch (err) {
      console.error(err);
      setEmergencyError("Could not log emergency call. Check Firebase connection.");
    } finally {
      setEmergencyLoading(false);
    }
  };

  const vitals = buildAlertVitals(data);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-labelledby="emergency-title"
      aria-modal="true"
      onClick={needsTap ? handleEnableSound : undefined}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-red-500 bg-white shadow-2xl animate-alert-flash"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-6 py-7 text-white">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 animate-alert-ring">
              <FaBell className="text-2xl" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-widest text-red-100">
                AquaSafe Emergency
              </p>
              <h1 id="emergency-title" className="mt-1 text-3xl font-bold md:text-4xl">
                Pool Emergency
              </h1>
              <p className="mt-2 text-base text-red-50 md:text-lg">
                Critical swimmer alert — respond immediately
              </p>
              <p className="mt-2 text-sm text-red-200">
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            {soundOn && !alarmStopped && (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                <FaVolumeUp className="animate-pulse" />
                Alarm active
              </span>
            )}
          </div>
        </div>

        {!soundEnabled && onSoundEnabledChange && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
            <p className="mb-3 text-sm font-medium text-amber-900">
              Alarm sound is off — enable below to hear the buzzer.
            </p>
            <AlarmSoundSwitch
              enabled={soundEnabled}
              onChange={onSoundEnabledChange}
              className="border-amber-200 bg-white"
            />
          </div>
        )}

        {soundEnabled && needsTap && !alarmStopped && (
          <button
            type="button"
            onClick={handleEnableSound}
            className="w-full bg-amber-500 px-4 py-3 text-center font-semibold text-amber-950 hover:bg-amber-400"
          >
            Tap here to start alarm sound
          </button>
        )}

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {vitals.map((v) => (
              <div
                key={v.label}
                className={`rounded-2xl border-2 p-4 ${
                  v.critical
                    ? "border-red-400 bg-red-50 text-red-800"
                    : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                <p className="text-sm font-medium text-slate-500">{v.label}</p>
                <p className="mt-1 text-2xl font-bold">{v.value}</p>
                {v.critical && (
                  <p className="mt-1 text-xs font-semibold uppercase text-red-600">
                    Critical
                  </p>
                )}
              </div>
            ))}
          </div>

          {(lifeguardDone || emergencyDone) && (
            <div className="space-y-2 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
              {lifeguardDone && (
                <p className="flex items-center gap-2 font-semibold">
                  <FaCheck className="text-emerald-600" />
                  Lifeguard dispatched on {formatActionTime(lifeguardDone)} — logged to Firebase
                </p>
              )}
              {emergencyDone && (
                <p className="flex items-center gap-2 font-semibold">
                  <FaCheck className="text-emerald-600" />
                  Emergency call ({EMERGENCY_NUMBER}) on{" "}
                  {formatActionTime(emergencyDone)}
                </p>
              )}
            </div>
          )}

          {(lifeguardError || emergencyError) && (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm font-medium text-red-800">
              {lifeguardError || emergencyError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleDispatchLifeguard}
              disabled={lifeguardLoading || !!lifeguardDone}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-4 text-lg font-bold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-cyan-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lifeguardLoading ? (
                <FaSpinner className="animate-spin" />
              ) : lifeguardDone ? (
                <FaCheck />
              ) : (
                <FaUserShield />
              )}
              {lifeguardDone
                ? "Lifeguard Dispatched"
                : lifeguardLoading
                  ? "Dispatching…"
                  : "Dispatch Lifeguard"}
            </button>

            <button
              type="button"
              onClick={async () => {
                alarmRef.current?.stop();
                setAlarmStopped(true);
                if (typeof onResolved === "function") await onResolved();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 active:scale-[0.98]"
            >
              <FaCheck />
              Mark Resolved
            </button>

            <button
              type="button"
              onClick={handleCallEmergency}
              disabled={emergencyLoading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-700 py-4 text-lg font-bold text-white shadow-lg shadow-red-700/30 transition hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {emergencyLoading ? (
                <FaSpinner className="animate-spin" />
              ) : emergencyDone ? (
                <FaCheck />
              ) : (
                <FaPhone />
              )}
              {emergencyDone
                ? `Called ${EMERGENCY_NUMBER}`
                : emergencyLoading
                  ? "Calling…"
                  : `Call Emergency (${EMERGENCY_NUMBER})`}
            </button>

            <button
              type="button"
              onClick={handleStopAlarm}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-slate-100 py-4 text-lg font-bold text-slate-800 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              <FaStop />
              {alarmStopped ? "Alarm stopped" : "Stop Alarm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
