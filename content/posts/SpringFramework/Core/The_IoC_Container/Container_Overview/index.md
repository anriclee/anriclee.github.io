---
title: "[译] 容器概述"
date: 2023-09-02T23:12:31+08:00
draft: false
tags:
  - Spring
---


# 容器概述

`org.springframework.context.ApplicationContext` 接口代表了 Spring IoC 容器，它主要负责通过读取配置文件对 bean 进行实例化、配置和组装。
容器通过读取配置元数据来获知要实例化、配置和组装那些对象。配置的元数据一般为 XML、Java 注解和 Java 代码的形式，它让你能够表达组成你应用程序的对象以及对象之间的丰富的相互依赖关系。

Spring 提供了 `ApplicationContext` 接口的若干实现。在单体应用中，创建一个 `ClassPathXmlApplicationContext` 或者 `FileSystemXmlApplicationContext` 是很常见的。虽然 XML 是定义配置元数据的传统形式，但是你还可以通过在 XML 文件里面进行声明配置来告诉容器对于 Java 注解或者Java代码格式的支持。


在大多数的应用场景中，并不需要显式的代码来实例化 Spring IoC 容器。例如，在 Web 应用的场景中，在 `web.xml` 文件中仅用简单的 8 行代码左右的样板 Web XML 描述符即可满足需要（参考 [Convenient ApplicationContext Instantiation for Web Applications](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-create)）。如果你使 Eclipse 中的 Spring 工具（在 Eclipse 开发环境中），你可以通过几下鼠标点击或者按键的敲击就能轻松创建这样一个样板配置文件。

下图展示了关于 Spring 工作机制的一个全局视角。在 `ApplicationContext` 被创建和初始化后，你的应用类和配置元数据已经捆绑在一起了，这样一来，你就有一个充分配置并且可执行的系统或者应用程序。

![Spring](imgs/ioc.png)

# 配置元数据

如上图所示，Spring Ioc 容器接收到一种格式的配置元数据。这个配置元数据代表了，作为一个应用开发者你告诉 Spring 容器在应用程序中，如何实例化、配置和组装对象。

传统的配置元数据是一种简单并且符合直觉的 XML 形式，在本章的大部分地方，也用此来表达关键的概念和 Spring IoC 容器的特性。

> 基于 XML 的元数据不是配置元数据的唯一允许的形式。Spring IoC 容器自身与配置元数据实际上是什么格式完全解耦。目前许多开发者在应用程序中选择[基于Java 的配置](https://docs.spring.io/spring-framework/reference/core/beans/java.html)。

在 Spring 容器中使用其他格式的配置元数据，可参考：

 - [基于注解的配置](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config.html)：通过基于注解的配置元数据定义 beans
 - [基于Java的配置](https://docs.spring.io/spring-framework/reference/core/beans/java.html)：通过使用 Java 而不是 XML 文件来定义你应用类之外的 beans。使用这些特性可以参考 [@Configuration](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/Configuration.html), [@Bean](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/Bean.html), [@Import](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/Import.html), [@DependsOn](https://docs.spring.io/spring-framework/docs/6.0.11/javadoc-api/org/springframework/context/annotation/DependsOn.html) 注解。

 
Spring 的配置由至少一个，通常为1个以上容器可以操作的 bean 组成。基于 XML 的配置元数据，配置顶部根元素 <beans/> 里面的 <bean/> 元素。Java 配置通常在一个 @Configuration 类里面使用 @Bean 注解方法。

这些 bean 的定义与组成你应用的实际对象相对应。通常地，你需要定义服务层对象，持久化层对象例如仓库或者数据接入对象（DAOs），例如 Web Controller 的表现层对象，例如一个 JPA EntityManagerFactory 的基础层对象，JMS 队列等等。通常不在容器里面对一个领域层对象进行精细化配置，因为创建和加载领域对象，通常是存储层和业务层的逻辑。

下面的例子，展示了基于 XML 的配置元数据的基本结构：

```XML
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="..." class="..."> [1][2]
		<!-- collaborators and configuration for this bean go here -->
	</bean>

	<bean id="..." class="...">
		<!-- collaborators and configuration for this bean go here -->
	</bean>

	<!-- more bean definitions go here -->

</beans>
```

[1]：id 属性唯一标识一个独立的 bean 定义
[2]：class 属性定义了 bean的类型，并且使用类的全限定名

id 属性的值可以被用来引用互相协作的对象。引用协作的对象的 XML并不在此例中，参考[依赖](https://docs.spring.io/spring-framework/reference/core/beans/dependencies.html)部分获取更多的信息。

# 初始化一个容器

提供给 `ApplicationContext` 构造器的位置路径是一些表示资源的字符串，这些字符串可以让容器从各种外部资源加载配置元数据，例如本地文件系统，Java 类路径等等。

```Java
ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");
```

在你了解了 Spring 的 IoC 容器后，你也许想对 Spring 的“资源：抽象了解更多，这提供了一种方便的从 URI 语法标识中读取输入流的机制。特别是 Resource 路径用于构建应用的上下文。

下面的例子展示了服务层的对象(services.xml)的配置文件：


```XML
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<!-- services -->

	<bean id="petStore" class="org.springframework.samples.jpetstore.services.PetStoreServiceImpl">
		<property name="accountDao" ref="accountDao"/>
		<property name="itemDao" ref="itemDao"/>
		<!-- additional collaborators and configuration for this bean go here -->
	</bean>

	<!-- more bean definitions for services go here -->

</beans>

```

下面的例子展示了数据接入层(daos.xml)文件：

```XML
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
		https://www.springframework.org/schema/beans/spring-beans.xsd">

	<bean id="accountDao"
		class="org.springframework.samples.jpetstore.dao.jpa.JpaAccountDao">
		<!-- additional collaborators and configuration for this bean go here -->
	</bean>

	<bean id="itemDao" class="org.springframework.samples.jpetstore.dao.jpa.JpaItemDao">
		<!-- additional collaborators and configuration for this bean go here -->
	</bean>

	<!-- more bean definitions for data access objects go here -->

</beans>

```

在上面的例子中，服务层由 `PetStoreServiceImpl` 类和两种类型分别为 `JpaAccountDao` 和 `JpaItemDao`(基于JPA对象关系映射标准) 的数据接入对象。`property name` 元素引用 JavaBean 属性的名字，`ref` 元素引用另外一个 bean 定义的名字。`id` 和 `ref` 元素之间的联系，表达了两个互相协作对象之间的依赖关系。想了解更多配置对象依赖的细节，参考 [依赖](https://docs.spring.io/spring-framework/reference/core/beans/dependencies.html)。

TO BE CONTINUED .....