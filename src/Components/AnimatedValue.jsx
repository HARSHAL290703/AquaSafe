import { useEffect, useState } from "react";

function AnimatedValue({ value, className = "" }) {
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== display) {
      setDisplay(value);
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 450);
      return () => clearTimeout(t);
    }
  }, [value, display]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        flash ? "scale-110 text-cyan-600" : ""
      } ${className}`}
    >
      {display}
    </span>
  );
}

export default AnimatedValue;
