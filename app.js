var express = require('express'),
  app = express(),
  request = require('request'),
  iconv = require('iconv-lite'),
  cheerio = require('cheerio'),
  fs = require('fs');

var CONFIG = {
  uri: 'http://www.mca.gov.cn/article/sj/xzqh/2019/201908/201908271607.html'
  // uri: 'http://localhost:3000/a'
}

/**
 * 过滤tr行的无关数据
 * @param  {Array} trs 所有的tr行
 * @return {Array}     有效的数据
 */
function filterData(trs) {
  var data = []

  for (var i = 0; i < trs.length; i++) {
    var code = trs.eq(i).find('td').eq(1).text();

    // 台湾开始 不统计
    if (code && code === '710000') {
      break;
    }

    // 收集所有有效数据到data
    if (code && code !== '行政区划代码') {
      data.push({
        code: code,
        name: trs.eq(i).find('td').eq(2).text()
      })
    }
  }

  console.log('已收集' + data.length + '条数据，开始生成json...');

  return data;
}

/**
 * 生成地区数据
 */
function generateArea(data, res) {
  var areas = data;
  var result = [];

  let province = areas.filter(item => {
    return item.code.indexOf('0000') > 1 || item.code.indexOf('00000') > 0;
  });

  province.forEach(p => {

    let _pcode = p.code.substring(0, 2);
    // 所有下级政区
    let child = areas.filter(area => {
      let _a = area.code.substring(0, 2);
      return area.code !== p.code && _a === _pcode;
    });

    // 市级
    let _citys = child.filter(c => {
      let _head = c.code.substring(0, 2);
      let _tail = c.code.substring(4);
      return _head === _pcode && _tail === '00';
    });
    p.children = [];
    
    // 有市级，生成市级
    _citys.forEach(city => {
      let _ccode = city.code.substring(0, 4);
      let _area = child.filter(c => {
        let _head = c.code.substring(0, 4);
        return _head === _ccode && c.code !== city.code;
      });

      let _city = {
        code: city.code,
        name: city.name,
        children: JSON.parse(JSON.stringify(_area))
      };
      p.children.push(_city);

      // 给已有归属的区县一个标识
      for (let i=0; i<_area.length; i++) {
        _area[i].hasFather = true;
      }
    });
    result.push(p);

  });

  

  // 将直辖市县归属为省
  areas.forEach(item => {
    if (item.code.indexOf('0000') === -1 && item.code.substring(4) !== '00'
          && !item.hasFather) {
      result.forEach(p => {
        if (p.code.substring(0, 2) === item.code.substring(0, 2)) {
          p.children.push({
            code: item.code,
            name: item.name,
            children: []
          })
        }
      });
    }
  });

  return result;
}

function transformAntd(data) {
  let result = data.map(item => {
    return {
      value: item.name,
      label: item.name,
      children: item.children
    }
  })

  result.forEach(item => {
    if (item.children) {
      item.children = transformAntd(item.children)
    }
  })
  
  return result
}

/**
 * 开始
 */
function start(req, res) {
  var pageUrl = CONFIG.uri;
  var _res = res;

  console.log('loading page...', pageUrl);

  request({
    url: pageUrl,
    encoding: null // 关键代码
  }, function(err, res, body) {
    if (err || res.statusCode != 200) {
      console.log('抓取该页面失败，请重试.')
      return false;
    }
    console.log('loading success.')
    var html = iconv.decode(body, 'utf-8')

    var $ = cheerio.load(html);
    var trs = $('table').find('tr');

    // 过滤出有效的数据，并以对象数组形式存储 [{code:xx, name:xx}]
    var data = filterData(trs);

    // 生成数据文件
    var result = generateArea(data, _res);

    // 转换为antd使用格式
    result = transformAntd(result)

    // 开始写入文件
    console.log('数据生成完成，开始写入文件...')
    var t = JSON.stringify(result);
    fs.writeFileSync('data.json', t);

    // 文件生成完成
    console.log('done!');
  });
}

/**
 * 爬虫入口
 */
start();

// 开启express路由，用于浏览器调试
// app.get('/', start);
// app.get('/a', function(req, res) {
//   res.sendFile(__dirname + '/a.html');
// });


// var server = app.listen(3000, function() {
//   console.log('listening at 3000');
// });




