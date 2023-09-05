---
title: "[译] Spring IOC 容器"
date: 2023-09-02T23:12:31+08:00
draft: false
tags:
  - Spring
---

# Spring IOC 和 bean 的简介

本章涵盖了 SpringFramework 中的控制反转原则（Ioc）的实现。IoC 也被称为依赖注入（DI）。它是这样的一种过程，在此期间对象仅通过构造函数参数、工厂方法的参数或者当对象实例被构造后或者通过工厂方法返回时在它上面设置的属性定义自己的依赖（即对象必须合作的其他对象）。

当容器创建这些 bean 后，再注入这些依赖。

这个过程本质上与bean 通过使用直接的类构造函数进行直接实例化或者通过类似 Service Locator模式来寻找依赖的位置是相反的（这也是 IoC 名字的由来）。

`org.springframework.beans` 和 `org.springframework.context` 包是 SpringFramework IoC 容器的基石。`BeanFactory` 接口提供了一种更先进的能够控制人已类型对象的配置机制。`ApplicationContext` 是 `BeanFactory` 的子接口。它增加了下面的特性：

- 与 Spring 的 AOP 特性更容易整合
- 消息资源处理（在国际化场景的使用）
- 事件发布
- 例如用于 Web 应用的 `WebApplicationContext` 应用层特定的上下文

总而言之，`BeanFactory` 提供了配置的框架和基本的功能。`ApplicationContext` 增加了更多的企业特定的功能。`ApplicationContext` 完全是 `BeanFactory` 的超集。在本章关于 Spring IoC 容器做专门描述时会用到。想要获取更多的关于使用 `ApplicationContext` 而非 `BeanFactory` 的信息，参见介绍 [BeanFactory](https://docs.spring.io/spring-framework/reference/core/beans/beanfactory.html) API 的部分。

在 Spring 中，作为你应用基石同时可以被 Spring IoC 容器所操控的对象就被称之为 bean。bean 就是被 Spring IoC 容器实例化、组装和设置的对象。否则，一个 bean 就是你应用程序中诸多对象中的一个。 Beans 以及他们依赖关系，反映在容器使用的配置元数据中。
