// 引入依赖插件
const puppeteer = require('puppeteer');
const ty_search = require('./ty_search');

const { sleep } = require('../utils');
const { readFile, writeFile } = require('../utils/fs');
const path = require('path');

let data = null;
let categoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 27];
// let categoryIds = [100];

(async () => {
  let browser = await puppeteer.launch({
    headless: false,
    // headless: true,
    timeout: 10000,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });

  // await ty_search(browser);
  // return
  // 暂停一段时间，人工在chrome登录一次
  await sleep(30000);

  for (let i = 0; i < categoryIds.length; i++) {
    let categoryName = `category_${categoryIds[i]}`
    data = await readFile(path.join(__dirname, `../data/appData_${categoryIds[i]}.json`));
    data = JSON.parse(data);

    console.log(`${categoryName}, start...`)
    data[categoryName].data = await ty_search(browser, data[categoryName].data);
    data[categoryName].count = data[categoryName].data.length;
    await writeFile(path.join(__dirname, `../data/tyData_${data[categoryName].id}.json`), JSON.stringify(data))
  }

  console.log('all success!')

  browser.close();
})();