package com.studyflow.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendCoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendCoreApplication.class, args);
	}

}
