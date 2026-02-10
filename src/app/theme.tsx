import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "dy-auto-work-theme";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
    return savedTheme;
  }

  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === "system" ? getSystemTheme() : theme,
  );

  useEffect(() => {
    if (theme !== "system") {
      setResolvedTheme(theme);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };

    syncSystemTheme();
    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncSystemTheme);
    };
  }, [theme]);

  useEffect(() => {
    const effectiveTheme = theme === "system" ? resolvedTheme : theme;
    const root = document.documentElement;
    root.setAttribute("data-theme", effectiveTheme);
    root.style.colorScheme = effectiveTheme;
    // Sync Tailwind dark class for shadcn/ui components
    root.classList.toggle("dark", effectiveTheme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Sync Tauri window theme for macOS title bar
    const appWindow = getCurrentWindow();

    if (theme === "system") {
      appWindow
        .setTheme(null)
        .then(() => {
          const systemTheme = getSystemTheme();
          setResolvedTheme((currentTheme) =>
            currentTheme === systemTheme ? currentTheme : systemTheme,
          );
        })
        .catch((err) => {
          console.warn("Failed to set window theme:", err);
        });
      return;
    }

    appWindow.setTheme(effectiveTheme === "dark" ? "dark" : "light").catch((err) => {
      console.warn("Failed to set window theme:", err);
    });
  }, [theme, resolvedTheme]);

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
      toggleTheme: () => {
        setThemeState((currentTheme) => {
          if (currentTheme === "system") {
            return resolvedTheme === "light" ? "dark" : "light";
          }
          return currentTheme === "light" ? "dark" : "light";
        });
      },
    }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme 必须在 ThemeProvider 内使用");
  }
  return context;
}
