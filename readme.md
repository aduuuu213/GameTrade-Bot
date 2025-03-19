## 系统架构

![系统架构图](/images/82b91715850941.png)

## 系统简介 {#introduction}

### 系统名称
GameTrade贩卖综合管理系统

### 主要功能与特色
商品全自动上下架、智能刷新、24小时发货、消息中台

### 生产环境演示 {#demo}
[在线演示](https://www.gd-bot.com)

### 技术栈 {#tech-stack}
- 前端：vue-admin-template、Avue
- 后端：Flask_restful、celery
- 打码客户端：pyppeteer

## 功能亮点 {#features}

### 核心功能
- **商品管理**：可添加10 * 120 号商品
- **商品出品、刷新**：后台任务编排，策略控制，详见下图
- **消息中台**：集中处理所有账号的订单消息、评论消息，关键词自动回复、订单完成自动评价
- **自动发货**：24小时自动发货，解放双手
- **打码客户端**：后台发布任务后，打码客户端自动获取任务，调用第三方谷歌验证码识别服务进行验证码识别，识别成功后拦截数据包转发至后台，由后台使用代理包装后发送至GameTrade.JP，100%出品，拒绝前端各种意外情况

## 应用场景

#### 目标用户群体

经营GameTrade.JP的商家、工作室

#### 解决的问题

解放人工

## 联系方式

- QQ：
  **845331767**
- WeChat:
  **Shuai__D**
- 添加时请备注：gametrade

## 更新日志

###### 2025年3月10日v1.0.3

余额转移新增刷销量模式：小号余额自动转移至大号，模拟正常交易刷好评，根据设定的商品价格，分多笔交易直至余额不足
批量下架：采集账号历史遗留的上架商品，根据规则将落后当前市场价格的商品批量下架

###### 2024年9月16日v1.0.2

新增功能：新增浮动聊天框，多账号可同时登录，协同处理消息

###### 2024年6月7日V1.0.1

新增功能：余额自动转移到指定大号（根据小号余额，大号上架商品，小号自动购买）

###### 2024年5月16日推出V1.0
