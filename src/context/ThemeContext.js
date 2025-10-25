import React, { createContext, useContext, useMemo, useState } from "react";
import { DARK_THEME, LIGHT_THEME } from "../styles/theme";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState("light");
  const isDark = themeName === "dark";

  const toggleTheme = () =>
    setThemeName((prev) => (prev === "light" ? "dark" : "light"));

  const theme = useMemo(() => (isDark ? DARK_THEME : LIGHT_THEME), [isDark]);

  return (
    <ThemeContext.Provider value={{ themeName, theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
