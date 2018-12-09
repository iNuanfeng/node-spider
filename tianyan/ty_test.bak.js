const { regular } = require('../utils');

const ty_test = async function (browser) {
  const page = await browser.newPage();

  try {
    let searchUrl = `https://www.tianyancha.com/search?key=江苏天鼎证券投资咨询有限公司`;
    await page.goto(searchUrl);
    await page.waitFor(200);

    let phone = '';
    let mail = '';
    let contactDom = await page.$eval('.search-result-single .contact', el => el.innerHTML);
    phone = contactDom.match(regular.phoneExp);
    mail = contactDom.match(regular.mailExp);
    if (phone) {
      phone = phone[0]
    }
    if (mail) {
      mail = mail[0]
    }
    
    console.log(phone, mail)
s
    await page.close();
  } catch (error) {
    await page.close();
  }

  return;
}

module.exports = ty_test