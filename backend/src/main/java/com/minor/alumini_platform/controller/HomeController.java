package com.minor.alumini_platform.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {

    @GetMapping("/")
    @ResponseBody
    public String home() {
        return "<html>" +
               "<head><title>Alumni Platform</title></head>" +
               "<body style='font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0;'>" +
               "<h1>🎓 Alumni Platform Backend</h1>" +
               "<div style='background: #4CAF50; color: white; padding: 10px; border-radius: 5px; display: inline-block;'>" +
               "✅ Server Running Successfully" +
               "</div>" +
               "<p>Backend API is ready for testing and development!</p>" +
               "<p><small>Frontend available at localhost:3000</small></p>" +
               "</body>" +
               "</html>";
    }

    @GetMapping("/health")
    @ResponseBody
    public String health() {
        return "OK - Alumni Platform Backend is running!";
    }
}