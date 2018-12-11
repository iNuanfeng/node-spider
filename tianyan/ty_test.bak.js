const {
  regular
} = require('../utils');

const ty_test = async function (browser) {
  const page = await browser.newPage();

  // await page.setExtraHTTPHeaders({
  //   proxy: {
  //     host: '121.237.71.57',
  //     port: 57543
  //   }
  // })


  try {
    let searchUrl = `http://localhost:3008/jump`;
    await page.goto(searchUrl);
    await page.waitFor(200);

    // await page.waitForNavigation({
    //   waitUntil: 'domcontentloaded'
    //   // waitUntil: 'load'
    // })
    // console.log('hehe')
    // let urlString = page.url()
    // if (urlString.indexOf('result') !== -1) {
    //   console.log(urlString)
    // }
    
    // console.log(response)
    // let phone = '';
    // let mail = '';
    // let contactDom = await page.$eval('.search-result-single .contact', el => el.innerHTML);
    // phone = contactDom.match(regular.phoneExp);
    // mail = contactDom.match(regular.mailExp);
    // if (phone) {
    //   phone = phone[0]
    // }
    // if (mail) {
    //   mail = mail[0]
    // }

    // console.log(phone, mail)

    // await page.close();
  } catch (error) {
    await page.close();
  }

  return;
}

module.exports = ty_test