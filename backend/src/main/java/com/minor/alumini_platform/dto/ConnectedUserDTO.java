package com.minor.alumini_platform.dto;

import com.minor.alumini_platform.enums.UserType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectedUserDTO {
    private String userId;
    private String name;
    private UserType userType;
    private String avatarUrl;
}
