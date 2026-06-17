package uom.msd.lostfound.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uom.msd.lostfound.auth.JwtUtil;
import uom.msd.lostfound.dto.AuthResponse;
import uom.msd.lostfound.dto.LoginRequest;
import uom.msd.lostfound.dto.RegisterRequest;
import uom.msd.lostfound.dto.UserResponse;
import uom.msd.lostfound.exceptions.DuplicateUsernameException;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.UserRepository;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsername() != null && !request.getUsername().isEmpty()
                ? request.getUsername()
                : request.getEmail();

        if (identifier == null || identifier.isEmpty()) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user);
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .studentId(user.getStudentId())
                .faculty(user.getFaculty())
                .department(user.getDepartment())
                .yearOfStudy(user.getYearOfStudy())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
        return new AuthResponse(token, userResponse);
    }

    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername();
        String email = request.getEmail();

        if ((username == null || username.isEmpty()) && (email == null || email.isEmpty())) {
            throw new IllegalArgumentException("Username and email cannot both be empty");
        }

        if (username == null || username.isEmpty()) {
            username = email.split("@")[0];
        }

        if (email == null || email.isEmpty()) {
            email = username + "@example.com";
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new DuplicateUsernameException("Email already exists");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            throw new DuplicateUsernameException("Username already exists");
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());
        User user = new User(username, email, passwordHash);
        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser);
        UserResponse userResponse = UserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .phone(savedUser.getPhone())
                .studentId(savedUser.getStudentId())
                .faculty(savedUser.getFaculty())
                .department(savedUser.getDepartment())
                .yearOfStudy(savedUser.getYearOfStudy())
                .profileImageUrl(savedUser.getProfileImageUrl())
                .build();
        return new AuthResponse(token, userResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long id) {
        User user = findUserById(id);
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .studentId(user.getStudentId())
                .faculty(user.getFaculty())
                .department(user.getDepartment())
                .yearOfStudy(user.getYearOfStudy())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    @Transactional(readOnly = true)
    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
}