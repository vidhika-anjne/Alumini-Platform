package com.minor.alumini_platform.otp;

import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class OtpStorage {

    private final Map<String, String> otpMap = new HashMap<>(); // email → otp

    public void saveOtp(String email, String otp) {
        otpMap.put(email, otp);
    }

    public boolean validateOtp(String email, String otp) {
        return otp.equals(otpMap.get(email));
    }

    public void clearOtp(String email) {
        otpMap.remove(email);
    }
}

