const {
  regular
} = require('../utils');

const ty_login = async function (browser) {
  const page = await browser.newPage();

  try {
    let searchUrl = `https://www.tianyancha.com/`;
    await page.goto(searchUrl);
    await page.waitFor(200);

    console.log('0000'); //接口返回值. 

    const res = await page.evaluate(x => {
      return Promise.resolve(8 * x);
    }, 7); // （译者注： 7 可以是你自己代码里任意方式得到的值）
    console.log(res); // 输出 "56"
    try {
console.log(fetch)
      
    } catch (error) {
      console.log(error)
    }
    let result = await page.evaluate(async (options) => {
      console.log(options)
      // return options
      fetch('https://www.tianyancha.com/cd/login.json', {
          method: 'POST',
          header: {
            'Content - Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(options)
        })
        .then(response => {
          console.log('s')
          response.json()
        })
        .then(data => data)
        .fail(e => console.log('Oops, error', e));
        // return 1
    }, {
      autoLogin: true,
      cdpassword: '872be7378d2e5c4b747f2547144c6dc5',
      loginway: 'PL',
      mobile: '13957157470'
    });
    // console.log(1111111); //接口返回值. 
    console.log(result); //接口返回值. 

    await page.close();
  } catch (error) {
    await page.close();
  }

  return;
}

module.exports = ty_login