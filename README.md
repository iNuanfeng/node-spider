##应用介绍
nodejs爬虫，爬取中国民政部地区数据

http://www.mca.gov.cn/article/sj/tjbz/a/

http://www.mca.gov.cn/article/sj/tjbz/a/2017/201705/201706301407.html


###使用的node模块：

request, iconv; （网络请求模块，iconv用于utf-8转码）

cheerio; （和jQuery一样的API，处理请求来的html，省去正则匹配）

**最终使用的模块为：** `request`, `iconv`, `cheerio`

最后写入到data.json


## 项目说明
app.js是爬虫主程序，分步骤抓取数据。

1. 抓取table
2. 过滤出有效数据
3. 转换为层级的数组对象
4. 存入本地json文件

### 细节控制
地区分几种情况：

1. 省市区三级
2. 省市两级
3. 省区两级
4. 去除台湾、港澳地区


##使用方法

```bash
# 安装依赖
npm install
# 启动爬虫，数据存储于data.json
node app
```