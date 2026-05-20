package com.strettodemo.auth;

import com.strettodemo.users.User;
import com.strettodemo.users.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = userRepository.findByEmail(req.email()).orElseThrow();
        return ResponseEntity.ok(new TokenResponse(jwtService.generateToken(user), user.getFullName(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().build();
        }
        User user = User.builder()
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .role(User.Role.ATTORNEY)
                .build();
        userRepository.save(user);
        return ResponseEntity.ok(new TokenResponse(jwtService.generateToken(user), user.getFullName(), user.getRole().name()));
    }

    // --- Records (DTOs) ---
    record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password) {}

    record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password,
            @NotBlank String fullName) {}

    record TokenResponse(String token, String fullName, String role) {}
}
