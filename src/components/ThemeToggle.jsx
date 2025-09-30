import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const themes = ["light", "dark"]; // ✅ only light/dark

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm">
        {theme === "dark" ? "🌙 Dark" : "🌞 Light"}
      </label>
      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
        {themes.map(t => (
          <li key={t}>
            <button onClick={() => setTheme(t)} className={theme === t ? "active" : ""}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
