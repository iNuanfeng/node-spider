const express = require('express');
const app = express();
const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const async = require("async"); // 控制并发数，防止被封IP
const fs = require('fs');
const JSONStream = require('JSONStream');
const path = require('path');

const fetchData = []; // 存放爬取数据
const SaveToMongo = require('save-to-mongo');//用于将爬取的数据存储到MongoDB数据库

// let Highcharts = require('highcharts');//将爬取的数据用Highchart展示

// require('highcharts/modules/exporting')(Highcharts);//在Highcharts加载之后加载功能模块

/**
 * 睡眠模拟函数
 * @param  {Number} numberMillis 毫秒
 */
function sleep(numberMillis) {
  let now = new Date();
  const exitTime = now.getTime() + numberMillis;
  while (true) {
	  now = new Date();
	  if (now.getTime() > exitTime)
	  return;
  }
}

/**
 * 爬取品牌 & 车系
 */
function fetchBrand(req, res) {
  const pageUrls = []; // 存放爬取网址
  let count = 0; // 总数
  let countSuccess = 0; // 成功数

  let chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];

  for (let char of chars) {
	  count++;
	  pageUrls.push('http://www.autohome.com.cn/grade/carhtml/' + char + '.html');
  }

  let curCount = 0;
  let reptileMove = function (url, callback) {
    let startTime = Date.now(); // 记录该次爬取的开始时间
    request.get(url, { encoding: null }, function (err, res, body) {
      if (err || res.statusCode !== 200) {
      console.error(err);
      console.log('抓取该页面失败，重新抓取该页面..')
      reptileMove(url, callback);
      return false;
      }    
      let html = iconv.decode(body, 'gb2312')
      let $ = cheerio.load(html);
      let curBrands = $('dl');
      for (let i = 0; i < curBrands.length; i++) {
      let obj = {
        name: curBrands.eq(i).find('dt div a').text(),
        sub: []
      }
      fetchData.push(obj);  

      let curSeries = curBrands.eq(i).find('h4 a');
      for (let j = 0; j < curSeries.length; j++) {
        let obj = {
          name: curSeries.eq(j).text(),
          sub: [],
          url: curSeries.eq(j).attr('href')
        }
        fetchData[fetchData.length - 1].sub.push(obj);
      }
      }    
      countSuccess++;
      let time = Date.now() - startTime;
      console.log(countSuccess + ', ' + url + ', 耗时 ' + time + 'ms');
      callback(null, url + 'Call back content');
    });
  };

  // 使用async控制异步抓取   
  // mapLimit(arr, limit, iterator, [callback])
  // 异步回调
  async.mapLimit(pageUrls, 1, function (url, callback) {
    console.log('异步回调的url:' + url);
	  reptileMove(url, callback);
  }, function (err, result) {
    console.log('----------------------------');
    console.log('品牌车系抓取完毕！');
    console.log('----------------------------');
    fetchYear(req, res);
  });
}

/**
 * 爬取年份
 */
function fetchYear(req, res) {
  let count = 0; // 总数
  let countSuccess = 0; // 成功数
  const seriesArr = [];

  // 轮询所有车系
  for (let brand of fetchData) {
    for (let series of brand.sub) {
      count++;
      seriesArr.push(series);
    }
  }

  let curCount = 0;
  let reptileMove = function (series, callback) {
    let startTime = Date.now(); // 记录该次爬取的开始时间
    curCount++; // 并发数    

    request.get('https:' + series.url, { encoding: null }, function (err, res, body) {
      if (err || res.statusCode != 200) {
        console.error(err);
        console.log('抓取该页面失败，重新抓取该页面..')
        reptileMove(series, callback);
        return false;
      }

      let html = iconv.decode(body, 'gb2312')
      let $ = cheerio.load(html);

      // 页面默认的数据
      const itemList = $('.interval01-list li');
      itemList.each(function () {
        let year = $(this).find('a').eq(0).text().substr(0, 4);
        let name = $(this).find('a').eq(0).text();
        let flag = false;

        for (item of series.sub) {
          if (item.name == year) {
            item.sub.push(name);
            flag = true;
          }
        }

        if (!flag) {
          const obj = {
            name: year,
            sub: [$(this).find('a').eq(0).text()],
            url: ''
          };

          series.sub.push(obj);
        }
	    });

      // 下拉框中的年份抓取
      const curYears = $('.cartype-sale-list li');
      curYears.each(function () {
        let year = $(this).text().substr(0, 4);
        let flag = false;
        
        let href = series.url;
        let s = href.split('/')[3]; // 从url中截取所需的s参数
        let y = ($(this).find('a').attr('data'))
        let url = 'http://www.autohome.com.cn/ashx/series_allspec.ashx?s='
	        + s + '&y=' + y;

        for (item of series.sub) {
        if (item.name == year) {
          item.url = url;
          flag = true;
        }
        }

        if (!flag) {
          const obj = {
          	name: year,
          	sub: [],
          	url: url
          };

          series.sub.push(obj);
        }
	    })

      curCount--;
      countSuccess++;
      let time = Date.now() - startTime;
      console.log(countSuccess + ', ' + series.url + ', 耗时 ' + time + 'ms');
      
      sleep(50);
      callback(null, series.url + 'Call back content');
    });
  };

  console.log('车系数据总共：' + count + '条，开始抓取...')

  // 使用async控制异步抓取   
  // mapLimit(arr, limit, iterator, [callback])
  // 异步回调
  async.mapLimit(seriesArr, 10, function (series, callback) {
	  reptileMove(series, callback);
  }, function (err, result) {
    // 访问完成的回调函数
    console.log('----------------------------');
    console.log('车系抓取成功，共有数据：' + countSuccess);
    console.log('----------------------------');
    fetchName(req, res);
  });
}

/**
 * 爬取型号
 */
function fetchName(req, res) {
  let count = 0; // 总数
  let countSuccess = 0; // 成功数
  const yearArr = [];

  // 轮询所有车系
  for (let brand of fetchData) {
    for (let series of brand.sub) {
      for (let year of series.sub) {
        if (year.url) {
          count++;  // 过滤没有url的年款
          yearArr.push(year);
        }
      }
    }
  }

  let curCount = 0;
  let reptileMove = function (year, callback) {
    let startTime = Date.now(); // 记录该次爬取的开始时间
    curCount++; // 并发数
    console.log(curCount + ': ' + series.url);
    
    request.get(year.url, {encoding: null}, function (err, res, body) {
      if (err || res.statusCode != 200) {
        console.error(err);
        console.log('抓取该页面失败，重新抓取该页面..');
        console.log(year);
      
        reptileMove(year, callback);
        return false;
      }

      console.log(countSuccess + ', 抓取: ' + year.url)
      let html = iconv.decode(body, 'gb2312')
      try {
        let data = JSON.parse(html)
      } catch (e) {
        console.log('error... 忽略该页面');
        // reptileMove(series, callback);
        curCount--;
        callback(null, year.url + 'Call back content');
        return false;
      }
    
      let specArr = data.Spec;
      for (let item of specArr) {
        year.sub.push(item.Name);
      }

      curCount--;
      countSuccess++;
      let time = Date.now() - startTime;
      // sleep(100);
      callback(null, year.url + 'Call back content');
    });
  };

  console.log('车型数据总共：' + count + '条，开始抓取...')

  // 使用async控制异步抓取   
  // mapLimit(arr, limit, iterator, [callback])
  // 异步回调
  async.mapLimit(yearArr, 20, function (year, callback) {
	  reptileMove(year, callback);
  }, function (err, result) {
    // 访问完成的回调函数
    console.log('----------------------------');
    console.log('车型抓取成功，共有数据：' + countSuccess);
    console.log('----------------------------');
    // res.send(fetchData);

    let t = JSON.stringify(fetchData);
    fs.writeFileSync('data.json', t);  

    //将data.json存入MongoDB中
    fs.createReadStream(path.join(__dirname, './data.json'))
      .pipe(JSONStream.parse('*'))
      .pipe(saveToMongo)
      .on('execute-error', function (err) {
    	  console.log(err);
      })
      .on('done', function () {
    	  console.log('存入完毕!');
    	  process.exit(0);
      });
  });
}

/**
 * 爬虫入口
 */
fetchBrand();

/**
 * 配置MongoDB成功
 */
let saveToMongo = SaveToMongo({
  uri: 'mongodb://127.0.0.1:27017/carDb',  //mongoDB的地址
  collection: 'savetomongo',
  bulk: {
	  mode: 'unordered'
  }
});

// /**
//  * 创建图表
//  */
// Highcharts.chart('container', {
//   // Highcharts配置
// });
