package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // POST /api/auth/verify - verify JWT and return user info
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("success", false);
            response.put("error", "Invalid token");
            return ResponseEntity.status(401).body(response);
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            response.put("success", false);
            response.put("error", "Invalid token");
            return ResponseEntity.status(401).body(response);
        }

        String email = jwtUtil.extractEmail(token);

        // Find or create user in Users table
        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;
        if (optionalUser.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setCreatedAt(java.time.OffsetDateTime.now());
            userRepository.save(user);
        } else {
            user = optionalUser.get();
        }

        // Get profile if exists
        Optional<Profile> optionalProfile = profileRepository.findByEmail(email);
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        if (optionalProfile.isPresent()) {
            Profile profile = optionalProfile.get();
            userInfo.put("name", profile.getName());
            userInfo.put("age", profile.getAge());
            userInfo.put("height", profile.getHeight());
            userInfo.put("currentweight", profile.getCurrentweight());
            userInfo.put("targetweight", profile.getTargetweight());
            userInfo.put("bodyfat", profile.getBodyfat());
            userInfo.put("level", profile.getLevel());
            userInfo.put("goaltype", profile.getGoaltype());
            userInfo.put("workoutdaysperweek", profile.getWorkoutdaysperweek());
        }

        response.put("success", true);
        response.put("user", userInfo);
        return ResponseEntity.ok(response);
    }

    // PUT /api/auth/profile - update user profile
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body, Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            Map<String, Object> unauthorized = new HashMap<>();
            unauthorized.put("success", false);
            unauthorized.put("error", "Authentication required");
            return ResponseEntity.status(401).body(unauthorized);
        }

        String email = authentication.getName();
        Map<String, Object> response = new HashMap<>();

        Optional<Profile> optionalProfile = profileRepository.findByEmail(email);
        Profile profile;
        if (optionalProfile.isEmpty()) {
            profile = new Profile();
            profile.setEmail(email);
            profile.setCreatedAt(LocalDateTime.now());
        } else {
            profile = optionalProfile.get();
        }

        // Update fields
        if (body.containsKey("name")) profile.setName((String) body.get("name"));
        if (body.containsKey("age")) profile.setAge((Integer) body.get("age"));
        if (body.containsKey("height")) profile.setHeight((Integer) body.get("height"));
        if (body.containsKey("currentweight")) profile.setCurrentweight(((Number) body.get("currentweight")).doubleValue());
        if (body.containsKey("targetweight")) profile.setTargetweight(((Number) body.get("targetweight")).doubleValue());
        if (body.containsKey("bodyfat")) {
            Object bodyFatValue = body.get("bodyfat");
            profile.setBodyfat(bodyFatValue == null ? null : ((Number) bodyFatValue).doubleValue());
        }
        if (body.containsKey("level")) profile.setLevel((String) body.get("level"));
        if (body.containsKey("goaltype")) profile.setGoaltype((String) body.get("goaltype"));
        if (body.containsKey("workoutdaysperweek")) profile.setWorkoutdaysperweek((Integer) body.get("workoutdaysperweek"));

        profile.setUpdatedAt(LocalDateTime.now());
        profileRepository.save(profile);

        response.put("success", true);
        response.put("profile", profile);
        return ResponseEntity.ok(response);
    }
}
