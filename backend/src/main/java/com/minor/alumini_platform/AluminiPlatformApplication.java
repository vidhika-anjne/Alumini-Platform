package com.minor.alumini_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class AluminiPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(AluminiPlatformApplication.class, args);
	}

}
