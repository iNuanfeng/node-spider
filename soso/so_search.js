var ProgressBar = require('progress');
const {
  isPhone
} = require('../utils')

const SIZE = 50;
const LENGTH = 50;

const mi_list = async function (browser, appList) {
  let data = [];
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
    await Promise.all(promises[i].map(async runPage => {
      let phone = await startPage(browser, runPage);

      // 查到电话，才添加到结果列表
      if (phone) {
        data.push(Object.assign({}, runPage, {
          phone
        }));
      }

      bar.tick(1);
    }))
  }

  return data;
}


async function startPage(browser, runPage) {
  const page = await browser.newPage();

  let phone

  try {
    let searchUrl = `http://www.soso.com/tx?query=${runPage.company} 电话`;
    await page.goto(searchUrl);
    await page.waitFor(200);

    phone = await page.$eval('.vrwrap p', el => el.innerHTML);
    phone = phone.replace(/<span class="tl-tit">公司电话：<\/span>/g, '');
    if (!isPhone(phone)) {
      phone = '';
    }

    await page.close();
  } catch (e) {
    // console.log(e);
    await page.close();
  }

  return phone
}

module.exports = mi_list