/** Vital sign thresholds (Celsius for temperature) */

export const THRESHOLDS = {
  heartRate: { min: 60, max: 120 },
  spO2: { min: 90 },
  /** Body temp °C — normal ~36.1–37.8; critical outside this band */
  temperature: { min: 32, max: 40 },
};

/** Parse numbers from Firebase (may arrive as strings) */
export function parseVital(value) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalize temperature to °C for threshold checks.
 * Handles: strings, Fahrenheit (>45), sensor tenths (e.g. 365 → 36.5).
 */
export function normalizeTemperatureC(value) {
  let t = parseVital(value);
  if (t == null) return null;

  // Sensor sometimes sends tenths (365 = 36.5°C)
  if (t > 60 && t < 500) {
    t = t / 10;
  }

  // Fahrenheit body readings (~95–105) → Celsius
  if (t > 45 && t <= 110) {
    t = ((t - 32) * 5) / 9;
  }

  return Math.round(t * 10) / 10;
}

export function isHeartRateCritical(heartRate) {
  const hr = parseVital(heartRate);
  if (hr == null || hr <= 0 || hr > 250) return false;
  const { min, max } = THRESHOLDS.heartRate;
  return hr < min || hr > max;
}

export function isSpO2Critical(spO2) {
  const o2 = parseVital(spO2);
  if (o2 == null || o2 <= 0 || o2 > 100) return false;
  return o2 < THRESHOLDS.spO2.min;
}

export function isTemperatureCritical(temperature) {
  const t = normalizeTemperatureC(temperature);
  // Ignore missing or impossible sensor values
  if (t == null || t < 20 || t > 45) return false;

  const { min, max } = THRESHOLDS.temperature;
  return t < min || t > max;
}

/** Alert = 1 when (HR AND SpO2) OR (SpO2 AND Temp) */
export function isAlertTriggered(data) {
  const hr = isHeartRateCritical(data?.HeartRate);
  const spo2 = isSpO2Critical(data?.SpO2);
  const temp = isTemperatureCritical(data?.Temperature);
  return (hr && spo2) || (spo2 && temp);
}

/** Critical vitals only when alert condition is met */
export function getCriticalVitals(data) {
  if (!isAlertTriggered(data)) return {};

  const critical = {};
  const hr = isHeartRateCritical(data?.HeartRate);
  const spo2 = isSpO2Critical(data?.SpO2);
  const temp = isTemperatureCritical(data?.Temperature);

  if (hr && spo2) {
    critical.HeartRate = parseVital(data.HeartRate);
    critical.SpO2 = parseVital(data.SpO2);
  } else if (spo2 && temp) {
    critical.SpO2 = parseVital(data.SpO2);
    critical.Temperature = normalizeTemperatureC(data.Temperature);
  }

  return critical;
}

export function buildAlertVitals(data) {
  const tempC = normalizeTemperatureC(data.Temperature);
  const tempDisplay = tempC != null ? tempC : data.Temperature ?? "—";

  return [
    {
      label: "Heart Rate",
      value: `${data.HeartRate} bpm`,
      critical: isHeartRateCritical(data.HeartRate),
    },
    {
      label: "SpO2",
      value: `${data.SpO2}%`,
      critical: isSpO2Critical(data.SpO2),
    },
    {
      label: "Temperature",
      value: `${tempDisplay} °C`,
      critical: isTemperatureCritical(data.Temperature),
    },
  ];
}
