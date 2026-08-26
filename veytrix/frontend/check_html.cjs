const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  const html = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log('ROOT INNER HTML:');
  console.log(html.substring(0, 1000));
  await browser.close();
})();
