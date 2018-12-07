// 引入依赖插件
const { readFile, writeFile } = require('../../utils/fs');
const path = require('path');

let data = null;

(async () => {
  

  // 爬详情
  let appList = await readFile(path.join(__dirname, './mi_list.json'))
  appList = JSON.parse(appList);
  let data = await mi_detail(browser, appList);

  console.log(data)
})();