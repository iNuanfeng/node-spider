> 在 area 分支中，有爬取行政局全国省市区数据的功能。

## 应用介绍
nodejs爬虫，爬取汽车之家所有车型数据 http://www.autohome.com.cn/car/

包括品牌，车系，年份，车型四个层级。

## 特性

### 现有特性

1、爬取汽车之家的数据;

2、自动存入MongoDB数据库;

3、添加cz-customizable插件，从而规范git提交说明的规范;

4、添加commitlint/cli，校验git说明是否符合规范；

### 未来要添加特性

1、用HighChart显示爬取数据;

2、添加单元测试.

### 使用的node模块：

  superagent, request, iconv; （网络请求模块，iconv用于gbk转码）

  cheerio; （和jQuery一样的API，处理请求来的html，省去正则匹配）

  eventproxy, async; （控制并发请求，async控制得更细）

  async控制并发请求数量为10个（避免封IP与网络错误）

  模拟sleep使间隔100ms（不设间隔偶尔会出现dns错误）

  去除express模块，该为控制台直接开启爬虫（数据量大，打开网页来开启爬虫可能会由于超时而重新发起访问）


### 最终使用的模块
   `request`, `iconv`, `cheerio`, `async`

   最后自动存入到mongoDB数据库

## 项目说明

   app.js是爬虫主程序，分步骤抓取数据。

###  爬取步骤：

   1. 抓取品牌和车系;
   2. 抓取年份;
   3. 抓取车型;
   4. 存入本地json文件;
   5. 自动存入MongoDB数据库.

### 细节控制

   1、在售款有2016款和2017款;

   2、有的车系在售有2016款，停售的也有2016款;

   3、抓取失败时重新抓取该页面;

   4、抓取完毕自动存入data.json;

   5、存取完毕，读取并存入MongoDB;

## 环境要求

   运行项目前请先安装Node和MongoDB数据库

## 贡献者

Frank--https://github.com/sunfeng90

## 使用方法

```bash

#### 安装依赖
npm install

#### 启动爬虫，数据存储于data.json
node app

#### 存入MongoDB数据库
注意：爬虫的数据自动存入你本地的MongoDB数据库（前提是你已经安装了MongDB数据库）

```

## 爬取结果截图

- [MongoDB截图](https://github.com/sunfeng90/node-spider/blob/autohome/results/result.md)


##  赞助


## 协议

- [MIT](https://github.com/itead/IoTgo-Pro/blob/master/LICENSE)
