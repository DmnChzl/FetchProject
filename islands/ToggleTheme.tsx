import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { THEME } from "../constants/index.ts";

const ITEM_KEY = "fetch-pref";
const REBECCA_PURPLE = "#639";
const YELLOW_FRAUNCES = "#FBA919";

/**
 * Set <meta name="theme-color" content />
 *
 * @param {string} color Hex Color
 */
const setThemeColor = (color: string) => {
  const metaThemeColor = document.querySelector("meta[name=theme-color]");
  if (metaThemeColor) metaThemeColor.setAttribute("content", color);
};

export default function ToggleTheme() {
  const theme = useSignal(THEME.LIGHT);
  const isDarkMode = useComputed(() => theme.value === THEME.DARK);

  useSignalEffect(() => {
    const item = globalThis.localStorage.getItem(ITEM_KEY);

    if (typeof item === "string") {
      const ctx: { theme: string } = JSON.parse(item);
      theme.value = ctx.theme;
    }
  });

  const handleClick = () => {
    if (isDarkMode.value) {
      theme.value = THEME.LIGHT;
      document.documentElement.classList.remove("dark");
      setThemeColor(REBECCA_PURPLE);
    } else {
      theme.value = THEME.DARK;
      document.documentElement.classList.add("dark");
      setThemeColor(YELLOW_FRAUNCES);
    }

    globalThis.localStorage.setItem(ITEM_KEY, JSON.stringify({ theme: theme.value }));
  };

  return (
    <button class="hover:underline" type="button" onClick={handleClick}>
      {isDarkMode.value ? "Bright" : "Dark"} Side
    </button>
  );
}
