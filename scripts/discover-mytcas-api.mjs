/**
 * Step 1: Discover the mytcas.com API by intercepting network requests.
 * Run: npx playwright test --config=playwright.config.ts or just:
 *   node scripts/discover-mytcas-api.mjs
 */
import { chromium } from "playwright";

const KMITL_SEARCH = "https://course.mytcas.com/universities";

async function discover() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const apiCalls = [];

  // Intercept ALL network requests
  page.on("request", (req) => {
    const url = req.url();
    if (
      url.includes("/api/") ||
      url.includes("graphql") ||
      url.includes("course") ||
      url.includes("university") ||
      url.includes("program") ||
      url.includes("faculty")
    ) {
      apiCalls.push({
        method: req.method(),
        url: url,
        headers: req.headers(),
        postData: req.postData() || null,
      });
    }
  });

  page.on("response", async (res) => {
    const url = res.url();
    if (
      (url.includes("/api/") ||
        url.includes("graphql") ||
        url.includes("university") ||
        url.includes("program") ||
        url.includes("faculty")) &&
      res.headers()["content-type"]?.includes("application/json")
    ) {
      try {
        const body = await res.json();
        console.log("\n=== JSON RESPONSE ===");
        console.log("URL:", url);
        console.log("Status:", res.status());
        console.log(
          "Body preview:",
          JSON.stringify(body).substring(0, 500)
        );
        console.log("====================\n");
      } catch {}
    }
  });

  console.log("Navigating to:", KMITL_SEARCH);
  await page.goto(KMITL_SEARCH, { waitUntil: "networkidle" });

  // Wait for content to load
  await page.waitForTimeout(3000);

  // Try to find and click on KMITL
  console.log("\n--- Page title:", await page.title());
  console.log("--- Page URL:", page.url());

  // Get all text content to understand the page
  const text = await page.textContent("body");
  console.log("\n--- Page text preview:", text?.substring(0, 1000));

  // Try searching for KMITL
  const searchInput = await page.$('input[type="search"], input[type="text"], input[placeholder*="ค้นหา"], input[placeholder*="search"]');
  if (searchInput) {
    console.log("\nFound search input, typing KMITL...");
    await searchInput.fill("KMITL");
    await page.waitForTimeout(2000);

    const textAfterSearch = await page.textContent("body");
    console.log("--- After search:", textAfterSearch?.substring(0, 1000));
  }

  // Try clicking any KMITL link
  const kmitlLink = await page.$('a:has-text("ลาดกระบัง"), a:has-text("KMITL"), a:has-text("Ladkrabang")');
  if (kmitlLink) {
    console.log("\nFound KMITL link, clicking...");
    await kmitlLink.click();
    await page.waitForTimeout(3000);
    console.log("--- New URL:", page.url());
  }

  console.log("\n\n=== ALL API CALLS CAPTURED ===");
  apiCalls.forEach((call, i) => {
    console.log(`\n[${i}] ${call.method} ${call.url}`);
    if (call.postData) console.log("    POST:", call.postData.substring(0, 200));
  });

  await browser.close();
}

discover().catch(console.error);
