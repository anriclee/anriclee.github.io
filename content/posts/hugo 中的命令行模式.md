---
title: "Hugo 中的命令行模式"
date: 2020-06-26T22:31:37+08:00
draft: false
categories:
- TECH
---

最近在用 hugo 构建了个人博客之后，便有兴趣想研究下其源码。但是源码的体量之大，逻辑之复杂出乎我的意料。不过好在源码的结构比较清晰，有许多地方值得借鉴。

比如它的程序入口，非常简洁：

```
func main() {
	resp := commands.Execute(os.Args[1:])

	if resp.Err != nil {
		if resp.IsUserError() {
			resp.Cmd.Println("")
			resp.Cmd.Println(resp.Cmd.UsageString())
		}
		os.Exit(-1)
	}
}
```
它将所有根据命令行参数传入的指令统一封装到 ```commands``` 包中。后面有新命令需求时，只需要新建一个 cmd 文件即可。

它是怎么做到的呢？

简而言之，就是在程序入口处将所有的命令类汇总，然后再根据输入参数```args```，决定要执行哪个```cmd```，看似增加了代码的复杂度，但是对于后续命令的扩展显得非常方便。

hugo 中使用了 builder 模式将所有的命令汇总，我这里简单起见，只初始化了一个数组，主要是体会其开闭原则的思想即可。

> Talk is cheap, show me the code

借鉴它的思路，我写了一个简化版，可以参看，[代码链接](https://github.com/anriclee/GoPatterns/tree/main/cmdpattern).

