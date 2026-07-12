/**
 * BasePage – abstract base class for all Page Object Models.
 *
 * Every POM extends this class to gain:
 *  - a reference to the Playwright `Page`
 *  - `navigate()` – go to a URL and wait for full network idle (handles SSR
 *    hydration races that were observed in WebKit)
 *  - `waitForHydration()` – can be called explicitly when a POM needs to
 *    re-wait after an in-page navigation
 */
import { Page } from "@playwright/test";

export abstract class BasePage {
  constructor(readonly page: Page) {}

  /** Navigate to `path` and block until the page is fully hydrated. */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForHydration();
  }

  /**
   * Wait for the network to go idle – this guarantees React client bundles
   * have been executed and all `useEffect` hooks have run before we start
   * filling inputs or asserting on DOM state.
   */
  async waitForHydration(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }
}
