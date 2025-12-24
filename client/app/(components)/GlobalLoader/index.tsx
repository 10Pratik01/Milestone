"use client";

import { useEffect, useState } from "react";
import Loader from "../Loader";

export default function GlobalLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Loader runs only once — on page load or refresh
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000); // adjust time as you prefer

    return () => clearTimeout(timeout);
  }, []); 

  if (!loading) return null;

  return (
        <div className="h-screen w-screen -translate-y-20">
            <Loader />
        </div>
    );
}
