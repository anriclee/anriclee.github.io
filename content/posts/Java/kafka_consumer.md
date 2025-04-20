---
title: "一次 Kafka 消费者消费多集群的经历"
date: 2025-04-19T12:22:33+08:00
draft: true
---

Let us imgine a case below:

Kafka consumer consume from multi cluster simutaneously. These two Kafka server cluster(ClusterA and ClusterB) all have the same topic: testA. Once new event of topic "testA" arrive, what will happen next?

Will consumer consume event from topic "testA" repeatedly ? Or will consumer consume event from ClusterA , ClusterB ? Or some other things?


