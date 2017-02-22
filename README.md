##应用介绍
nodejs爬虫，爬取汽车之家（http://www.autohome.com.cn/car/车型数据。

包括品牌，车系，年份，车型四个层级。

###使用的node模块：

superagent, request, iconv; （网络请求模块，iconv用于gbk转码）

cheerio; （和jQuery一样的API，处理请求来的html，省去正则匹配）

eventproxy, async; （控制并发请求，async控制得更细）

async控制并发请求数量为10个（避免封IP与网络错误）

模拟sleep使间隔100ms（不设间隔偶尔会出现dns错误）

去除express模块，该为控制台直接开启爬虫（数据量大，打开网页来开启爬虫可能会由于超时而重新发起访问）

**最终使用的模块为：** `request`, `iconv`, `cheerio`, `async`

最后写入到数据库mysql或mongoDB



## 项目说明
app.js是爬虫主程序，分步骤抓取数据。

1. 抓取品牌和车系
2. 抓取年份
3. 抓取车型
4. 存入本地json文件
5. 按需写入数据库（暂时没写)

### 细节控制
http://www.autohome.com.cn/3128 在售款有2016，2017同时存在

有的车系在售有2016，停售也有2016

抓取失败时重新抓取该页面



##使用方法

```bash
# 安装依赖
npm install
# 启动爬虫，数据存储于data.json
node app
# 将data.json的数据保存到mysql
node save-mysql
# 将data.json的数据保存到mongoDB
node save-mongo
```