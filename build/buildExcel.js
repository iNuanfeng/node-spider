const {
  readFile,
  writeFile
} = require('../utils/fs');
const {
  uniqApp,
  obj2arr
} = require('../utils');
const path = require('path');
const xlsx = require('node-xlsx');
const getBaidu = require('./getBaidu');
const getSoso = require('./getSoso');

let data = [];

(async () => {
  let sosoData = await getSoso();
  let baiduData = await getBaidu();

  data = [].concat(sosoData, baiduData);
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
