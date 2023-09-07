---
title: "[译] Bean 概述"
date: 2023-09-02T23:12:31+08:00
draft: false
tags:
  - Spring
---

一个 Sring IoC 容器可以操作一个或者多个 bean。这些 bean 是通过你提供给容器的配置元数据生成的（例如，以 XML 中的 `<bean/>` ）。

在容器内，这些 bean 的定义被表示成 `BeanDefinition` 对象的形式，包含了下面的元数据：

- 包定义的类名：通常是定义的 bean 的真正实现类
- bean 行为配置元素，表明了 bean 在 container 中的行为（scope，生命周期回调等等）。
- 对其他需要的 bean 的引用。这些引用也被称作协作器和依赖。
- 在一个新创建的对象中的其他配置设置 - 例如，池的数量限制或者一个操作连接池 bean 中的连接数量

这些元数据转换为构成这些 bean 定义的一系列属性。下表表示了这些属性值：

|属性|含义|
| ----------- | ----------- |
|Class|正在实例化的bean| 
|Name|bean的名字|
|Scope|Bean的Scope|
|构造函数参数|依赖注入|
|自动装配模式|装配的协作对象|
|懒加载模式|懒加载 Bean|
|初始化方法|初始化回调|
|析构方法|析构回调|

除了包含怎么创建一个特定的 bean 的信息之外， `ApplicationContext` 的实现同样允许在容器外面已经创建好的对象注册到其中（用户创建）。这是通过 `getBeanFactory` 方法获取到 `ApplicationContext` 的 `BeanFactory`，得到 `DefaultListableBeanFactory` 实现来做到的。`DefaultListableBeanFactory` 支持通过调用 `registerSingleton(..)`  和 `registerBeanDefinition(..)` 方法来实现这样的注册。然而，典型的应用程序仅仅使用常规的 bean 定义元数据。

Note：bean 的元数据和手工提供的单例对象，需要被尽可能早地注册，以便容器在自动装配期间和其他内省的步骤中，可以对他们做出合理的推断。尽管覆盖现有的元数据和单例对象在某种程度上可以支持，但是官方并不支持在运行时注册新的 bean，这很可能会导致并发获取的异常，bean 容器中不一致的状态，或者两者都有。


# Bean 命名

每个 bean 都有至少一个标识。这些标识必须在持有 bean 的容器中保持唯一。一个 bean 通常仅有一个标识。然而，如果需要不止一个，额外的可以被认为是别名。

在基于 XML 的配置元数据中，你可以使用 id 属性，name 属性或者两者一起确定唯一的 bean。id 属性让你确定唯一的一个 id。按照习惯，这些名字都由字母或者数字组成，但是他们也可以包含特殊字符。如果你想对这些 bean 引入其他的别名，你也可以通过使用 `,` `;` `空格` 作为分隔符的 name 属性。尽管 id属性已经被定义为 xsd:string 类型，容器中还是bean 的 id 唯一性是由容器强制执行的，而不是通过 XML 解析器。

对一个 bean 提供 name 或者 id 属性并不是必须的。如果你不希望显式地提供 name 或者 id，容器会对这个 bean 生成一个唯一的名字。但是，如果你想通过名字引用这个 bean，通过 ref 元素或者 Service Locator 的模式来找，你必须提供 name 属性。在使用内部的 bean 或者自动装配时，可以不提供 name 属性。

> Bean 名字惯例
>
> 当给一个 bean 命名时，惯例是使用标准 Java 实例中对成员变量名。这也就是 bean 的名字必须以一个小写字母开始，并且是驼峰的形式。这样的例子如：`accountManager`，`accountService`，`userDao`，`loginController` 等等。
>
> 对 bean 命名的一致性，可以使你的配置更易读且易懂。而且，如果你使用 Spring 的 AOP 机制，当通过名字来对一系列 bean 提供一个 bean 是非常有用的。

Note：当在 classpath 下进行 component 扫描时，Spring 会遵循前面描述的规则对没有命名的 component 生成名字：实质上，就是采用一个简单的类名，并且把首字母变为小写。然而，在不止包含一个字母并且首字母和第二个字母都大写的特殊情形下，原来的就会被继续保留。这些规则与 `java.beans.Introspector.decapitalize` 中定义的相同（Spring 把他们用在这里了）。


# 对在 BeanDefinition 之外的 bean 起别名

在 bean 定义自身中个，你可以通过使用 id 属性和在 name 属性中定义任意数量的名字对 bean 提供不止一个名字。这些名字相当于 bean 的别名，在某些情况下比较有用，例如，让应用程序中的每一个 component 都通过使用相对于这个 component 中的特定的 bean 名称来引用一个相同的依赖。

但是，在 bean 实际上被定义的地方里设置所有的别名，并不总是合适的。当这个 bean 在别的地方也定义的时候，有时候需要引入这个 bean 的别名。这在一个配置文件跨越多个子系统的大系统时且每个子系统都有自己的一套 bean 定义时，是非常常见的。在基于 XML 的配置元数据中，你可以使用 `<alias/>` 元素来完成这项任务。下面的例子表示了怎么使用：

```XML
<alias name="fromName" alias="toName"/>
```

在这个例子中，一个叫 `fromName` 的 bean，在使用这个别名定义后，也可以通过 `toName` 来引用到。

例如，对子系统 A 中的配置元数据，可以通过 `subsystemA-dataSource` 引用到 DataSrouce。在子系统 B 中也可以通过使用 `subsystemB-dataSource` 引用到。当构成一个同时使用到这两个子系统的主应用程序时，主应用程序可以通过 `myApp-dataSource` 名字来引用到 DataSource。你可以在配置元数据中增加下面的别名定义，来使所有三个名字引用到相同的对象：


```XML
<alias name="myApp-dataSource" alias="subsystemA-dataSource"/>
<alias name="myApp-dataSource" alias="subsystemB-dataSource"/>
```

现在每一个 component 和主应用都可以通过一个唯一且不与其他 bean 定义冲突的名字引用到dataSource。，但他们都指向同一个 bean。


> Java 配置
>
> 如果你使用 Java 配置，@Bean 注解同样也可以用来提供别名。

# Bean 的实例化

一个 bean 定义本质上就是创建一个或者对个对象的菜谱。当容器被索要 bean 的时候，容器查看这个 bean 的菜谱，使用被 bean 定义封装好的配置元数据来创建一个真正的对象。

如果你使用 XML 配置元数据，你可以在 <bean/> 元素的 class 属性中，指定要实例化对象的类型或者（类名）。这个 class 属性通常是强制的（通常是 BeanDefinition 实例中的 Class 属性）。你可以使用下面两种方法之一来使用 Class 属性：

- 通常，在容器本身直接通过反射调用构造函数创建 bean 的地方，直接指定要被构建的类，在某种程度上相当于在 Java 代码中使用new 操作符

- 通过指定包含创建这个对象静态工厂方法的类，容器调用这个类的静态工厂方法创建 bean，这是一个不太常见的用法。静态工厂方法返回的对象类型也许和此类相同或者完全不同

> 嵌套的类名
>
> 如果你想对一个嵌套类定义配置 bean 定义，你可以使用这个嵌套类的二进制名或者源文件名
>
> 例如，如果在 `com.example` 包里有一个类叫 `SomeThing`，并且这个 `SomeThing` 类有一个叫 `OtherThing` 的静态嵌套类，他们可以通过 `$` 或者 `.` 符号分割，所以 bean 定义中的 `class` 属性值会是：`com.example.SomeThing$OtherThing` 或者 `com.example.SomeThing.OtherThing`.

# 通过构造器实例化

当你通过构造器的方式来创建 bean，所有普通类都可以被使用并且与 Spring 兼容。也就是说，正在被开发的类没必要实现任何特殊的接口或者用一种特殊的方式编码。只需要指定 bean 的类就足够了。然而，根据你为了创建特定 bean 选择的 IoC类型，你也许会需要一个默认（空的）构造器。

Spring IoC 容器几乎可以操作任何你想操作的类。并不仅限于操作真正的 JavaBean。大部分 Spring 的用户更偏爱使用只包含一个无参构造器，合适的 setter 和 getter 建模的 JavaBean。你也可以在你的容器中使用更多的非 bean 风格的类。例如，如果你需要使用一个遗留下来的绝对没有遵循  JavaBean 规范的连接池，Spring 同样操作它。

在下面的基于 XML 配置元数据例子中，你可以指定你的 bean 类：

```XML
<bean id="exampleBean" class="examples.ExampleBean"/>

<bean name="anotherExample" class="examples.ExampleBeanTwo"/>

```






# 通过静态方法实例化


# 通过实例的工厂方法


# 确定一个 bean 的运行时类名





TO BE CONTINUED