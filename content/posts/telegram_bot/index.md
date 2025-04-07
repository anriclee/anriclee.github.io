---
title: "Telegram bot 入门实践"
date: 2022-06-11T11:43:42+08:00
draft: false
tags:
  - telegram
---


# 什么是 Bot

Bot 的概念在官网的介绍稍微有点繁琐和，详细可以了解[官网介绍](https://core.telegram.org/bots)，

简单来说，bot 就是你在 telegram 中的一个特殊账号，你申请了 bot，这个 bot 就是你的代理人，你发号施令到 bot，bot 会响应你的指令，仅此而已。

申请 bot 需要找 BotFather（名字起的很形象），具体过程官网说的比较详细，此处不赘言。但是需要强调的一点是，bot 仅仅是你的代理人而已，真正执行你指令的是你自己部署的脚本，如果你不部署自己的脚本，在 bot 中输入指令，是没有任何响应的。

你、bot和你部署的脚本关系如下:

!["你、bot和你部署的脚本"](https://raw.githubusercontent.com/anriclee/diagramStorage/master/telegram.drawio.png)

# 脚本

上面说过了，bot 只是你在 telegram 的一个代理，真正干活的是你的脚本。既然自己写脚本，就会存在两个问题：接受指令、做出响应。

## 接受指令

对于如何让脚本接受指令，官方提供了两种思路：推模式 、拉模式。

- 拉模式

这种模式，官方不太推荐。简单而言，就是自己部署一个脚本，不断执行 get 请求，获取自己 bot 的更新信息，就好比一个仆人一直在问你：

有没有需要我做的？

有没有需要我做的？

有没有需要我做的？

询问的方式也比较简单：

```
curl -X GET https://api.telegram.org/bot[token]/getUpdates
```
这里的 token，就是上面申请 bot 完毕后，得到的 token， 出于脱敏，我使用 [token] 代替，下同。这种方法比较笨拙，轮询的频次太高和太低都不行，而且你在 bot 中发布一条指令后，可能并不能够马上得到执行，会有延迟。

这种方式的好处是：可以让 bot 启在本地，不需要部署到服务器上，因为 telegram 不知道你的存在，他也不需要知道你的存在。

- 推模式

这种方式是官方比较推荐的一种方式，这种类似事件驱动的原理。只有有任务了，才会通知脚本去做。但前提是：在向 bot 发号施令前，需要在 bot 中注册一个 callback url。

bot 在接受你的指令后，会调用此 url，通知你的脚本，让他执行任务。

注册方式也比较简单：

```
curl -X POST https://api.telegram.org/bot[token]/setWebhook -H "Content-type: application/json" -d '{"url": "[YOUR_URL]"}
```
使用这种方式，会比上一种稍微麻烦一点，需要你部署的服务能够支持 https（这也是为了安全起见）。


### 响应指令

收到 telegram 的指令后，如何发送消息到 telegram 频道呢？笔者对 golang 较为熟悉，所以采用了 golang 的方式进行响应。

```Golang
func Handler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		log.Printf("parse form values failed:%+v", err)
	}
	body, _ := r.GetBody()
	bytes, _ := io.ReadAll(body)
	msg := string(bytes)
	// ...... 读取到 query 参数和 body 后，可以进行各种逻辑操作

	fmt.Fprintf(w, "result:"+content)
}
```
上面的代码使用到了一个[开源库](https://github.com/go-telegram-bot-api/telegram-bot-api)，他替我们封装好了api（当然也可以自己按照 telegram 的协议组装消息）。


## 部署脚本

现在有了 bot，也有了响应 bot 的脚本逻辑，只剩部署脚本到服务器了。我们当然不能仅仅为了响应一条指令租一个个人服务器吧（土豪除外）。

笔者用的是 Vercel 平台，使用 Vercel 部署 ServeLess 的 Function 还是比较方便的，部署过程，跟随步骤指导一步一步来比较容易。

https://vercel.com/


部署好之后，可以先在本地执行下 curl 请求，测试没问题后，将该 url 设置为 telegram bot 的 callback 函数即可。

## 使用

学会一个东西的主要方法，就是疯狂的使用它。本人出入办公单位，都需要扫门禁二维码，不胜其烦，需要关注微信小程序，然后点击门禁二维码，全程既慢且麻烦。

在一次偶然抓包之后，发现获取二维码的请求是一个简单的 http post 请求，且密码为明文。

这次体验到了 Serveless 的方便，出于 bot 练习之故，可以将该请求封装到 script 中，部署到 vercel 平台上，在 telegram 申请一个门禁机器人，打开之后，发送指令到 script，script 发起 post 调用，获取到结果后，渲染为二维码即可。

渲染二维码使用到的[开源包](https://github.com/skip2/go-qrcode)


## 请求安全性校验

为了安全起见，有人恶意调用你的脚本 url，可以将自己脚本服务的 api 的前缀设置为 token（token 没有人知道，所以也无法知道的 api）。vercel 平台支持通过 vercel.json 进行请求的重定向，可以通过正则表达式，将 `randomwdocd23123123[token 示例]/api` 转发到 `/api`。

```Json
{
   "routes":[
      {
         "src":"/random/(?<id>[^/]*)/api/hello/",
         "dest":"/api/hello.go?id=$id"
      }
   ]
}
```

这是利用了官方提供的重定向的特性，详细可以参考[官网](https://vercel.com/docs/project-configuration#)

# reference

1.[Build a serverless Telegram chatbot deployed using Vercel](https://www.marclittlemore.com/serverless-telegram-chatbot-vercel/)