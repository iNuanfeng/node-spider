// 引入依赖插件
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();
  await page.goto('http://app.mi.com/category/1#page=0');
  await page.screenshot({
    path: 'jianshu.png',
    type: 'png',
    fullPage: true,
  });
  browser.close();
})();