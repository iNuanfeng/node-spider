// 引入依赖插件
const puppeteer = require('puppeteer');
const mi_category = require('../mi_category');
const mi_list = require('../mi_list');

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

  // 爬分类
  data = mi_category();

  // 爬app列表
  let result = await mi_list(browser, 1);
  await writeFile(path.join(__dirname, './mi_list.json'), JSON.stringify(result))
})();