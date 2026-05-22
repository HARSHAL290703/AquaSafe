import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { resolveAlert } from "./utils/emergencyActions";
import { db } from "./firebase";
import { useAlarmSoundPref } from "./hooks/useAlarmSoundPref";

import Header from "./components/Header";
import DashboardCards from "./components/DashboardCards";
import AlertModal from "./components/AlertModal";
import LineChartCard from "./components/LineChartCard";

function App() {
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useAlarmSoundPref();
  const [updateTick, setUpdateTick] = useState(0);

  const [data, setData] = useState({
    HeartRate: 0,
    SpO2: 0,
    Temperature: 0,
    Alert: false,
  });

  const [chartData, setChartData] = useState([]);
  const [dismissedAlert, setDismissedAlert] = useState(false);

  useEffect(() => {
    const dataRef = ref(db, "DrowningSystem");

    const unsubscribe = onValue(dataRef, (snapshot) => {
      const firebaseData = snapshot.val();

      if (firebaseData) {
        setData(firebaseData);
        setUpdateTick((t) => t + 1);
        if (firebaseData.Alert) setDismissedAlert(false);

        setChartData((prev) => [
          ...prev.slice(-9),
          {
            time: new Date().toLocaleTimeString(),
            HeartRate: firebaseData.HeartRate,
            SpO2: firebaseData.SpO2,
            Temperature: firebaseData.Temperature,
          },
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleResolveAlert = async () => {
    try {
      await resolveAlert();
    } catch (err) {
      console.error("Failed to clear alert:", err);
    }
    setDismissedAlert(true);
  };

  const showAlert = data.Alert && !dismissedAlert;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 animate-gradient-bg bg-gradient-to-br from-slate-900 via-cyan-950 to-blue-950" />
      <div className="pointer-events-none absolute -left-40 top-24 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-24 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl p-4 md:p-6">
        <Header
          alertActive={data.Alert}
          alarmSoundEnabled={alarmSoundEnabled}
          onAlarmSoundChange={setAlarmSoundEnabled}
        />

        <DashboardCards data={data} />

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <LineChartCard
            title="Heart Rate"
            dataKey="HeartRate"
            value={data.HeartRate}
            unit="bpm"
            data={chartData}
          />
          <LineChartCard
            title="SpO2"
            dataKey="SpO2"
            value={data.SpO2}
            unit="%"
            data={chartData}
          />
          <LineChartCard
            title="Temperature"
            dataKey="Temperature"
            value={data.Temperature}
            unit="°C"
            data={chartData}
          />
        </section>
      </div>

      {showAlert && (
        <AlertModal
          data={data}
          onResolved={handleResolveAlert}
          soundEnabled={alarmSoundEnabled}
          onSoundEnabledChange={setAlarmSoundEnabled}
        />
      )}
    </div>
  );
}

export default App;
