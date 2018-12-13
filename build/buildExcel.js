const {
  readFile,
  writeFile
} = require('../utils/fs');
const {
  uniqApp,
  coverApp
} = require('./utils');
const {
  obj2arr
} = require('../utils');
const path = require('path');
const xlsx = require('node-xlsx');
const getBaidu = require('./getBaidu');
const getSoso = require('./getSoso');
const getTianyan = require('./getTianyan');

let data = [];

(async () => {
  let sosoData = await getSoso(); // 8872

  let tyData = await getTianyan();  // 7179

  let sotianData = coverApp(sosoData, tyData);  // 9319

  let baiduData = await getBaidu();

  data = [].concat(sotianData, baiduData);
  data = uniqApp(data)

  // 转数组 用于excel导出
  for (let i = 0; i < data.length; i++) {
    data[i] = obj2arr(data[i]);
  }

  await writeXls(data, 'phone-data');
})();

async function writeXls(datas, xlsName) {
  var buffer = xlsx.build([{
    name: 'sheet1',
    data: datas
  }]);
  await writeFile(path.join(__dirname, `../dist/${xlsName}.xlsx`), buffer, {
    'flag': 'w'
  }); //生成excel
}
