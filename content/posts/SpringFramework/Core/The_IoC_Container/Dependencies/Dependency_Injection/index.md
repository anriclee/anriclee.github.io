---
title: "[译] 依赖注入"
date: 2023-09-02T23:12:31+08:00
draft: false
tags:
  - Spring
---

在依赖注入（DI）里，对象通过构造函数参数、工厂方法参数或者在
被工厂方法创建返回的对象中设置的属性定义他们的依赖。然后，容器在创建这些 bean 时，注入依赖。这个过程与 bean 自身使用所需要类的直接构造函数实例化，或者通过 Service Locator 模式来找到所需要的依赖这个过程正好相反。

使用 DI 原则的代码更加干净整洁，并且提供给对象的依赖时，解耦也更加高效。对象并不找他们的依赖也并不知道这些依赖的地址或者类。这样的结果就是，你的类变得更易测试，尤其是当依赖是接口或者抽象的父类时，在单元测试可以对这些依赖进行打桩或者mock他们的实现。

# 基于构造函数的依赖注入

基于构造函数的依赖注入，是通过容器调用构造函数，并且传入若干参数来实现的，每一个参数都代表了一个依赖。调用静态工厂方法并传入特定的参数来构造一个 bean 也是一样的，在本讨论中，对待构造函数的参数和静态方法的参数也是相似的。下面的这里展示了一个之能通过构造函数来进行依赖注入的类：

```Java
public class SimpleMovieLister {

	// the SimpleMovieLister has a dependency on a MovieFinder
	private final MovieFinder movieFinder;

	// a constructor so that the Spring container can inject a MovieFinder
	public SimpleMovieLister(MovieFinder movieFinder) {
		this.movieFinder = movieFinder;
	}

	// business logic that actually uses the injected MovieFinder is omitted...
}

```

注意，对于这个类没有更多特殊的地方。它仅仅是一个POJO，并且对容器特定接口、父类或者注解没有任何依赖。【译者按：没有任何代码侵入性】

## 构造函数参数解析

构造函数参数解析匹配通过参数类型来进行。如果在构造函数参数的 bean 定义中没有歧义，那么在 bean 定义中构造函数参数的顺序，就是当 bean 被实例化时，传给给构造函数参数的顺序。考虑下面的类：

```Java
package x.y;

public class ThingOne {

	public ThingOne(ThingTwo thingTwo, ThingThree thingThree) {
		// ...
	}
}

```

假设 `ThingTwo` 和 `ThingThree` 不是继承关系，并且没有歧义。你不需要指定在 <constructor-arg/> 元素中的顺序或者类型，下面的配置一样会正常起作用。

```XML
<beans>
	<bean id="beanOne" class="x.y.ThingOne">
		<constructor-arg ref="beanTwo"/>
		<constructor-arg ref="beanThree"/>
	</bean>

	<bean id="beanTwo" class="x.y.ThingTwo"/>

	<bean id="beanThree" class="x.y.ThingThree"/>
</beans>

```

当引用另外一个 bean 的时候，类型已知，即可以适配到。当使用一个简单的类型时，例如 `<value>true</value>` ，Spring 不能决定一个 value 的类型，因此不能在没有任何帮助时，适配到具体的类型。考虑下面的类：

```Java
package examples;

public class ExampleBean {

	// Number of years to calculate the Ultimate Answer
	private final int years;

	// The Answer to Life, the Universe, and Everything
	private final String ultimateAnswer;

	public ExampleBean(int years, String ultimateAnswer) {
		this.years = years;
		this.ultimateAnswer = ultimateAnswer;
	}
}
```

在上面的场景中，如果你通过 `type` 属性显式地指定一个构造函数参数类型，容器就可以使用简单的类型匹配，如下面的例子所示：

```XML
<bean id="exampleBean" class="examples.ExampleBean">
	<constructor-arg type="int" value="7500000"/>
	<constructor-arg type="java.lang.String" value="42"/>
</bean>

```

你可以使用 index 属性指定构造函数参数的顺序，如下面的例子所示：

```XML
<bean id="exampleBean" class="examples.ExampleBean">
	<constructor-arg index="0" value="7500000"/>
	<constructor-arg index="1" value="42"/>
</bean>
```

Note: index 从 0 开始。


你也可以使用构造函数参数名来消除歧义，如下面的例子所示：

```XML
<bean id="exampleBean" class="examples.ExampleBean">
	<constructor-arg name="years" value="7500000"/>
	<constructor-arg name="ultimateAnswer" value="42"/>
</bean>

```

需要记住的是，为了开箱即用的效果，你的代码必须在编译时将 debug 标识打开，以便 Spring 可以通过名字从构造器查看参数名。如果你不能或者不想再编译时把 debug 标志打开，你可以使用 @ConstructorProperties JDK 注解对构造函数参数显式地指定名字。下面的例子展示了示例类的样子：

```Java
package examples;

public class ExampleBean {

	// Fields omitted

	@ConstructorProperties({"years", "ultimateAnswer"})
	public ExampleBean(int years, String ultimateAnswer) {
		this.years = years;
		this.ultimateAnswer = ultimateAnswer;
	}
}
```

# 基于 Setter 函数的依赖注入

基于 Setter 的依赖注入，是通过容器在调用无参构造函数或者无参静态工厂方法来实例化 bean 之后，调用 bean 中的 setter 方法来完成的。

下面的例子展示了一个类可以仅通过单纯的 setter 注入完成依赖注入。这个类是传统的 Java。这是一个对具体的接口，基类或者注解没有依赖的 POJO。

```Java
public class SimpleMovieLister {

	// the SimpleMovieLister has a dependency on the MovieFinder
	private MovieFinder movieFinder;

	// a setter method so that the Spring container can inject a MovieFinder
	public void setMovieFinder(MovieFinder movieFinder) {
		this.movieFinder = movieFinder;
	}

	// business logic that actually uses the injected MovieFinder is omitted...
}

```

`ApplicationContext` 支持对其管理的 bean，进行基于构造函数和setter函数的依赖注入。它同样也支持通过构造函数已经注入后，基于 setter 的依赖注入。你用 BeanDefinition 的形式配置了依赖，结合 `PropertyEditor` 实例，将属性值从一种形式转换为另外一种形式，然而，大部分 Spring 的用户不是直接使用这些类（即，代码的方式），而是使用 XML bean 定义，注解组件（即，有 `@Component` 和 `@Controller` 等等装配的类）或者在基于 Java @Configuration 类的 @Bean 方法。这些源在内部被转换成 BeanDefinition 实例，并且被用来加载整个 Spring IoC 容器实例。


> 基于构造函数或者基于 setter 的依赖注入？
>
> 因为你可以混合基于构造函数和基于Setter的依赖注入，对必要的依赖使用构造函数，对可选依赖使用 Setter 方法或者配置方法是一个很好的经验法则。注意，在 setter 方法上使用 @Autowired 注解可以用来使这个属性成为一个必要的依赖；然而，通过构造函数注入，并且在代码中验证参数的有效性是值得考虑的。
>
> Spring 团队通常提倡构造函数的依赖注入，因为这会让你将应用程序的组件实现为不可变对象，并且能够确保必要的依赖是非空的。而且，通过构造函数注入返回的组件是一个完全初始化的状态。一个数量较多参数的构造函数，是一种坏味道，暗示着这个类很可能有诸多的职责，应该需要重构，以更好地解决适当的关注点分离的问题。
>
> 基于 Setter 的注入，应该仅被用于可以被赋予默认值的可选依赖。否则，非空检测，必须在使用依赖的任何地方进行。setter 注入的好处之一是 setter 方法使该类的对象可以在以后重新配置或重新注入。因此，通过 JMX MBean 进行管理是 setter 注入的一个引人注目的用例。
>
> 使用 DI 风格对一些类具有最重要的意义。有时候，当处理你没有源码的第三方类的时候，这是你的选择。例如，如果一个三方类没有暴露任何 setter 方法，构造函数的注入或许会是依赖注入的唯一形式。

# 依赖的解决过程

# 依赖注入的例子

TO BE CONTINUED