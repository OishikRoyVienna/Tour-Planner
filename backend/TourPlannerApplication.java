package com.tourplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.tourplanner")
public class TourPlannerApplication {

  public static void main(String[] args) {
    SpringApplication.run(TourPlannerApplication.class, args);
  }
}
