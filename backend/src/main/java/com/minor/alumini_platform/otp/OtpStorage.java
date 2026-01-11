package com.minor.alumini_platform.otp;

import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class OtpStorage {

    private final Map<String, OtpData> otpMap = new HashMap<>();

    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    public void saveOtp(String email, String otp) {
        long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 minutes
        otpMap.put(email, new OtpData(otp, expiryTime));
    }

    public boolean validateOtp(String email, String otp) {
        OtpData data = otpMap.get(email);
        if (data == null) return false;
        
        if (System.currentTimeMillis() > data.expiryTime) {
            otpMap.remove(email);
            return false;
        }
        
        return otp.equals(data.otp);
    }

    public void clearOtp(String email) {
        otpMap.remove(email);
    }
}

