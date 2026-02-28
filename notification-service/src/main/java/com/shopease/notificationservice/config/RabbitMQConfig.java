package com.shopease.notificationservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "shopease.exchange";
    public static final String REGISTRATION_QUEUE = "registration.queue";
    public static final String PASSWORD_RESET_QUEUE = "passwordreset.queue";
    public static final String ORDER_QUEUE = "order.queue";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue registrationQueue() {
        return new Queue(REGISTRATION_QUEUE, true);
    }

    @Bean
    public Queue passwordResetQueue() {
        return new Queue(PASSWORD_RESET_QUEUE, true);
    }

    @Bean
    public Queue orderQueue() {
        return new Queue(ORDER_QUEUE, true);
    }

    @Bean
    public Binding registrationBinding(Queue registrationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(registrationQueue).to(exchange).with("user.registered");
    }

    @Bean
    public Binding passwordResetBinding(Queue passwordResetQueue, TopicExchange exchange) {
        return BindingBuilder.bind(passwordResetQueue).to(exchange).with("user.passwordreset");
    }

    @Bean
    public Binding orderBinding(Queue orderQueue, TopicExchange exchange) {
        return BindingBuilder.bind(orderQueue).to(exchange).with("order.*");
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
