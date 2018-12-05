var ProgressBar = require('progress');

const mi_detail = require('./mi_detail');

const mi_list = async function (browser, appList) {
  let data = [];
  let bar = new ProgressBar(':bar :current/:total', { total: appList.length });

  const pageDetail = await browser.newPage();
  for (let i = 0; i < appList.length; i++) {
    bar.tick(1);

    await pageDetail.goto(appList[i]);
    await pageDetail.waitFor(200);

    // app名 公司名
    let appName = await pageDetail.$eval('.intro-titles h3', el => el.innerHTML);
    let company = await pageDetail.$eval('.intro-titles p', el => el.innerHTML);
    
    data.push({
      appName,
      company
    })
  }

  pageDetail.close();

  return data;
}

module.exports = mi_list