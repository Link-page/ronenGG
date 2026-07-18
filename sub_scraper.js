const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');

  try {
    console.log("Starting sub_scraper...");
    await page.goto('https://kick.com/api/v2/channels/ronengg/leaderboards', { waitUntil: 'networkidle2' });
    const subsData = await page.evaluate(() => document.querySelector('body').innerText);
    fs.writeFileSync('subs.json', subsData);
    console.log("subs.json updated successfully!");
  } catch (error) {
    console.error("Error scraping subs:", error);
  } finally {
    await browser.close();
  }
})();
