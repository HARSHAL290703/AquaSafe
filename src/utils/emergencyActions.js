import { ref, set } from "firebase/database";
import { db } from "../firebase";
import { EMERGENCY_NUMBER, LIFEGUARD_NUMBER } from "../config/emergency";
import { getCriticalVitals } from "../config/vitalsThresholds";

export function dialNumber(number) {
  if (!number) return false;
  const link = document.createElement("a");
  link.href = `tel:${String(number).replace(/\s/g, "")}`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

async function writeField(path, value) {
  await set(ref(db, `DrowningSystem/${path}`), value);
}

async function safeFirebaseLog(writes) {
  try {
    await Promise.all(writes);
    return null;
  } catch (err) {
    console.warn("Firebase log failed:", err);
    return err?.message || "Firebase write failed";
  }
}

export async function resolveAlert() {
  await writeField("Alert", false);
}

export async function dispatchLifeguard(data) {
  const timestamp = new Date().toISOString();
  const firebaseError = await safeFirebaseLog([
    writeField("LifeguardDispatched", true),
    writeField("LifeguardDispatchedAt", timestamp),
    writeField("LifeguardCriticalVitals", getCriticalVitals(data)),
  ]);
  if (LIFEGUARD_NUMBER) dialNumber(LIFEGUARD_NUMBER);
  return { timestamp, firebaseError };
}

export async function callEmergency(data) {
  const timestamp = new Date().toISOString();
  const firebaseError = await safeFirebaseLog([
    writeField("EmergencyCalled", true),
    writeField("EmergencyCalledAt", timestamp),
    writeField("EmergencyNumber", EMERGENCY_NUMBER),
    writeField("EmergencyCriticalVitals", getCriticalVitals(data)),
  ]);
  dialNumber(EMERGENCY_NUMBER);
  return { timestamp, firebaseError };
}

export function formatActionTime(value) {
  let iso = value;
  if (value && typeof value === "object") {
    iso = value.timestamp ?? value.LifeguardDispatchedAt ?? value.EmergencyCalledAt;
  }
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}
