# [译] SpringFramework 概述



# 概述

Spring 使得创建 Java 企业级应用更加容易。它提供了你在企业环境下拥抱 Java 语言所需要的一切，支持 JVM 平台上的 Groovy 和 Kotlin 作为备选语言，并且提供了根据应用程序的需求创建多种架构的灵活性。从 SpringFramework 6.0 开始，Spring 需要 Java 17 以上的版本。


Spring 支持广泛的应用场景。在一个大型企业里，应用程序经常会存在很长时间，并且必须运行在一个开发者不能控制升级周期的 JDK 和应用服务器上。
另外一些可能会作为一个内嵌服务器的单独 jar 包，运行在一个云环境里，还有一些可能是一个不需要服务器的独立应用程序（例如批处理或者集成处理工作）。

Spring 是开源的。它有一个庞大而活跃的社群，基于各种实际用例，提供持续反馈。这也帮助了 Spring 在相当长一段时间内成功发展。。


# 当我们在谈 Spring 时我们在谈什么

“Spring” 这个术语在不同的语境下有着不同的含义。它可以用来表示 SpringFramework 这个项目自身，一切都是从这里开始的（-译者按：梦开始的地方）。随着时间的推移，又构建了一些以 SpringFramework 为基础的 Spring 项目。大部分情况下，当人们谈论 Spring，他们的意思是 Spring 整个系列（-译者按：俗称全家桶）。本参考文档只针对这个基础进行介绍：SpringFramework 本身。

SpringFramework 被分成不同的模块。应用程序可以根据他们所需要的模块进行选择。这些模块中处于核心的是 core container，包括配置模型和依赖注入机制。除此之外，SpringFramework 还对于不同应用架构提供基础支持，包括消息传递、事务以及持久化和 web。它同时也包含了基于 Servlet 的 SpringMVC web 框架以及Spring WebFlux 响应式web框架。

关于这些模块需要注意的是：

Spring 的框架，允许部署到 JDK 9 的模块路径（"Jigsaw"）。对于在支持 “Jigsaw” 的应用程序中的使用，Spring Framework 5 的 jar 包里面，携带了 “Automatic-Module-Name” 的 manifest entries，它定义了稳定的语言级别模块名（例如：“spring.core”，“spring.context” 等等），它与 jar 的 artifact 名字独立（ 这些 jar 遵循同样的模式，例如 “spring-core” 和 “spring-context”。 “-” 代替 “.” 

> 译者按：本人对于 Jigsaw 不太熟悉，等后面熟悉了，再过来修正这一段的翻译。目前，是不知道这段说了什么的。

当然，Spring 框架中的 jar 包，在 JDK 9 和 JDK 9+ 的 classpath 中，可以继续正常工作。


# Spring 和 Spring Framework 的历史


在 2003 年，为了应对 J2EE 早期规范的复杂性，Spring 应运而生。
虽然一些人认为 Java EE 和他的现代继承者 Jakarta EE 与 Spring 势不两立，但是他们实际上是互为补充的。
Spring 的编程模型不会拥抱 Jakarta EE 平台的规范，相反，它从传统的 EE 的笼罩下面，精心挑选了一些规范，并与之整合：

- Servlet API (JSR 340)

- WebSocket API (JSR 356)

- Concurrency Utilities (JSR 236)

- JSON Binding API (JSR 367)

- Bean Validation (JSR 303)

- JPA (JSR 338)

- JMS (JSR 914)

- 如果有必要的话，还有 JTA/JCA 用于事务协商的设置

SpringFramework 还支持应用开发者使用依赖注入规范（JSR 330）和通用注解规范（JSR 250），代替 SpringFramework 提供的 Spring 规范机制。最初，他们都是基于 javax 包的。
> 译者按：自由即长久。

SpringFramework 6.0 里，Spring 已经升级到 Jakarta EE 9（例如：Servlet 5.0+，JPA 3.0+），基于 Jakarta 名称空间，而非传统的 javax 包。
从 EE 9 开始到现在已经支持的 EE 10，Spring 准备对 Jakarta EE 接口的进一步发展提供开箱即用的支持。

SpringFramework 6.0 已经完全兼容 Tomcat 10.1，Jetty 11 和 Undertow 2.3 作为 web 服务器，这其中也抱愧 Hibernate ORM 6.1.

随着时间的推移，Java/Jakarta EE 在应用开发中的角色在不断演进。在 J2EE 和 Spring 的早期，应用被创建后，部署到一个应用服务器上。

今天，在 Spring Boot 的帮助下，应用可以以一种 devops 和云友好的方式创建，内嵌 Servlet 容器，并且易于修改。从 SpringFramework 5 开始，WebFlux 应用甚至不直接使用 Servlet API 就可以在非 Servlet 的服务器上运行起来（例如 Netty）

Spring 持续创新和演进。除了 SpringFramework 之外，还有很多项目，例如 Spring Boot，Spring Security，Spring Data，Spring Cloud，Spring Batch。
值得记住的是：每一个项目都有它自己的源码仓库，问题追踪和发版节奏。可以在 [spring.io/projects](https://spring.io/projects) 看到 Spring 项目的完整清单。

# 设计哲学

当你了解一个框架时，重要的不是知道它做了什么而是它遵循什么样的准则。SpringFramework 的指导准则如下：
- 在每一个级别上提供选择。Spring 可以让你尽可能晚地推迟做出设计决策。比如，你可以在不更改代码的情况下，改变你的持久化方案。对于其他的基础设施问题，整合其他第三方的 API，这一点同样适用。
- 兼容并包。Spring 拥抱灵活性，并不介意事情是怎么被完成的。它提供了在不同观念下的诸多需要。
- 保持较强的向后兼容性。Spring 的演进经过精心管理，在版本之间，几乎没有特别大的变化。Spring 精心挑选 JDK 版本号范围以及第三方库，以方便维护依赖于 Spring 的应用以及库。
- 精心设计 API。Spring 团队投入了较多的时间和精力设计 API，目的是让 API 更加符合直觉，可以使用很多年，跨越多个版本。
- 对代码质量设置较高的标准。SpringFramework 重点强调有意义的、及时、精确的 javadoc。它是为数不多的声称拥有干净的代码架构且在不同的包之间没有循环引用的项目之一。


# 开始

如果你刚开始接触 Spring，你也许会从创建一个基于 SpringBoot 应用开始使用 SpringFramework。SpringBoot 提供了一个快速（固定）的方式来创建可部署生产环境的基于 Spring 的应用。它基于 SpringFramework，喜欢约定优于配置的风格，设计它就是为了让你能够尽可能快地启动和运行。

你可以使用[start.spring.io](https://start.spring.io/)来生成一个基本的项目，或者遵循["Getting Started" 指南](https://spring.io/guides) 例如 [Getting Started Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)。

这些指南都是任务导向且易于理解的，他们中的大部分是基于 SpringBoot。它同时也涵盖了 Spring 产品中的其他项目，这些你可能会在解决某个具体的问题时会使用到。
