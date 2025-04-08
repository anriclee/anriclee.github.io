# [译] 依赖注入


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

容器对 bean 的依赖解决过程如下：

- 创建 ApplicationContext 时用描述所有 bean 的配置元数据一起初始化。配置元数据可以通过 XML，Java代码或者注解表达
- 对于每一个 bean，它的依赖是以属性、构造函数参数、或者静态工厂方法（如果你用之代替普通的构造器）的参数的形式来表示的。这些依赖在 bean 被实际上创建后，提供给 bean
- 每个属性或者构造器参数，是一个要设置值得实际上定义，或者容器内对另外一个 bean 的引用
- 作为值的每一个属性或者构造器参数，都被从其指定的格式转换为属性或者构造函数参数实际上的类型。默认，Spring 可以转换一个字符串类型的值为所有的自建类型，例如 int、lang、String、boolean 等等。

Spring 容器在其被创建时，会对所有的bean的配置进行有效性验证。然而，这些 bean 的属性直到 bean 被实际上创建的时候，才会被设置进去。单例类型且设置为预初始化（默认）的 bean，将会在容器创建时被创建。Scopes 时 Bean Scopes 中定义的。其他的 bean，在 bean 被实际请求时创建。创建一个 bean 会潜在的引起依赖图中的 bean 被创建，bean的依赖和依赖的依赖的创建和分配过程亦然。注意，这些依赖之间的解析不匹配可能会较晚出现 - 即，在第一个受影响的 bean 被创建时出现。

> 循环依赖
>
> 如果你主要使用构造器的注入模式，很可能会出现一个无法解决的循环依赖场景。
>
> 例如：类 A 通过构造注入依赖一个类 B 的实例，类 B 通过构造注入依赖一个一个类 A 的实例。如果你配置类 A 和类 B 互相注入，Spring Ioc 容器在运行时检测到循环依赖，即会抛出 BeanCurrentlyInCreationException。
>
> 一个可能的解决办法就是，编辑一些类中的源码，让他们通过 setter 注入而非构造器。也可以选择避免构造器注入，只使用 setter 注入。换句话说，虽然不是很推荐，但是你依赖可以通过 setter 注入配置循环依赖。
>
> 与典型的例子（没有循环依赖）不同，一个bean A 和 bean B 的循环依赖，迫使其中的一个 bean 在自己完全初始化之前注入另外一个优先级更高的 bean（一个典型的鸡生蛋蛋生鸡问题）。

你通常可以相信 Spring 会做正确的事情。它可以在容器加载的时候检测到配置问题，比如引用不存在的 bean 和循环依赖。Spring 会在 bean 被实际上创建后，尽可能晚地设置属性和解决依赖。当你请求一个对象，如果在创建这个对象或者它的依赖有问题时，一个被正确加载的 Spring 容器可以在稍后抛出异常。 —— 例如，bean 会因为属性丢失或者无效引发异常。这些配置问题的延迟出现就是为什么 `ApplicationContext` 的实现默认是预初始化的单例 bean。在 bean 实际需要之前，以前期的时间和内存为代价来创建这些 bean。你会在 ApplicationContext 被创建的时候，发现配置问题。你仍然可以覆盖这个默认的行为，以便单例的 bean 可以被延迟初始化而不是过早的初始化。



如果没有循环依赖存在，当一个或者多个合作的 bean 被注入到一个需要依赖的 bean 时，每一个协作的 bean 会在注入到依赖的 bean 前被完全配置。这意味着，如果 bean A 对 bean B 有依赖，Spring IoC 容器在调用 bean A 的方法之前，将 bean B 完全配置好。换句话说，bean 被实例化后，它的依赖早已被设置好了，它的生命周期方法也早已被调用了。


# 依赖注入的例子

下面的例子使用了基于 XML 的配置元数据，用来做基于 setter 的 DI。Spring XML 配置文件指定了一些 bean 定义如下：

```XML
<bean id="exampleBean" class="examples.ExampleBean">
	<!-- setter injection using the nested ref element -->
	<property name="beanOne">
		<ref bean="anotherExampleBean"/>
	</property>

	<!-- setter injection using the neater ref attribute -->
	<property name="beanTwo" ref="yetAnotherBean"/>
	<property name="integerProperty" value="1"/>
</bean>

<bean id="anotherExampleBean" class="examples.AnotherBean"/>
<bean id="yetAnotherBean" class="examples.YetAnotherBean"/>

```
下面的例子展示了对应的 `ExampleBean`  类：

```Java
public class ExampleBean {

	private AnotherBean beanOne;

	private YetAnotherBean beanTwo;

	private int i;

	public void setBeanOne(AnotherBean beanOne) {
		this.beanOne = beanOne;
	}

	public void setBeanTwo(YetAnotherBean beanTwo) {
		this.beanTwo = beanTwo;
	}

	public void setIntegerProperty(int i) {
		this.i = i;
	}
}

```

在前面的例子中，声明 setter 方法去定义 XML 文件中的属性。下面的例子使用了基于构造函数的 DI：

```XML

<bean id="exampleBean" class="examples.ExampleBean">
	<!-- constructor injection using the nested ref element -->
	<constructor-arg>
		<ref bean="anotherExampleBean"/>
	</constructor-arg>

	<!-- constructor injection using the neater ref attribute -->
	<constructor-arg ref="yetAnotherBean"/>

	<constructor-arg type="int" value="1"/>
</bean>

<bean id="anotherExampleBean" class="examples.AnotherBean"/>
<bean id="yetAnotherBean" class="examples.YetAnotherBean"/>
```


下面的例子展示了对应的 ExampleBean 类：

```Java
public class ExampleBean {

	private AnotherBean beanOne;

	private YetAnotherBean beanTwo;

	private int i;

	public ExampleBean(
		AnotherBean anotherBean, YetAnotherBean yetAnotherBean, int i) {
		this.beanOne = anotherBean;
		this.beanTwo = yetAnotherBean;
		this.i = i;
	}
}
```

bean 定义中指定的构造函数中的参数，被用作 ExampleBean 构造函数中的参数。

现在考虑这个例子的一个变形，而不是使用构造函数。Spring 被告知调用静态工厂方法来返回一个对象的实例。

```XML
<bean id="exampleBean" class="examples.ExampleBean" factory-method="createInstance">
	<constructor-arg ref="anotherExampleBean"/>
	<constructor-arg ref="yetAnotherBean"/>
	<constructor-arg value="1"/>
</bean>

<bean id="anotherExampleBean" class="examples.AnotherBean"/>
<bean id="yetAnotherBean" class="examples.YetAnotherBean"/>

```

下面的例子展示了相应的 ExampleBean 类：

```Java
public class ExampleBean {

	// a private constructor
	private ExampleBean(...) {
		...
	}

	// a static factory method; the arguments to this method can be
	// considered the dependencies of the bean that is returned,
	// regardless of how those arguments are actually used.
	public static ExampleBean createInstance (
		AnotherBean anotherBean, YetAnotherBean yetAnotherBean, int i) {

		ExampleBean eb = new ExampleBean (...);
		// some other operations...
		return eb;
	}
}

```

<constructor-arg/> 元素提供了静态工厂方法中的参数，就如同一个构造函数被实际上使用。工厂方法返回 class 的类型，不一定要和包含静态方法的类是一个类型（尽管在这个例子中相同）。一个实例的非静态工厂方法可以用本质上同样的方式来使用（使用 factory-bean 属性代替 class 属性除外），所以我们在这里就不多赘述了。



[全文完]
