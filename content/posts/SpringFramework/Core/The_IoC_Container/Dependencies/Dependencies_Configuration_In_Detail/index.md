---
title: "[译] 细谈依赖和配置"
date: 2023-09-11T21:12:31+08:00
draft: false
tags:
  - Spring
---

依赖项的详细配置

正如前面所提到的那样，你可以定义 bean 的属性和构造函数参数，去引用其他已经设置好的 bean 或者内联定义的值。
为了达到这个目的，Spring 的基于 XML 配置元数据支持在 <property/> 和 <constructor-arg/> 元素内增加子元素。

# 直接值（基本类型，字符串等等）

<property/> 元素的 value 值，把一个属性值或者构造函数参数定义为一个可读字符串。Spring 的转换服务被用来将这些值从字符串转换为属性或者参数的实际类型。下面的例子展示了可以被设置的多种值：


```XML
<bean id="myDataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
	<!-- results in a setDriverClassName(String) call -->
	<property name="driverClassName" value="com.mysql.jdbc.Driver"/>
	<property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
	<property name="username" value="root"/>
	<property name="password" value="misterkaoli"/>
</bean>

```

下面的例子使用 p-namespace 来让 XML 配置更加简明：

```XML

<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:p="http://www.springframework.org/schema/p"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
	https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="myDataSource" class="org.apache.commons.dbcp.BasicDataSource"
		destroy-method="close"
		p:driverClassName="com.mysql.jdbc.Driver"
		p:url="jdbc:mysql://localhost:3306/mydb"
		p:username="root"
		p:password="misterkaoli"/>

</beans>

```

上面的 XML 更加的简明。然而，类型是在运行时而不是设计时发现的，除非你在创建 bean 定义的时候，用支持自动属性完成的 IDE（例如 Intellij IDEA 或者 Eclipse 的 Spring 工具）。这些辅助都是高度推荐的。
你同样可以配置 `java.util.Properties` 的实例，如下：

```XML
<bean id="mappings"
	class="org.springframework.context.support.PropertySourcesPlaceholderConfigurer">

	<!-- typed as a java.util.Properties -->
	<property name="properties">
		<value>
			jdbc.driver.className=com.mysql.jdbc.Driver
			jdbc.url=jdbc:mysql://localhost:3306/mydb
		</value>
	</property>
</bean>
```
Spring 容器可以通过使用 JavaBeans 的 PropertyEditor 机制，转换 <value/> 元素里面的文本值为一个 java.util.Properties 实例。这是一个不错的捷径，也是为数不多的 Spring 团队偏爱嵌套的 <value/> 元素而非 value 属性的风格的地方。

# idref 元素

idref 元素就是一个简单的传递容器中另外一个 bean 的 id 到 <constructor-arg/> 或者 <property/> 元素中的防止错误的办法。下面的例子展示了如何去使用它：


```XML
<bean id="theTargetBean" class="..."/>

<bean id="theClientBean" class="...">
	<property name="targetName">
		<idref bean="theTargetBean"/>
	</property>
</bean>
```

上面的 bean 定义片段等价于下面的片段：

```XML

<bean id="theTargetBean" class="..." />

<bean id="client" class="...">
	<property name="targetName" value="theTargetBean"/>
</bean>

```

第一种形式优于第二种，因为使用 idref 标签，可以让容器在部署时验证所引用的有名称的 bean 是否真正存在。在第二种变体中，不会验证传给 client bean 中 targetName 属性的值。当 client bean 被真正创建时，才会真正发现这个类型（很有可能是致命错误）。如果 client bean 是一个属性 bean，在容器被部署很长时间后，类型和结果异常才有可能被发现。

Note：idref 元素中的 local 属性在 XSD 4.0 bean 中的属性不再支持，因为它不再对一个普通 bean 引用提供值了。当升级到 4.0 Schema 的时候，需要修改你的当前存在的 idref local 引用为 idref bean。

一个

<idref/> 元素中，

（早从 Spring 2.0 开始）<idref/> 元素配置值的一个常见位置就是 ProxyFactoryBean bean 定义中的 AOP 拦截器配置值。当你指定拦截器名称时，使用 <idref/> 元素可防止你误拼写一个拦截器的 ID。

# 引用其他 bean（协作器）

ref 元素是 <constructor-arg/> 或者 <property/> 定义元素里面的最后一个元素。在这里，你可以将一个 bean 的具体属性设置为对另外一个被容器管理的 bean 的引用。被引用的 bean 是将被设置属性值 bean 的依赖，而且在属性被设置前，根据需要被初始化。（如果协作者是一个单例的 bean，它也许已经被容器初始化了）。所有的引用最终都是另外一个对象的引用。Scope 和验证取决于你通过 bean 或者 parent 属性指定的另外一个对象的 ID 或者名字。

通过 <ref/> 标签的 bean 属性指定目标 bean，是最常见的一种形式，并且允许引用相同容器或者父容器内的任何 bean，不论是否在同一个 XML 文件中。bean 属性的值也许和目标 bean 的id属性相同，或者和目标 bean 的 name 属性的其中一个值相同。下面的例子展示了怎么使用 ref 元素：

```XML
<ref bean="someBean"/>
```

通过 parent 属性指定目标 bean 创建了对当前容器父容器内的一个 bean 的引用。parent 属性的值可以和目标 bean 的 id 属性和 name 属性的其中一个值相同。目标 bean 必须在当前容器的一个父容器中。当你有一个容器的继承结构，并且你想要用和父 bean 一样的名字作为代理包装父容器中的一个现有 bean 的时候，你应该使用这种引用变体。下面的例子展示了如何使用 parent 属性：

```XML
<!-- in the parent context -->
<bean id="accountService" class="com.something.SimpleAccountService">
	<!-- insert dependencies as required here -->
</bean>
```

```XML
<!-- in the child (descendant) context -->
<bean id="accountService" <!-- bean name is the same as the parent bean -->
	class="org.springframework.aop.framework.ProxyFactoryBean">
	<property name="target">
		<ref parent="accountService"/> <!-- notice how we refer to the parent bean -->
	</property>
	<!-- insert other configuration and dependencies as required here -->
</bean>
```

Note：ref 元素中的 local 属性在 XSD 4.0 中的 bean 已经不再支持，因为它不会对一个普通的 bean 引用提供任何值了。升级到 4.0 Schema 时，需要将现有的 ref local 引用改为 ref bean。

# 内部 bean

<property/> 或者 <constructor-arg/> 元素内部的 <bean/> 元素定义了一个内部 bean，如下面的例子所示：

```XML
<bean id="outer" class="...">
	<!-- instead of using a reference to a target bean, simply define the target bean inline -->
	<property name="target">
		<bean class="com.example.Person"> <!-- this is the inner bean -->
			<property name="name" value="Fiona Apple"/>
			<property name="age" value="25"/>
		</bean>
	</property>
</bean>

```
一个内部bean定义不需要定义 ID 和名称。如果指定了，容器也不会用这个值作为标识。容器也会在创建 bean 时忽略 scope 标志，因为内部biean通常是匿名的而且总是与外面的 bean 一起创建。不可能单独只访问内部bean 或者将他们注入到外层嵌套 bean 以外的 bean 中。

在极端情况下，它会从一个自定义的 scope 接收到销毁的回调 —— 例如，对于一个包含在单例 bean 中的 request scope 的内部 bean。内部 bean 实例的创建于它所在的 bean 绑定在一起，但是销毁回调让它参与到 request 范围的生命周期。这不是一个常见的场景。内部 bean 通常仅仅与它所在的 bean 共享一个 scope。

# 集合

<list/>, <set/>, <map/> 和 <props/> 元素分别设置 Java 的集合类型：List，Set，Map 和 Properties。下面的例子显示了该用法：

```XML
<bean id="moreComplexObject" class="example.ComplexObject">
	<!-- results in a setAdminEmails(java.util.Properties) call -->
	<property name="adminEmails">
		<props>
			<prop key="administrator">administrator@example.org</prop>
			<prop key="support">support@example.org</prop>
			<prop key="development">development@example.org</prop>
		</props>
	</property>
	<!-- results in a setSomeList(java.util.List) call -->
	<property name="someList">
		<list>
			<value>a list element followed by a reference</value>
			<ref bean="myDataSource" />
		</list>
	</property>
	<!-- results in a setSomeMap(java.util.Map) call -->
	<property name="someMap">
		<map>
			<entry key="an entry" value="just some string"/>
			<entry key="a ref" value-ref="myDataSource"/>
		</map>
	</property>
	<!-- results in a setSomeSet(java.util.Set) call -->
	<property name="someSet">
		<set>
			<value>just some string</value>
			<ref bean="myDataSource" />
		</set>
	</property>
</bean>
```
map 的 key 或者 value，或者一个设置好的 value，也可以使下面元素的任意一种：

```XML
bean | ref | idref | list | set | map | props | value | null
```

## 集合的并集

Spring 容器同样支持集合的合并。一个应用的开发者可以定义一个父 <list/>, <map/>, <set/>   或者 <props/> 元素或者有一个子的 <list/>, <map/>, <set/>   或者 <props/> 元素，来继承或者覆盖父集合中的元素。即，子集合中的值是父集合和子集合中元素的并集，同时子集合中的元素会覆盖父集合中的元素。

这个合并讨论了父子 bean 的机制。不熟悉父子 bean 定义的读者，也许要在继续往下前读一下相关章节。

下面的例子展示了集合合并的用法：

```XML
<beans>
	<bean id="parent" abstract="true" class="example.ComplexObject">
		<property name="adminEmails">
			<props>
				<prop key="administrator">administrator@example.com</prop>
				<prop key="support">support@example.com</prop>
			</props>
		</property>
	</bean>
	<bean id="child" parent="parent">
		<property name="adminEmails">
			<!-- the merge is specified on the child collection definition -->
			<props merge="true">
				<prop key="sales">sales@example.com</prop>
				<prop key="support">support@example.co.uk</prop>
			</props>
		</property>
	</bean>
<beans>
```
注意子 bean 定义中 adminEmails 属性里<props/>  merge=true 属性的用法。当子bean被容器解析和初始化时，最终的实例会有一个包含合并子集合中 adminEmails 和父集合中的 adminEmails 的 adminEmails 和 Properties 集合。下面的列表会展示最终的结果

```
administrator=administrator@example.com
sales=sales@example.com
support=support@example.co.uk
```

子 Properties 集合中设置的值继承了所有父 <props/> 中的属性值，而且子集合中的 support 值覆盖了父集合中的值。

这个合并的行为同样适用于 <list/>, <map/>, <set/> 类型。在 <list/> 元素的特殊使用中，与 List 集合类型联系的语义（即集合中值的有序性）会一直保持。父集合中的值优先于子集合。在 Map, Set 和 Properties 集合类型中是无序的。因此，容器内部使用的 Map, Set 和 Properties 实现类型中没有有序性的语义生效。

## 集合合并的限制



# 空串或者 Null

# p-namespace 的 XML 简写

# c-namespace 的 XML 简写

# 复合属性名称


TO BE CONTINUED ....