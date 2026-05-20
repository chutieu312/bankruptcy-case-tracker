package com.strettodemo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BankruptcyTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(BankruptcyTrackerApplication.class, args);
    }
}
