// 引入依赖插件
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const android = devices['Galaxy Note 3'];

(async () => {
  let browser = await puppeteer.launch({
    headless: false,
    // headless: true,
    timeout: 10000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();
  await page.emulate(android);

  try {
    let url = `http://t.inuanfeng.com`;

    await page.goto(url);
    await page.waitFor(2000);

    await page.close();
  } catch (e) {
    console.log(e);
    await page.close();
  }
})();