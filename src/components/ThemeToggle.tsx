import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        px-3 py-2 rounded-lg text-sm font-medium
        border transition
        bg-white text-slate-800 border-slate-300
        dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
      "
      title="Cambiar tema"
    >
      {theme === "dark" ? "🌙 Noche" : "☀️ Día"}
    </button>
  );
}
