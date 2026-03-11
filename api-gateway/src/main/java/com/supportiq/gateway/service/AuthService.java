package com.supportiq.gateway.service;

import com.supportiq.gateway.dto.*;
import com.supportiq.gateway.model.User;
import com.supportiq.gateway.repository.UserRepository;
import com.supportiq.gateway.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtTokenProvider tokenProvider,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        user.setLastLogin(ZonedDateTime.now());
        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(),
                user.getRole(), user.getOrganizationId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(token, refreshToken, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole(), user.getOrganizationId());
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Use default organization for demo
        UUID orgId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole() != null ? request.getRole() : "agent");
        user.setOrganizationId(orgId);
        user.setActive(true);

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(),
                user.getRole(), user.getOrganizationId());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(token, refreshToken, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole(), user.getOrganizationId());
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        UUID userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newToken = tokenProvider.generateToken(user.getId(), user.getEmail(),
                user.getRole(), user.getOrganizationId());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(newToken, newRefreshToken, user.getId(), user.getEmail(),
                user.getFullName(), user.getRole(), user.getOrganizationId());
    }

    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());
        response.setOrganizationId(user.getOrganizationId());
        response.setTeamId(user.getTeamId());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setActive(user.isActive());
        return response;
    }
}
