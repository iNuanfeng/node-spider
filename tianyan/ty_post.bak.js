const {
  regular
} = require('../utils');

formData = {
  'a': 123,
  'b': 456
}

const ty_post = async function (browser) {
  const page = await browser.newPage();


  try {
    await post(page, 'https://www.tianyancha.com/cd/login.json', formData);

    // await page.close();
  } catch (error) {
    await page.close();
  }

  return;
}



async function post(page, url, formData) {

  let formHtml = '';

  Object.keys(formData).forEach(function (name) {
    value = formData[name]
    formHtml += `
      <input
        type='hidden'
        name='${name}'
        value='${value}'
      />
    `;
  });

  formHtml = `
    <form action='${url}' method='post'>
      ${formHtml}

      <input type='submit' />
    </form>
  `;

  console.log(formHtml)

  await page.setContent(formHtml);
  const inputElement = await page.$('input[type=submit]');
  // await inputElement.click();
};


module.exports = ty_post