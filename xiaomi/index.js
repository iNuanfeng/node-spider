// 引入依赖插件
const puppeteer = require('puppeteer');
const mi_category = require('./mi_category');
const mi_list = require('./mi_list');
const mi_detail = require('./mi_detail');

const { readFile, writeFile } = require('../utils/fs');
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
  for (let i in data) {
    data[i].data = await mi_list(browser, data[i].id);
    data[i].count = data[i].data.length;
  }

  // 爬app详情
  for (let i in data) {
    let appList = data[i].data;
    data[i].data = await mi_detail(browser, appList);
  }

  await writeFile(path.join(__dirname, '../data/appData.json'), JSON.stringify(data))

})();