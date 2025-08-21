class ScraperService {
  constructor() {
    this.enabled = process.env.ENABLE_SCRAPERS === "true";
  }

  async runScrapers() {
    if (!this.enabled) {
      console.log("Scrapers disabled in production");
      return;
    }

    // Your scraper logic here
    console.log("Running scrapers...");
  }
}

module.exports = new ScraperService();
