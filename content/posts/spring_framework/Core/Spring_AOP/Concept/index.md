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

Pointcut 决定感兴趣的 join point，因此当 advice 运行时，可以让我们实现控制。Spring AOP 仅支持 Spring bean 中方法执行的 join point，因此你可以认为一个 pointcut 就是 Spring bean 中药执行的方法的匹配。一个 point 声明有两部分：包含名称和任意参数的签名以及一个决定我们对哪些方法执行感兴趣的 pointcut 表达式。在一个 @AspectJ 注解风格的 AOP 中，一个 pointcut 的签名通过普通方法定义的的形式来提供，一个pointcut表达式通过使用 @Pointcut 注解来标明（作为 pointcut 签名方法必须有一个 void 返回类型）。

下面一个例子或许会使 pointcut 的签名和 pointcut 表达式之间的区别更加明显。下面的例子定义了一个叫 anyOldTransfer 的 pointcut，它匹配了所有叫 transfer 的方法的执行。

```Java
@Pointcut("execution(* transfer(..))") // the pointcut expression
private void anyOldTransfer() {} // the pointcut signature
```

组成 pointcut 注解值的表达式是一个普通的 AspectJ 表达式。

## 支持的 pointcut 指示符

Spring AOP 在 pointcut 表达式中支持下面的 AspectJ pointcut 指示符（PCD）：

- execution：匹配方法执行的 join point。当使用 Spring AOP 时，这个是最主要的 PCD
- within：限制匹配具有特定类型的 join point（当使用 Spring AOP 时，在匹配类型内的声明方法的执行）
- this：限制匹配 join point，此时 bean 引用是一个给定类型的实例。
- target：限制连接点的匹配，此时目标对象是一个给定类型的实例
- args：限制匹配 join point，此时参数是给定类型的注解
- @target：限制 join point 的匹配，此时被执行的对象的类有一个给定类型的注解
- @args：限制 join point 的匹配，传递参数的运行类型有给定类型的注解
- @within：限制匹配到有给定注解类型的 join point（使用 Spring AOP 时，具有给定注解类型的方法的执行）
- @annotation：限制匹配 join point （在 Spring AOP 中运行的方法），其主题有一个给定注解


> 其他 pointcut 类型
>
> 完整的 AspectJ pointcut 语言支持额外在 Spring 中不支持的 pointcut 指示符：call, get, set, preinitialization, staticinitialization, initialization, handler, adviceexecution, withincode, cflow, cflowbelow, if, @this, 以及 @withincode. 在 Spring AOP 的 pointcut 表达式中使用这些指示符，会抛出 IllegalArgumentException  异常。
>
> 这套 pointcut 指示符回叙在将来会被 Spring AOP 支持。

因为 Spring AOP 限制了仅对方法执行的 join point 做匹配，前面的关于 pointcut 指示符的定义有了比你在 Aspect 语言指南中更狭义的定义。除此之外，AspectJ 自身也有基于类型的语义，而且，在一个 join point 执行的地方，this 和 target 都指向一个相同的对象：执行方法的对象。Spring AOP 是基于代理的系统，在代理对象本身和其后面所代理的对象之间会有所区分。

Note：因为 Spring AOP 框架的基于代理的本质，根据定义，在目标对象里面的调用不会被拦截。对于 JDK 代理，仅仅调用 public 接口方法可以被拦截。在 CGLIB 中，在代理对象上的 public 和 protected 方法调用可以被拦截（如有必要，甚至包级别可见的方法）。然而，在代理之间的公共交互，应该设计为 public 签名

注意，pointcut 定义一般会匹配到任何被拦截到的方法。如果一个 pointcut 严格意义上是仅为 public，即使在一个 CGLIB 代理场景中，通过代理进行潜在地非 public 的交互，也需要对其进行相应的定义。

如果你的拦截需要包括在目标类中的方法调用甚至构造函数的调用，考虑基于 Spring 驱动的 native Aspect 织入，而非 Spring 的基于代理的 AOP 框架。这形成了一个具有不同特点的不同的 AOP 的使用，所以确保在做决定之前，要对织入比较熟悉。


Spring AOP 同样支持一个额外的叫 bean 的 PCD。这个 PCD 能让你限制 join point 到一个特定的 Spring bean 或者一系列命名的 Spring Bean （当使用通配符）。这个 bean PCD 有下面的形式：

bean(idOrNameOfBean)

idOrNameOfBean 符号可以为任意 Spring bean 的名字。限制的通配符使用 * 符号，如果你建立了一些对 Spring beans 的命名习惯，你可以写一个 bean PCD 表达式来选择他们。这对于其他的 pointcut 指示符也适用，bean PCD 也可以与 &&（与），||（或），!（非） 操作符一起使用。

Note：bean PCD 仅仅在 Spring AOP 中支持，而非 native AspectJ 织入中。它是一种 Spring 独有的对 AspectJ 定义的标准 PCD 的扩展，因此，在 @Aspect 模型中定义的 aspect 不能使用。

bean PCD 在实例级别进行操作（在 Spring bean 命名概念上构建），而非仅在类级别。基于实例的 pointcut 指示符是一个基于 Spring 代理的 AOP 框架与 Spring bean 工厂之间的特殊能力，在此中，通过名字标识具体的 bean 非常自然和直观。

## Pointcut 表达式之间的组合

你可以使用 &&,||,! 组合 pointcut 表达式，你也可以通过名字来引用 pointcut 表达式。下面的例子展示了三种 pointcut 表达式

```Java
package com.xyz;

public class Pointcuts {

	@Pointcut("execution(public * *(..))")
	public void publicMethod() {}

	@Pointcut("within(com.xyz.trading..*)")
	public void inTrading() {}

	@Pointcut("publicMethod() && inTrading()")
	public void tradingOperation() {}
}

```

1. publicMethod 匹配所有的 public 方法的 join point 的执行
2. inTrading 匹配 trading 模块下的方法执行
3. tradingOperation 匹配在 trading 模块下的任意 public 执行

在小的有名字的 pointcuts 的基础上构建更加复杂的 pointcut 表达式，是最佳实践。当通过名字引用 pointcut 时，普通的 Java 可见性规则同样适用（你可以看到同类型里的 private pointcut，继承关系中的 protected pointcut，任何地方的 public pointcuts 等等）。可见性并不影响 pointcut 的匹配。 

## 共享命名的 pointcut 定义

在使用企业级应用时，开发者经常需要引用应用的模块和在若干 aspects 中的特定的操作集合。出于此目的，我们建议定义一个能够包含常用的有名字的 pointcut 表达式专门的类。这样的一个类通常组合了下面的 CommonPointcuts 示例（怎么命名这个类取决于你）。

```Java
package com.xyz;

import org.aspectj.lang.annotation.Pointcut;

public class CommonPointcuts {

	/**
	 * 这是一个在 web 层的 join point，定义在 com.xyz.web 包里面
	 * 或者这个包下面的任何子包
	 */
	@Pointcut("within(com.xyz.web..*)")
	public void inWebLayer() {}

	/**
	 * 这是一个服务层的 join point，如果一个方法定义在 com.xyz.service
	 * 包中或者这个包下面的任意子包
	 */
	@Pointcut("within(com.xyz.service..*)")
	public void inServiceLayer() {}

	/**
	 * 定义在数据接入层的一个 join point，如果方法定义在 com.xyz.dao
	 * 包中或者此包下面的任意子包
	 */
	@Pointcut("within(com.xyz.dao..*)")
	public void inDataAccessLayer() {}

	/**
	 * 一个业务类是在 service 接口上的定义的任意方法的执行。这个定义假设接口都在 service 
	 * 包中，所有的接口实现类都在子包中
	 * 
	 * 如果你通过功能对这些 service 接口分组（例如在 com.xyz.abc.service 包和 com.xyz.def.service 包，那么 pointcut 表达式 "execution(* com.xyz..service.*.*(..))" 就可以使用
	 * 
	 * 作为备选，你可以使用 bean PCD 来写表达式，例如 "bean(*Service)"。（这假设你已经以一个一贯的方式对你的 Spring service beans 命名
	 */
	@Pointcut("execution(* com.xyz..service.*.*(..))")
	public void businessService() {}

	/**
	 * 一个数据接入操作，是定义在 DAO 接口层中的任意方法的执行。这个定义假设接口在 dao 包内，实现类型在子包内
	 */
	@Pointcut("execution(* com.xyz.dao.*.*(..))")
	public void dataAccessOperation() {}

}

```

在任意你需要一个 pointcut 表达式的地方，你可以通过引用一个 class 的全限定名与 @Pointcut 方法名的组合引用定义在这样的类里面的 pointcut。例如，为了使你的服务层是事务的，你可以写下面的引用了 com.xyz.CommonPointcuts.businessService() 中的命名的 pointcut：

```Java
<aop:config>
	<aop:advisor
		pointcut="com.xyz.CommonPointcuts.businessService()"
		advice-ref="tx-advice"/>
</aop:config>

<tx:advice id="tx-advice">
	<tx:attributes>
		<tx:method name="*" propagation="REQUIRED"/>
	</tx:attributes>
</tx:advice>

```


## 例子

Spring AOP 用户很可能使用 execution pointcut 指示符最多。一个 execution 表达式的格式如下：

```
execution(modifiers-pattern?
			ret-type-pattern
			declaring-type-pattern?name-pattern(param-pattern)
			throws-pattern?)
```

除了返回类型模式（在前面代码片段中的 ret-type-pattern）、命名模式、参数模式之外，所有的部分都是可选的。返回类型的模式决定了方法返回的类型必须是什么样才能匹配一个 join point。`*` 是作为返回类型最频繁使用的。它匹配任何返回类型。一个全限定类型名仅仅匹配返回类指定类型的方法。命名模式匹配方法名。你可以使用 `*` 通配符作为一个命名模式的部分或者全部。如果你指定了一个声明类型的模式，请添加一个后缀 `.` 来满足命名模式。参数模式稍微有些复杂：`()` 匹配一个无参方法，`(..)` 匹配有任意参数的方法（包含0个）。`(*)` 匹配有一个任意类型参数的方法。 `(*,String)` 匹配一个接受两个参数的方法。第一个可以为任意类型，第二个必须是一个 String。

下面的例子展示了一些常用的 pointcut 表达式：

- 任意 public 方法的执行

 `execution(public * *(..))`

- 任意以 set 开头作为方法名的方法

`execution(* set*(..))`

- 任意通过 AccountService 接口定义的方法

`execution(* com.xyz.service.AccountService.*(..)) `

- 任意定义在 service 包里的方法的执行

`execution(* com.xyz.service.*.*(..))`

- 定义在 service 包或者其中一个子包的任意方法的执行

`execution(* com.xyz.service..*.*(..))`

- 任意在 service 包里面的 join point（仅在 Spring AOP 中的方法的执行）

`within(com.xyz.service.*)`

- 任意在 service 包里面或者子包里面的 join point（仅在 Spring AOP 方法执行）

`within(com.xyz.service..*)`

- 一个代理实现了 AccountService 接口的 join point（仅在 Spring AOP 中的方法执行）

`this(com.xyz.service.AccountService)`

- 目标对象实现了 AccountService 接口的 join point

`target(com.xyz.service.AccountService)`

- 接受一个参数，并且在运行时传入的时候是可序列化的（仅在 Spring AOP）

`args(java.io.Serializable)`

注意例子中给出的 pointcut 与 `execution(* *(java.io.Serializable))` 不同。如果运行时传入的参数是可序列化的，并且如果方法签名声明了一个可序列化类型，执行版本匹配

- 一个 target 对象有一个 @Transactional 注解的 join point。

`@target(org.springframework.transaction.annotation.Transactional)`

- 目标对象的声明类型有一个 @Transactional 的 join point

`@within(org.springframework.transaction.annotation.Transactional)`

- 执行方法有一个  @Transactional 注解的 join point（仅在 Spring AOP）

`@annotation(org.springframework.transaction.annotation.Transactional)`

- 接受当个参数，且参数的运行时类型有 @Classified 注解的 join point

`@args(com.xyz.security.Classified)`

- 在一个叫 tradeService 的 Spring bean 中的 join point（仅在 Spring AOP 中适用）

`bean(tradeService)`

- 匹配通配符 `*Service` 的 Spring bean 中的 join point

`bean(*Service)`

## 写好 Pointcut

在编译过程中，Aspect 为了优化匹配性能，按顺序处理 pointcut 。检查代码，确定是否每一个匹配指定 pointcut 的 join point 为一个耗时的过程。（动态匹配意味着匹配不能通过静态分析完全确定，且代码中有相应的测试用例来确定在代码运行时是否真有一个匹配）。在第一次遇到 pointcut 声明时，AspectJ 为了匹配过程，会重写为一个优化格式。什么意思呢？简单说，pointcut 被重写为 DNF（Disjunctive Normal Form）而且 pointcut 的组件被排序，以便那些求值代价更小的被优先检测。这意味着你无需关心不同的 pointcut 指示符的性能，可以以任意顺序提供 pointcut 声明。

然而，AspectJ 仅能按照命令行事。为了匹配性能的最大化，你应该考虑你想达到什么效果，并尽可能地在定义时缩小你的匹配空间。当前的指示符本质上可以归为三组：kinded、scoping、contextual。

- kinded 指示符选择一种特殊的 join point：execution、get、set、call、handler
- scoping 指示符从一组 join point 中选择：within、withincode
- contextual 指示符基于上下文进行匹配：this、target、@annotation

一个号的 pointcut 应该至少包括两个类型（kinded和 scoping）。你可以包含 contextual 指示符来基于 join point 上下文匹配或者在使用 advice 时绑定上下文。假设仅有一种指示符或者仅有一个 contextual 指示符可以起作用，但是会由于额外的处理或者分析影响织入性能（时间或者内存大小）。scoping 指示符匹配非常快，使用他们意味着 AspectJ 可以非常快地忽略无需进一步处理的 join point 组。一个好的 pointcut 应该尽可能地址包含一种。

# 声明一个 advice



TO BE CONTINUED