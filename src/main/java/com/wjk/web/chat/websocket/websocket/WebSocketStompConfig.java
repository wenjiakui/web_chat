package com.wjk.web.chat.websocket.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketStompConfig implements WebSocketMessageBrokerConfigurer {

    /**
     *
     * 注册连接端点
     * @param registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册一个名为/chat-websocket的endpoint，用于建立stomp连接
        registry.addEndpoint("/chat-websocket").setAllowedOrigins("*").withSockJS();
    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        //添加一个/queue ，一个/topic 消息代理
        registry.enableSimpleBroker("/queue","/topic");
        //设置消息应用的前缀
        registry.setApplicationDestinationPrefixes("/app");
    }


}
