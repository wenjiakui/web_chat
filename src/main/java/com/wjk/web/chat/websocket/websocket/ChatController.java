package com.wjk.web.chat.websocket.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@Controller
@RestController
public class ChatController {
    private static Logger logger = LoggerFactory.getLogger(ChatController.class);
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat")
    public void handleChatMessage(FormateMessage formateMessage, Principal principal) {
        logger.info("收到来自客户端的消息- - - - " + formateMessage.toString());
        simpMessagingTemplate.convertAndSendToUser(
                formateMessage.getReceiver(),//消息接收者
                "/queue/notifications",//消息通道
                formateMessage);//消息内容
    }

}
