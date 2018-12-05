// 引入依赖插件
const puppeteer = require('puppeteer');
const mi_detail = require('../mi_detail');

const { readFile, writeFile } = require('../../utils/fs');
const path = require('path');

let data = null;

(async () => {
  let browser = await puppeteer.launch({
    headless: false,
    headless: true,
    timeout: 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });

  // 爬详情
  let appList = await readFile(path.join(__dirname, './mi_list.json'))
  appList = JSON.parse(appList);
  let data = await mi_detail(browser, appList);

  console.log(data)
})();