const itemKey = "fetch-pref";
const item = globalThis.localStorage.getItem(itemKey);

if (typeof item === "string") {
  const ctx = JSON.parse(item);

  if (ctx.theme === "dark") {
    document.documentElement.classList.add("dark");
    const metaThemeColor = document.querySelector("meta[name=theme-color]");

    if (metaThemeColor) {
      const yellowFraunces = "#fba919";
      metaThemeColor.setAttribute("content", yellowFraunces);
    }
  }
}
