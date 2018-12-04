// 引入依赖插件
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];
const {
  mkdirsSync
} = require('../util/fs');
require('../util/time');

/**
 * 避免等待图片函数出问题
*/
const pTimeout = require('p-timeout');

// 启动puppeteer
const runBrowser = async (urls, startPosition, len) => {

  const browser = await puppeteer.launch({
    headless: true,
    timeout: 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true
  });

  let promises = [], tabsNum = 5;

  for (let i = 0; i < len; i++) {
    // 将所有页面分组，依次按组同时打开5个标签页爬取，提高效率
    const groupIndex = parseInt(i / tabsNum, 10);
    promises[groupIndex] = promises[groupIndex] ? promises[groupIndex] : [];
    promises[parseInt(i / tabsNum, 10)].push(urls[i + startPosition]);
  }

  for (let i = 0; i < promises.length; i++) {
    await Promise.all(promises[i].map(async runPage => {
      return await startPage(browser, runPage);
    }))
  }
  
  // for (let i = 0; i < len; i++) {
  //   const page = await browser.newPage();
  //   const landingObj = urls[i + startPosition];
  
  //   const landingUrl = landingObj.url;
  //   try {
  //     // 页面渲染完毕后，开始截图
  //     let dir = `./images/${landingObj.advertId}`;
  //     await mkdirsSync(dir);
  //     await runPage(page, landingUrl, dir, landingObj);
  //     await page.close();
  //   } catch (e) {
  //     console.log('screen shot err:', landingUrl, e);
  //     await page.close();
  //   }
  // }

  await browser.close();
};

const startPage = async (browser, url) => {
  // 打开浏览器后，新建tab页
  const page = await browser.newPage();
  const landingObj = url;

  const landingUrl = landingObj.url;
  try {
    // 页面渲染完毕后，开始截图
    let dir = `../images/${landingObj.advertId}`;
    await mkdirsSync(dir);
    await runPage(page, landingUrl, dir, landingObj);
    await page.close();
  } catch (e) {
    console.log('screen shot err:', landingUrl, e);
    output(landingObj)
    await page.close();
  }
}

// 截图 需要延时不然同个页面你想截n张的话，时间短就截不了n张
const shot = (page, path, time) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(
        page.screenshot({
          path,
          type: 'jpeg',
          fullPage: true
        })
      )
    }, time);
  })
}

// 输出
const output = (landingObj, path) => {
  let putObj = Object.assign(landingObj, {
    shot: path ? true : false,
    localImageUrl: path
  })
  console.log(JSON.stringify(putObj));
}

const runPage = async (page, landingUrl, dir, landingObj) => {
  await page.emulate(iPhone);
  const respone = await page.goto(landingUrl, {
    waitUntil: ['networkidle2'],
    timeout: 60 * 1000
  }).catch(err => {
    // 服务器无法连接
    console.log('networkError: ', landingUrl, err);
    output(landingObj);
    return;
  })

  // 404，500等服务器异常
  if (respone.status() !== 200) {
    console.log('serverError', respone.status());
    output(landingObj);
    return;
  }

  // 下滑
  await page.evaluate(() => {
    return Promise.resolve(window.scrollTo(0, window.innerHeight));
  });

  // 等待图片加载
  try {
    await pTimeout(page.evaluate(() => {
      let images = document.querySelectorAll('img');
      if (!images || images.length === 0) {
        console.log('no img node');
        return;
      }
  
      preLoad = () => {
  
        let promises = [];
  
        loadImage = (img) => {
          return new Promise((resolve, reject) => {
            if (img.complete) {
              resolve(img)
            }
            img.onload = () => {
              resolve(img);
            };
            img.onerror = (e) => {
              resolve(img);
            };
          })
        }
  
        for (let i = 0; i < images.length; i++) {
          promises.push(loadImage(images[i]));
        }
  
        return Promise.all(promises);
      }
  
      return preLoad();
    }), 2000)
  } catch (err) {
    console.log('wait img loading timeout: ', err);
    return;
  }
  
  await page.waitFor(1000);

  // 获取弹窗是否打开
  const dialogValue = await page.evaluate(() => {
    if (window.landpagesConfig && window.landpagesConfig.dialogValue) {
      return window.landpagesConfig.dialogValue;
    }
    return false;
  })

  const path = `${dir}/${landingObj.advertId}_`;

  // 内部模版落地页区分弹层逻辑 ==> @邓沁 _1无弹窗，_2有弹窗
  if (dialogValue) {
    if (landingObj.objectName.includes('_2.')) {
      await page.evaluate(() => {
        return window.landpagesConfig.closeDialog();
      });
      await page.evaluate(() => {
        return window.landpagesConfig.openDialog();
      });
      await shot(page, path + '2.jpeg', 0);
      return output(landingObj, path + '2.jpeg');
    } else {
      await shot(page, path + '1.jpeg', 0);
      return output(landingObj, path + '1.jpeg');
    }
  } else {
    if (landingObj.objectName.includes('_2.')) return
    await shot(page, path + '1.jpeg', 0);
    return output(landingObj, path + '1.jpeg');
  }
};

module.exports = runBrowser;
