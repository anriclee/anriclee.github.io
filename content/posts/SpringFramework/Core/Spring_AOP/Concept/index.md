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
- Join point：程序执行过程中的一个点，例如方法的执行或者异常的处理。在 Spring AOP 中，一个 Join point 总代表一个方法的执行。
- Advice：Aspect 在一个特殊的 Join point 中要执行的操作，不同类型的 Advice 包括 around（环绕），before（事前） 和 after（事后）。（Advice 的类型会在稍后讨论）。许多 包括 Spring 在内的 AOP 的框架，对 advice 建模为一个拦截器，围绕着 Join point 维持一个拦截器的链路。
- Pointcut：与 Join point 进行匹配的谓词。Advice 总是和一个 Pointcut 表达式联系在一起，并且会在任何匹配到 Pointcut 的 Join point 执行（例如，一个有特定的名字的方法的执行）。通过 Pointcut 表达式匹配的 Join point 的概念是 AOP 的核心，Spring 默认使用 AspectJ pointcut 表达式语言。
- Introduction：代表一种类型声明其他的方法或者字段。Spring AOP 可以让你对任何 advised（被 Advice 的） 对象引入新的接口（包含一个相应的实现）。例如，你可以使用 Introduction 让一个 bean 实现一个 IsModified 接口，以此实现简单的缓存。（在 Aspect 社区里，一个 Introduction 被视作一个类型间的声明）
- 目标对象：被一个或者多个 Aspect 进行 Advice 的对象。同样也被视为 Advice 对象。因为 Spring AOP 通过使用动态代理实现，这个对象永远是一个代理对象。
- AOP 代理：AOP 框架为了实现 Aspect 契约（如 advise 方法执行等等）而创建的一个对象。在 Spring 框架中，一个 AOP 代理就是 JDK 动态代理或者 CGLIB 代理
- Weaving（织入）：连接 Aspect 和其他的应用类型或者对象来创建一个 advised 对象。它可以在编译时（例如使用 AspectJ编译器）、加载时、或者运行时完成。Spring AOP，如其他的纯 Java AOP 框架一样，在运行时执行织入。
【译者按：1. 这些技术术语翻译为中文有点怪，不太合适，与其强行翻译，不如直接用原生的英文术语。】

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

Spring AOP 使用纯 Java 实现。没有特殊编译过程的必要。Spring AOP 不用控制类加载器关系，因此适合使用在 servelet 容器或者应用服务器中。

Spring AOP 当前仅支持方法的 Join point （在 Spring 的 bean 里面的方法的执行添加 advice）。字段拦截没有实现，虽然无需破坏核心的 Spring AOP 接口就可以添加对字段的支持。如果你需要对字段的访问和更新进行 advice，考虑使用例如一种叫 AspectJ 的语言。

Spring 的 AOP 方法和大部分其他的 AOP 框架的不同。它的目标不是为了提供最完备的 AOP 实现（虽然 Spring AOP 是非常强悍的）。它的目标是提供一个 AOP 实现和 Spring IoC 之间更加紧密的整合，以便能够帮助解决企业级应用的一些常见问题。

因此，Spring 框架的 AOP 能力通常与 Spring IoC 容器一起使用。通过使用正常的 bean 定义语法可以对 Aspects 进行配置（尽管这允许强大的自动代理能力）。这是一个不同于其他 AOP 实现的显著不同点。你使用 Spring AOP 不能高效和轻易地做诸如对一个精细的对象（典型地，例如领域对象）进行 advice。AspectJ 在这些场景下是最好的选择。然而，我们的经验是，Spring AOP 提供对企业级 Java 应用大部分问题的非常出色的解决方案，这对 AOP 是一个补充。

Spring AOP 从来不刻意和 AspectJ 进行竞争，来提供一个全面的解决方法。我们相信像 Spring AOP 这样的基于代理的框架和像 AspectJ 的非常成熟的框架都是非常有意义的，他们之间是互补的而不是竞争的。Spring 无缝整合了 Spring AOP、IoC 和 AspectJ，为了让基于 Spring 的应用架构能够使用所有的 AOP。这样的整合不影响 Spring AOP 接口或者 AOP 的 Alliance 接口。Spring AOP 保持向下兼容。对于 Spring AOP 接口的讨论，参考下一章。


Note：Spring 框架的一个核心的原则就是无侵入性。这个观点就是你不应该被强迫引入框架专用的类和接口到你的业务模块或者领域模块。然而，在一些地方，Spring 框架确实给你了选择来引入 Spring 框架专用的依赖到你的代码库。给你这样的选择的理由就是在特定的场景下，或许使用这种方式能够使得代码更易读或者更易编写一些特定功能的代码。然而，Spring 框架（几乎）总是给你选择：你拥有慎重决定选择最适合你的使用场景的自由。

与本章相关的这样一个决定就是选择哪种 AOP 框架（哪种 AOP 风格）。你可以选择 AspectJ，Spring AOP 或者两种都选择。你同样可以选择使用 @AspectJ 的注解风格方法或者 Spring XML 配置风格方法。本章首先选择引入 @Aspect 风格方法，并不是 Spring 团队偏好这种风格。


# AOP 代理

Spring AOP 默认使用标准 JDK 代理来做 AOP 代理。这让任何接口（或者接口集）都能够被代理。

Spring AOP 同样可以使用 CGLIB 代理。代理类而非接口的场景下，这是必须的。默认情况，如果一个业务对象没有实现接口，就会用 CGLIB 。考虑面向接口而非类编程是一个最佳实践，业务类通常会实现一个或者多个业务接口。强制使用 CGLIB 也是可以的，在那些你需要对没有在接口中声明的方法进行 advice 或者你需要以一个具体的类型传递一个代理对象到一个方法的地方（希望这些场景不是很多）。

牢牢把握 Spring AOP 是基于代理这个事实是非常重要的。

# @AspectJ 支持

@AspectJ 指的是一种将带有注解的普通类声明为 aspect 的风格。@AspectJ 风格在 AspectJ 5 中被 AspectJ 项目引入。Spring 使用 AspectJ 提供的库进行 pointcut 解析和匹配，对于同样的注解与 AspectJ 5 的相同。尽管如此，AOP 运行时仍然是纯 Spring AOP，且没有依赖任何 AspectJ 编译器或者织入器。

Note：使用 AspectJ 编译器和织入器来允许完整的 AspectJ 语言，在 [Using AspectJ with Spring Applications.](https://docs.spring.io/spring-framework/reference/core/aop/using-aspectj.html) 进行了讨论。

# 打开 @AspectJ 

为了在 Spring 配置中使用 @AspectJ ，你需要让 Spring 支持基于 @AspectJ 的 AOP 配置和基于是否被那些 Aspect advice 的 bean 做自动代理。通过自动代理，我们的意思是，如果 Spring 决定一个 bean 被一个或者多个 aspect advice，它通常会对那个 bean 来生成一个代理，来拦截方法的执行，在需要的时候，允许 advice 运行。

@AspectJ 支持可以通过 XML 或者 Java 配置来打开。无论哪一种方法，你都需要确保 AspectJ 的 aspectjweaver.jar 库在你应用程序的类路径上。这个库在 AspectJ 的 lib 目录下或者 Maven 中央仓库里面都可以找到。


## 使用 Java 配置打开 @AspectJ

通过 Java @Configuration 支持 @AspectJ，添加 @EnableAspectJAutoProxy  注解。如下面的例子所示：

```Java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {
}

```

## 通过 XML 配置打开 @AspectJ

通过基于 XML 的配置，使能 @AspectJ 的支持，需要使用 aop:aspectj-autoproxy 元素，如下面的例子所示：

```XML
<aop:aspectj-autoproxy/>

```
这假设你使用了 schema 支持。

# 声明一个 Aspect

@AspectJ 支持打开后，在你应用 context 中任何带有 @AspectJ aspect 的 bean 类都会被 Spring 自动检测到，并用来配置 Spring AOP。下面的两个例子，展示了定义一个不是非常有用的 aspect 所必要的最少步骤。

第一个例子展示了在应用 context 里面的一个普通定义，指向了一个带有 @Aspect 注解的 bean 类。

```XML
<bean id="myAspect" class="com.xyz.NotVeryUsefulAspect">
	<!-- configure properties of the aspect here -->
</bean>

```

第二个例子，展示了带有 @Aspect 注解的 NotVeryUsefulAspect  类定义：

```Java
package com.xyz;

import org.aspectj.lang.annotation.Aspect;

@Aspect
public class NotVeryUsefulAspect {
}

```

Aspects（带有 @Aspect 注解的类），可以有方法和字段，和其他类一样。他们也可以包含 pointcut，advice 和 introduction。

Note：你可以在 Spring 的 XML 配置中以普通 bean  的形式注册 aspect 类，通过在 @Configuration 类中使用 @Bean 的方法，或者让 Spring 通过类路径扫描的方式来自动检测 ———— 和其他 Spring 管理的 bean 一样。然而，注意 @Aspect 注解对于类路径的自动检测来讲，是不够的。出于这个目的，你需要增加一个独立的 @Component 注解（或者，作为备选，一个满足让 Spring 可以扫描到的自定义的注解类型）。

Note：在 Spring AOP 中，aspect 不能是其他 Aspect 中 advice 的目标。@Aspect 注解标记这个类是一个 aspect，因此它不会被自动代理。

# 声明一个 Pointcut

TO BE CONTINUED