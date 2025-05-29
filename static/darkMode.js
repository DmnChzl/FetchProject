const item = globalThis.localStorage.getItem("fetch-pref");

if (typeof item === "string") {
  const ctx = JSON.parse(item);

  if (ctx.theme === "dark") {
    document.documentElement.classList.add("dark");
  }
}
