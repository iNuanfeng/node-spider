const mi_detail = require('./mi_detail');

const mi_list = async function (browser, categoryId) {
  console.log(`category_${categoryId}, start...`)
  let data = [];

  const pageList = await browser.newPage();
  for (let i = 0;; i++) {
    let listLink = `http://app.mi.com/category/${categoryId}#page=${i}`;
    await pageList.goto(listLink);
    await pageList.waitFor(200);

    // 列表空 退出
    let appList = await pageList.$$('#all-applist li');
    if (appList.length <= 0) {
      break;
    }

    appList.forEach(async item => {
      let href = await item.$eval('a', el => el.href);
      data.push(href)
    });
  }

  pageList.close();

  console.log(`category_${categoryId}, success!`)
  return data;
}

module.exports = mi_list