import { spawn } from "node:child_process";
import { chromium } from "playwright-core";
import { setTimeout as delay } from "node:timers/promises";

const port = 3312;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { stdio: "ignore" });

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      if ((await fetch(origin)).ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error("Next.js server did not start.");
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome", headless: true, args: ["--no-sandbox"] });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  for (const [pathname, theme] of [["/", "dark"], ["/proposalplanning", "lilac"], ["/weddingplanningmiami", "light"]]) {
    const response = await desktop.goto(`${origin}${pathname}`, { waitUntil: "domcontentloaded" });
    assert(response?.status() === 200, `${pathname} did not return 200.`);
    assert(await desktop.locator(`.site-header[data-theme="${theme}"]`).count(), `${pathname} did not use ${theme} theme.`);
    assert(await desktop.locator(".desktop-nav").isVisible(), `${pathname} desktop navigation is hidden.`);
    assert(await desktop.locator(".site-footer").isVisible(), `${pathname} footer is hidden.`);
  }
  await desktop.goto(`${origin}/`);
  await desktop.getByRole("button", { name: "ABOUT" }).focus();
  assert(await desktop.locator(".submenu").first().isVisible(), "Keyboard focus did not reveal the desktop submenu.");

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${origin}/proposalplanning`);
  assert(await mobile.locator(".mobile-nav").isVisible(), "Mobile navigation is hidden.");
  await mobile.locator(".mobile-nav summary").click();
  assert(await mobile.getByRole("navigation", { name: "Mobile navigation" }).isVisible(), "Mobile menu did not open.");
  console.log("Shared shell verified across dark, lilac, light, desktop, keyboard, and mobile states.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
