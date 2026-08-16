import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext({ dark: false });

export function ThemeProvider({ children }) {
  useEffect(() => {
    // App now ships with a single, clean light theme — make sure no
    // leftover "dark" class (e.g. from localStorage/previous session)
    // is ever applied to <html>.
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  return (
    <ThemeContext.Provider value={{ dark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
