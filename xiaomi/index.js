// 引入依赖插件
const puppeteer = require('puppeteer');
const mi_category = require('./mi_category');
const mi_list = require('./mi_list');
const mi_detail = require('./mi_detail');

const { readFile, writeFile } = require('../utils/fs');
const path = require('path');

// const categoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 27];
// let categoryIds = [3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 27];
let categoryIds = [1];

let data = null;

(async () => {
  let browser = await puppeteer.launch({
    headless: false,
    headless: true,
    timeout: 10000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });

  // 爬分类
  data = mi_category(categoryIds);

  // 爬app列表
  for (let i in data) {
    data[i].data = await mi_list(browser, data[i].id);
    data[i].count = data[i].data.length;
  }
  await writeFile(path.join(__dirname, `../data/listData_all.json`), JSON.stringify(data))

  // 读app列表
  data = await readFile(path.join(__dirname, '../data/listData_all.json'));
  data = JSON.parse(data);

  // 爬app详情
  for (let i = 0; i < categoryIds.length; i++) {
    let categoryName = `category_${categoryIds[i]}`
    if (!data[categoryName]) {
      continue;
    }
    
    let curData = {}
    curData[categoryName] = {
      id: categoryIds[i]
    }
    console.log(`${categoryName}, start...`)

    let appList = data[categoryName].data;
    curData[categoryName].data = await mi_detail(browser, appList);
    curData[categoryName].count = curData[categoryName].data.length;
    await writeFile(path.join(__dirname, `../data/appData_${categoryIds[i]}.json`), JSON.stringify(curData))
  }

  console.log('all success!')
  browser.close();
})();
