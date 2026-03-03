package com.shopease.productservice.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

        @Bean
        public RedisCacheConfiguration cacheConfiguration() {
                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

                // Add support for Spring Data Page serialization
                mapper.addMixIn(org.springframework.data.domain.PageImpl.class, PageImplMixin.class);

                // Required for polymorphic type handling (e.g. PageImpl)
                mapper.activateDefaultTyping(
                                com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator.instance,
                                ObjectMapper.DefaultTyping.NON_FINAL,
                                com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY);

                return RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofHours(1))
                                .disableCachingNullValues()
                                .serializeValuesWith(RedisSerializationContext.SerializationPair
                                                .fromSerializer(new GenericJackson2JsonRedisSerializer(mapper)));
        }

        @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
        abstract static class PageImplMixin<T> {
                @com.fasterxml.jackson.annotation.JsonCreator
                PageImplMixin(@com.fasterxml.jackson.annotation.JsonProperty("content") java.util.List<T> content,
                                @com.fasterxml.jackson.annotation.JsonProperty("number") int number,
                                @com.fasterxml.jackson.annotation.JsonProperty("size") int size,
                                @com.fasterxml.jackson.annotation.JsonProperty("totalElements") long totalElements) {
                }
        }
}
