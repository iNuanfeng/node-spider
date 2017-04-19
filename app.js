var express = require('express'),
  app = express(),
  request = require('request'),
  iconv = require('iconv-lite'),
  cheerio = require('cheerio'),
  async = require("async"), // 控制并发数，防止被封IP
  fs = require('fs'),
  JSONStream = require('JSONStream'),
  path = require('path');

var fetchData = []; // 存放爬取数据
var SaveToMongo = require('save-to-mongo');

/**
 * 睡眠模拟函数
 * @param  {Number} numberMillis 毫秒
 */
function sleep(numberMillis) {
  var now = new Date();
  var exitTime = now.getTime() + numberMillis;
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
  var pageUrls = []; // 存放爬取网址
  var count = 0; // 总数
  var countSuccess = 0; // 成功数

  var chars = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'];

  for (var char of chars) {
    count++;
    pageUrls.push('http://www.autohome.com.cn/grade/carhtml/' + char + '.html');
  }

  var curCount = 0;
  var reptileMove = function (url, callback) {
    var startTime = Date.now(); // 记录该次爬取的开始时间

    request({
      url: url,
      encoding: null // 关键代码
    }, function (err, res, body) {
      if (err || res.statusCode != 200) {
        console.error(err);
        console.log('抓取该页面失败，重新抓取该页面..')
        reptileMove(series, callback);
        return false;
      }

      var html = iconv.decode(body, 'gb2312')
      var $ = cheerio.load(html);
      var curBrands = $('dl');
      for (var i = 0; i < curBrands.length; i++) {
        var obj = {
          name: curBrands.eq(i).find('dt div a').text(),
          sub: []
        }
        fetchData.push(obj);

        var curSeries = curBrands.eq(i).find('h4 a');
        for (var j = 0; j < curSeries.length; j++) {
          var obj = {
            name: curSeries.eq(j).text(),
            sub: [],
            url: curSeries.eq(j).attr('href')
          }
          fetchData[fetchData.length - 1].sub.push(obj);
        }
      }

      countSuccess++;
      var time = Date.now() - startTime;
      console.log(countSuccess + ', ' + url + ', 耗时 ' + time + 'ms');
      callback(null, url + 'Call back content');
    });
  };

  // 使用async控制异步抓取   
  // mapLimit(arr, limit, iterator, [callback])
  // 异步回调
  async.mapLimit(pageUrls, 1, function (url, callback) {
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
  var count = 0; // 总数
  var countSuccess = 0; // 成功数
  var seriesArr = [];
  // 轮询所有车系
  for (var brand of fetchData) {
    for (var series of brand.sub) {
      count++;
      seriesArr.push(series);
    }
  }

  var curCount = 0;
  var reptileMove = function (series, callback) {
    var startTime = Date.now(); // 记录该次爬取的开始时间
    curCount++; // 并发数

    request({
      url: series.url,
      encoding: null // gbk转码关键代码
    }, function (err, res, body) {
      if (err || res.statusCode != 200) {
        console.error(err);
        console.log('抓取该页面失败，重新抓取该页面..')
        reptileMove(series, callback);
        return false;
      }

      var html = iconv.decode(body, 'gb2312')
      var $ = cheerio.load(html);

      // 页面默认的数据
      var itemList = $('.interval01-list li');
      itemList.each(function () {
        var year = $(this).find('a').eq(0).text().substr(0, 4);
        var name = $(this).find('a').eq(0).text();
        var flag = false;
        for (item of series.sub) {
          if (item.name == year) {
            item.sub.push(name);
            flag = true;
          }
        }
        if (!flag) {
          var obj = {
            name: year,
            sub: [$(this).find('a').eq(0).text()],
            url: ''
          };
          series.sub.push(obj);
        }
      });

      // 下拉框中的年份抓取
      var curYears = $('.cartype-sale-list li');
      curYears.each(function () {
        var year = $(this).text().substr(0, 4);
        var flag = false;

        var href = series.url;
        var s = href.split('/')[3]; // 从url中截取所需的s参数
        var y = ($(this).find('a').attr('data'))
        var url = 'http://www.autohome.com.cn/ashx/series_allspec.ashx?s='
          + s + '&y=' + y;

        for (item of series.sub) {
          if (item.name == year) {
            item.url = url;
            flag = true;
          }
        }
        if (!flag) {
          var obj = {
            name: year,
            sub: [],
            url: url
          };
          series.sub.push(obj);
        }
      })

      curCount--;
      countSuccess++;
      var time = Date.now() - startTime;
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
  var count = 0; // 总数
  var countSuccess = 0; // 成功数
  var yearArr = [];
  // 轮询所有车系
  for (var brand of fetchData) {
    for (var series of brand.sub) {
      for (var year of series.sub) {
        if (year.url) {
          count++;  // 过滤没有url的年款
          yearArr.push(year);
        }
      }
    }
  }

  var curCount = 0;
  var reptileMove = function (year, callback) {
    var startTime = Date.now(); // 记录该次爬取的开始时间
    curCount++; // 并发数
    // console.log(curCount + ': ' + series.url);

    request({
      url: year.url,
      encoding: null // gbk转码关键代码
    }, function (err, res, body) {
      if (err || res.statusCode != 200) {
        console.error(err);
        console.log('抓取该页面失败，重新抓取该页面..')
        console.log(year)
        reptileMove(year, callback);
        return false;
      }

      console.log(countSuccess + ', 抓取: ' + year.url)
      var html = iconv.decode(body, 'gb2312')
      try {
        var data = JSON.parse(html)
      } catch (e) {
        console.log('error... 忽略该页面');
        // reptileMove(series, callback);
        curCount--;
        callback(null, year.url + 'Call back content');
        return false;
      }
      var specArr = data.Spec;
      for (var item of specArr) {
        year.sub.push(item.Name);
      }

      curCount--;
      countSuccess++;
      var time = Date.now() - startTime;
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
    var t = JSON.stringify(fetchData);
    fs.writeFileSync('data.json', t);

    //将data.json存入MongoDB中
    fs.createReadStream(path.join(__dirname, './data.json'))
      .pipe(JSONStream.parse('*'))
      .pipe(saveToMongo)
      .on('execute-error', function(err) {
        console.log(err);
      })
      .on('done', function() {
        console.log('存入完毕!');
        process.exit(0);
      });
  });
}

/**
 * 爬虫入口
 */
fetchBrand();

//配置MongoDB成功
var saveToMongo = SaveToMongo({
  uri: 'mongodb://127.0.0.1:27017/carDb',  //mongoDB的地址
  collection: 'savetomongo',
  bulk: {
    mode: 'unordered'
  }
});
