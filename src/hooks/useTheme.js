import { useEffect, useState } from "react";

const LS_KEY = "app-theme";
const DARK_CLASS = "dark";

export function useTheme() {
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // keep Tailwind's dark: variant in sync (optional)
    if (theme === "dark") document.documentElement.classList.add(DARK_CLASS);
    else document.documentElement.classList.remove(DARK_CLASS);

    localStorage.setItem(LS_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
}
