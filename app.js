//依赖模块
var fs = require('fs');
var request = require("request");
var mkdirp = require('mkdirp');
var path = require('path');

//本地存储目录
var dir = path.join(__dirname + '/images');

//创建目录
mkdirp(dir, function(err) {
  if (err) {
    console.log(err);
  }
});

// 图片下载地址
// 这个地址如果没有，可以换成spiderPic.js操作

var urlArr = [];

for (var i = 61; i <= 70; i++) {
  urlArr.push('https://speakerd.s3.amazonaws.com/presentations/dcc10ff09b7a013185554adba30e7edb/slide_' + i + '.jpg');
}

console.log(urlArr)

// 主要方法，用于下载文件
var download = function(url, dir, filename) {
  request.head(url, function(err, res, body) {
    request(url).pipe(fs.createWriteStream(dir + "/" + filename));
  });
};

urlArr.map(function(val) {
  download(val, dir, val.split('slide_')[1]);
})