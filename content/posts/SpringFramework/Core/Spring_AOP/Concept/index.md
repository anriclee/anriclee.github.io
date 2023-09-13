---
title: "[译] Spring AOP 概念"
date: 2023-09-05T23:01:18+08:00
draft: false
---

AOP 通过提供另外一种关于程序结构的思考方式补充了面向对象编程（OOP ）。在 OOP 中模块的关键单元是 class，而在 AOP 中，模块的关键是 Aspect（切面）。切面支持跨多个对象和类型的关注点模块化（比如事务的管理）。在 AOP 中这种关注点通常被叫做 “跨领域” 关注点。

Spring 的一个核心组件就是 AOP 框架。虽然 Spring IoC 容器并不依赖于 AOP（意思是如果不想用 AOP 可以不用），但是 AOP 对 Spring IoC 做了一个补充，提供了一种功能非常强大的中间件解决方案。

> Spring AOP 和 切面切点
>
> Spring 提供了简单而高效的方式来自定义切面，可以通过基于 schema 的方法也可以通过 @AspectJ 注解的风格。当使用 Spring AOP 来织入时，这两种风格都提供了充分类型的 advice 和 AspectJ 的切点语言。
>
> 这张主要讨论 schema 和 @Aspect 的 AOP 支持。AOP 底层的支持在下面的一章节会讨论到。

AOP 在 Spring 框架中的用途：
- 提供声明式的企业级服务。最重要的就是声明式事务管理
- 让用户实现自定义的切面作为他们用 AOP 实现 OOP 的补充。

Note：如果你对通用的声明式服务或者其他预先打包的声明式中间件服务感兴趣，你不用直接和 Spring AOP 直接打交道，可以跳过本章的大部分地方。

# AOP 概念

让我们从一些核心的 AOP 概念和术语出发。这些术语并不只是 Spring 特有的。不幸地是，AOP 术语并不符合直觉。然而，如果 Spring 使用它自己的术语，或许会更加令人迷惑。

- Aspect：跨多个 class 的关注点模块化。事务处理是一个在企业级 Java 应用中跨领域关注点的很好例子。在 Spring AOP 中，使用普通的类实现切面（基于 schema 的方式）或者使用带有 @Aspect 注解的普通类实现（@Aspect 风格）
- Join point：在程序的执行过程中的一个点，例如方法的执行或者异常的处理。在 Spring AOP 中，一个 join point 总代表一个方法的执行。
- Advice：在一个特殊的 join point 中被一个 aspect 执行的操作，不同类型的 advice 包括 around，before 和 after。（Advice 的类型会在稍后讨论）。许多 AOP 的框架，包括 Spring，对 advice 建模为一个拦截器，围绕着 join point 维持一个拦截器链路
- Pointcut：匹配 join points 的一个谓词。Advice 和一个 pointcut 表达式联系在一起，并且会在匹配到 pointcut 的任意 join point 执行（例如，一个有特定的名字的方法的执行）。通过 pointcut 表达式匹配的 join points 的概念是 AOP 的核心，Spring 默认使用 AspectJ pointcut 表达式语言。
- introduction：代表一种类型声明其他的方法或者字段。Spring AOP 让你引入对于任何 advised 对象引入新的接口（包含一个相应的实现）。例如，你可以使用一个 introduction 来使一个 bean 实现一个 IsModified 接口，来实现简单的缓存。（在 Aspect 社区里，一个 introduction 被视作一个内部类型声明）
- 目标对象：一个被一个或者多个 aspect advised 的 对象。同样也被视为 advised 对象。因为 Spring AOP 通过使用动态代理实现，这个对象永远是一个代理对象
- AOP 代理：AOP 框架为了实现 aspect 契约而创建的一个对象（advise 方法执行等等）。在 Spring 框架中，一个 AOP 代理就是 JDK 动态代理或者 CGLIB 代理
- 织入：连接 aspect 和其他的应用类型或者对象来创建一个 advised 对象。它可以在编译时（例如使用 AspectJ编译器）、加载期、或者运行时完成。Spring AOP，如其他的纯 Java AOP 框架，在运行时执行织入

Spring AOP 包括下面类型的 advice：
- 事前 advice ：在一个 join point 前执行的 advice，但并没有能力阻止下一个 join point 的执行（除非它抛出异常）
- 事后 advice ：在一个 join point 正常结束后，要运行的 advice（例如，一个没有抛出异常的方法的返回）
- 异常 advice ：如果一个方法异常退出，则运行该 advice
- 最终 advice后： join point 存在无论如何要执行的 advice（正常结束或者异常退出）
- 环绕 advice：在方法调用前后要执行的 advice。这是最强大的一种 advice。环绕 advice 可以在方法执行前后可以执行自定义的行为。它同时要对选择是否执行到下一个 joint point 还是通过正常返回值或者抛出异常来中断执行 advised 方法。

环绕 advice 是最常见的一种 advice。因为 Spring AOP，像 AspectJ 提供了 advice 的所有类型，我们推荐你使用可以实现预期行为的最小 advice 类型。例如，如果你仅仅需要在方法返回值后，更新缓存，你最好使用一个事后 advice 而不是一个环绕 advice，虽然环绕 advice 也可以完成相同的事情。使用最合适的 advice 类型可以提供一种简单的编程模型，尽可能地减少错误的发生率。例如，你不必要在环绕 advice 里面的 JoinPoint 调用 proceed 方法，因此，你就不会调用失败。

所有的 advice 参数都是静态类型，以便你可以使用 合适类型的 advice 参数，而非 Object 数组。

通过 pointcut 匹配的 join point 的概念是 AOP 的关键，这也是它与仅提供拦截器的老技术不同的地方。Pointcut 可以使 advice 能够更具有针对性，脱离面向对象的继承关系。例如，你可以通过提供一个声明式事务管理来对一系列跨多对象（例如 service 层的所有业务操作）的方法应用一个环绕 advice。

# Spring AOP 的能力和目标



TO BE CONTINUED