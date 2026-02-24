package com.shopease.productservice.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.shopease.productservice.service..*(..)) || execution(* com.shopease.productservice.web.controller..*(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringTypeName();
        String methodName = joinPoint.getSignature().getName();

        log.info("Entering {}.{} with args: {}", className, methodName, joinPoint.getArgs());

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        Object result;
        try {
            result = joinPoint.proceed();
        } catch (Throwable e) {
            log.error("Exception in {}.{}: {}", className, methodName, e.getMessage());
            throw e;
        }

        stopWatch.stop();
        long executionTime = stopWatch.getTotalTimeMillis();

        log.info("Exiting {}.{} - Execution time: {} ms", className, methodName, executionTime);

        if (executionTime > 1000) {
            log.warn("SLOW EXECUTION: {}.{} took {} ms", className, methodName, executionTime);
        }

        return result;
    }
}
