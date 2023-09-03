---
title: "[译]Spring IOC 容器"
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


# 容器概述

`org.springframework.context.ApplicationContext` 接口代表了 Spring IoC 容器，它主要负责通过读取配置文件对 bean 进行实例化、配置和组装。
容器通过读取配置元数据来获知要实例化、配置和组装那些对象。配置的元数据一般为 XML、Java 注解和 Java 代码的形式，它让你能够表达组成你应用程序的对象以及对象之间的丰富的相互依赖关系。

Spring 提供了 `ApplicationContext` 接口的若干实现。在单体应用中，创建一个 `ClassPathXmlApplicationContext` 或者 `FileSystemXmlApplicationContext` 是很常见的。虽然 XML 是定义配置元数据的传统形式，但是你还可以通过在 XML 文件里面进行声明配置来告诉容器对于 Java 注解或者Java代码格式的支持。


在大多数的应用场景中，并不需要显式的代码来实例化 Spring IoC 容器。例如，在 Web 应用的场景中，在 `web.xml` 文件中仅用简单的 8 行代码左右的样板 Web XML 描述符即可满足需要（参考 [Convenient ApplicationContext Instantiation for Web Applications](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-create)）。如果你使 Eclipse 中的 Spring 工具（在 Eclipse 开发环境中），你可以通过几下鼠标点击或者按键的敲击就能轻松创建这样一个样板配置文件。

下图展示了关于 Spring 工作机制的一个全局视角。在 `ApplicationContext` 被创建和初始化后，你的应用类和配置元数据已经捆绑在一起了，这样一来，你就有一个充分配置并且可执行的系统或者应用程序。

![Spring](/posts/translation_docs/imgs/container-magic.png)

# 配置元数据

如上图所示，Spring Ioc 容器接收到一种格式的配置元数据。这个配置元数据代表了，作为一个应用开发者你告诉 Spring 容器在应用程序中，如何实例化、配置和组装对象。

传统的配置元数据是一种简单并且符合直觉的 XML 形式，在本章的大部分地方，也用此来表达关键的概念和 Spring IoC 容器的特性。

> 基于 XML 的元数据不是配置元数据的唯一允许的形式。Spring IoC 容器自身与配置元数据实际上是什么格式完全解耦。目前许多开发者在应用程序中选择[基于Java 的配置](https://docs.spring.io/spring-framework/reference/core/beans/java.html)。

在 Spring 容器中使用其他格式的配置元数据，可参考：

 - [基于注解的配置](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config.html)：通过基于注解的配置元数据定义 beans
 - [基于Java的配置](https://docs.spring.io/spring-framework/reference/core/beans/java.html)：通过使用 Java 而不是 XML 文件来定义你应用类之外的 beans。使用这些特性可以参考 [@Configuration](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/Configuration.html), [@Bean](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/Bean.html), [@Import](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/Import.html), [@DependsOn](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/DependsOn.html) 注解。

 
 TO BE CONTINUED .....