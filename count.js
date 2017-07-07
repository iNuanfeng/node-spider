var fs = require('fs');

var file="data.json";
var data=JSON.parse(fs.readFileSync(file));

var len = 0;
for (var brand of data) {
  console.log(len++)
  for (var series of brand.sub) {
    console.log(len++)
    for (var year of series.sub) {
      console.log(len++)
      for (var name of year.sub) {
        console.log(len++);
      }
    }
  }
}