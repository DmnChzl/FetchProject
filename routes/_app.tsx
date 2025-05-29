import { type PageProps } from "$fresh/server.ts";
import ToggleTheme from "../islands/ToggleTheme.tsx";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="theme-color" content="#639" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>The Fetch Project</title>
        <link rel="stylesheet" href="/styles.css" />
        <script src="/darkMode.js"></script>
      </head>
      <body>
        <div id="main">
          <Component />
          <footer>
            <p class="mx-auto text-[14px] text-[var(--text-color-idle)] text-center">
              © {new Date().getFullYear()} The Fetch Project | by{" "}
              <a class="hover:underline" href="https://www.github.com/dmnchzl" target="_blank" rel="noopener">
                DmnChzl
              </a>{" "}
              | Powered by{"  "}
              <a
                class="hover:underline"
                href="https://fresh.deno.dev"
                target="_blank"
                rel="noopener"
              >
                Fresh 🍋
              </a>{" "}
              | Published under{" "}
              <a
                class="hover:underline"
                href="https://www.wikipedia.org/wiki/WTFPL"
                target="_blank"
                rel="noopener"
              >
                WTFPL
              </a>{" "}
              | Choose <ToggleTheme />
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
