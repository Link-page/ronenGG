const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// מפעילים את מצב ההתגנבות כדי ש-Cloudflare לא יזהה אותנו כבוט
puppeteer.use(StealthPlugin());

async function updateLeaderboard() {
    console.log("Starting stealth browser to bypass Cloudflare...");
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        console.log("Navigating to Kick API...");
        
        // טוענים את העמוד ומחכים שהרשת תהיה שקטה (כלומר שקלאודפלייר סיים לבדוק אותנו)
        await page.goto('https://web.kick.com/api/v1/kicks/4865495/leaderboard', { waitUntil: 'networkidle2' });
        
        // מושכים את הטקסט הטהור מתוך הדפדפן
        const jsonText = await page.evaluate(() => document.body.innerText);
        const data = JSON.parse(jsonText);
        
        if (data.error) {
             throw new Error("Blocked by Cloudflare even with stealth mode.");
        }
        
        fs.writeFileSync('leaderboard.json', JSON.stringify(data, null, 2));
        console.log("Success: leaderboard.json saved successfully!");
        
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

updateLeaderboard();
