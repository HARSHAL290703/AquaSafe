import { useEffect, useState } from "react";

const STORAGE_KEY = "aquasafe-alarm-sound";

export function useAlarmSoundPref() {
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") {
        setAlarmSoundEnabled(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setAlarmSound = (enabled) => {
    setAlarmSoundEnabled(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      /* ignore */
    }
  };

  return [alarmSoundEnabled, setAlarmSound];
}
