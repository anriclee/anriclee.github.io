# 使用 Socket 创建 TCP 服务器


bind
listen

accept

accept 的方法签名如下：

```C
#include <sys/socket.h>
int accept(int sockfd, struct sockaddr *restrict addr, socklen_t *restrict addrlen);

```

> The accept() system call is used with **connection-based** socket types (SOCK_STREAM, SOCK_SEQPACKET).

SOCK_STREAM 代表 TCP 连接方式
SOCK_SEQPACKET 代表 UDP 连接方式

签名中的 sockfd 代表监听的 socket 连接

> It extracts the **first connection request** on the queue of pending connections for the listening socket, `sockfd`, creates a **new connected socket**, and returns a **new file descriptor** referring to that socket.  The newly created socket is not in the listening state.  The original socket sockfd is unaffected by this call.

这段话给出的信息较多：

1. sockfd 是所监听的 `socket` 的文件描述符；
2. 不知道有多少 client 向该 `socket` 发起请求，但是这些请求都会排到该 `socket` 的请求队列中，队列的长度最长可以有多长？？？；
3. accept 方法每次仅从请求队列中取队头进行处理；
4. 处理请求时，会创建一个新的 `socket`，并返回一个指向该 `socket` 的文件描述符；
5. 新创建的这个 `socket` 不在 `listen` 状态
6. 此次 `accept` 调用，不影响原来的 `socket` 的状态













# Reference


1. [https://www.tutorialspoint.com/unix_sockets/socket_server_example.htm](https://www.tutorialspoint.com/unix_sockets/socket_server_example.htm)
2. [https://man7.org/linux/man-pages/man2/accept.2.html](https://man7.org/linux/man-pages/man2/accept.2.html)
3. [https://www.geeksforgeeks.org/tcp-server-client-implementation-in-c/](https://www.geeksforgeeks.org/tcp-server-client-implementation-in-c/)
4. [https://devarea.com/linux-io-multiplexing-select-vs-poll-vs-epoll/#.YtLNMpdBxQJ](https://devarea.com/linux-io-multiplexing-select-vs-poll-vs-epoll/#.YtLNMpdBxQJ)
5. [https://stevens.netmeister.org/631/09-io-multiplexing.pdf](https://stevens.netmeister.org/631/09-io-multiplexing.pdf)
