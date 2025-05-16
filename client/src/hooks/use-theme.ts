import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely use the client-side APIs
  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize theme with localStorage
  useEffect(() => {
    if (mounted && theme) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  return {
    theme: mounted ? theme : undefined,
    setTheme,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    isDark: mounted ? resolvedTheme === "dark" : undefined,
    isLight: mounted ? resolvedTheme === "light" : undefined,
  };
}
