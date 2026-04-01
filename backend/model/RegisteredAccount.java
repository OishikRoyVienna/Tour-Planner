package com.tourplanner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisteredAccount {
  private String firstName;
  private String lastName;
  private String birthday;
  private String email;
  private String username;
  private String password;
}
