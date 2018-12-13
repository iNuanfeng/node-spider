var ProgressBar = require('progress');
const {
  isPhone,
  regular,
  sleep,
  contains
} = require('../utils')
const { readFile, writeFile, exists } = require('../utils/fs');
const path = require('path');

const SIZE = 30;

const ty_search = async function (browser, appList) {

  let bar = new ProgressBar(':bar :current/:total', {
    total: appList.length
  });

  // 线上服务器2核2g内存，开五个tab会puppeteer会报错https://github.com/GoogleChrome/puppeteer/issues/1385，本地4核8g开五个没毛病
  let promises = [],
    tabsNum = SIZE;

  for (let i = 0; i < appList.length; i++) {
    // 将所有页面分组，依次按组同时打开5个标签页爬取，提高效率
    const groupIndex = parseInt(i / tabsNum, 10);
    promises[groupIndex] = promises[groupIndex] ? promises[groupIndex] : [];
    promises[parseInt(i / tabsNum, 10)].push(appList[i]);
  }

  for (let i = 0; i < promises.length; i++) {
    let data = [];
    
    let contacts = await Promise.all(promises[i].map(async runPage => {
      let contact = await startPage(browser, runPage);
      
      return contact
    }))

    // 重新验证登录，这一波重来
    if (contains(contacts, 'RELOGIN')) {
      i--;
      continue;
    }

    for (let j = 0; j < promises[i].length; j++) {
      // 查到联系信息，才添加到结果列表
      if (contacts[j]) {
        let result = Object.assign({}, promises[i][j], contacts[j]);
        delete result['link'];
        data.push(result);
      }
    }
    
    let fileData = await readFile(path.join(__dirname, `../data/sotian/tmp_tyData.json`));
    fileData = JSON.parse(fileData);
    fileData = fileData.concat(data);

    // 每一波都写入一次临时文件
    await writeFile(path.join(__dirname, `../data/sotian/tmp_tyData.json`), JSON.stringify(fileData))
    bar.tick(SIZE);

  }

}


async function startPage(browser, runPage) {
  const page = await browser.newPage();

  let mail = '';

  try {
    let searchUrl = runPage.link;

    await page.goto(searchUrl);
    await page.waitFor(200);

    // 判断需要验证码
    let urlString = page.url()
    
    if (urlString.indexOf('antirobot') !== -1 || urlString.indexOf('login') !== -1) {
      await sleep(20000);
      await page.close();
      return 'RELOGIN'
    }

    mail = await page.$eval('.email', el => el.innerHTML);

    await page.close();
  } catch (e) {
    // console.log(e);
    await page.close();
  }

  if (!mail) {
    return null
  } else {
    return {
      mail
    }
  }
}

module.exports = ty_search