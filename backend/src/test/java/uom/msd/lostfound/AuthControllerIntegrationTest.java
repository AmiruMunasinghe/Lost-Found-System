package uom.msd.lostfound;

import com.jayway.jsonpath.JsonPath;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockReset;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.repositories.UserRepository;
import uom.msd.lostfound.services.AuthService;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @SpyBean(reset = MockReset.AFTER)
    private AuthService authService;

    @Value("${app.auth.jwt.secret}")
    private String jwtSecret;

    @Test
    void successfulRegistrationReturnsTokenAndSafeUserPayload() throws Exception {
        String username = uniqueUsername("register_success");
        String password = "supersecure";

        MvcResult result = registerUser(username, password, "user@example.com")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.username").value(username))
                .andExpect(jsonPath("$.user.email").value("user@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist())
                .andExpect(content().string(not(containsString(password))))
                .andReturn();

        User savedUser = userRepository.findByUsername(username).orElseThrow();
        assertThat(savedUser.getPasswordHash()).isNotEqualTo(password);
        assertThat(savedUser.getPasswordHash()).startsWith("$2");
        assertThat(passwordEncoder.matches(password, savedUser.getPasswordHash())).isTrue();

        Claims claims = parseClaims(extractAccessToken(result));
        assertThat(claims.getSubject()).isEqualTo(String.valueOf(savedUser.getId()));
        assertThat(claims.get("username", String.class)).isEqualTo(username);
        assertThat(claims.getExpiration()).isAfter(new Date());
    }

    @Test
    void duplicateUsernameReturnsConflict() throws Exception {
        String username = uniqueUsername("duplicate_user");

        registerUser(username, "supersecure", null)
                .andExpect(status().isCreated());

        registerUser(username, "anothersecure", null)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Username is already taken"))
                .andExpect(jsonPath("$.details").isArray());
    }

    @Test
    void blankRegistrationFieldsReturnValidationError() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": " ",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details", hasItem("username: Username is required")))
                .andExpect(jsonPath("$.details", hasItem("password: Password is required")));
    }

    @Test
    void missingRegistrationFieldsReturnValidationError() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details", hasItem("username: Username is required")))
                .andExpect(jsonPath("$.details", hasItem("password: Password is required")));
    }

    @Test
    void successfulLoginReturnsValidBearerToken() throws Exception {
        String username = uniqueUsername("login_success");
        registerUser(username, "supersecure", null).andExpect(status().isCreated());

        MvcResult result = loginUser(username, "supersecure")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.username").value(username))
                .andReturn();

        Claims claims = parseClaims(extractAccessToken(result));
        assertThat(claims.get("username", String.class)).isEqualTo(username);
    }

    @Test
    void invalidUsernameReturnsUnauthorized() throws Exception {
        loginUser(uniqueUsername("missing_user"), "supersecure")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void invalidPasswordReturnsUnauthorized() throws Exception {
        String username = uniqueUsername("wrong_password");
        registerUser(username, "supersecure", null).andExpect(status().isCreated());

        loginUser(username, "wrongpassword")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void missingLoginCredentialsReturnValidationError() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details", hasItem("username: Username is required")))
                .andExpect(jsonPath("$.details", hasItem("password: Password is required")));
    }

    @Test
    void getCurrentUserSucceedsWithValidToken() throws Exception {
        String username = uniqueUsername("me_success");
        MvcResult registerResult = registerUser(username, "supersecure", "me@example.com")
                .andExpect(status().isCreated())
                .andReturn();

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", bearerToken(extractAccessToken(registerResult))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.email").value("me@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void getCurrentUserFailsWithoutToken() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Authentication is required to access this resource"));
    }

    @Test
    void getCurrentUserFailsWithInvalidToken() throws Exception {
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", bearerToken("not-a-real-jwt")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void getCurrentUserFailsWithExpiredToken() throws Exception {
        String username = uniqueUsername("expired_token");
        User user = userRepository.save(new User(
                username,
                "expired@example.com",
                passwordEncoder.encode("supersecure")
        ));

        String expiredToken = createToken(
                jwtSecret,
                String.valueOf(user.getId()),
                user.getUsername(),
                Date.from(Instant.now().minusSeconds(120)),
                Date.from(Instant.now().minusSeconds(60))
        );

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", bearerToken(expiredToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void protectedRoutesRequireAuthentication() throws Exception {
        mockMvc.perform(post("/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Wallet",
                                  "reportType": "LOST"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicRoutesDoNotRequireAuthentication() throws Exception {
        String username = uniqueUsername("public_login");

        registerUser(username, "supersecure", null)
                .andExpect(status().isCreated());

        loginUser(username, "supersecure")
                .andExpect(status().isOk());
    }

    @Test
    void malformedAuthorizationHeadersAreRejected() throws Exception {
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Token abc.def.ghi"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void tokensSignedWithWrongSecretAreRejected() throws Exception {
        String username = uniqueUsername("wrong_secret");
        User user = userRepository.save(new User(
                username,
                "wrongsecret@example.com",
                passwordEncoder.encode("supersecure")
        ));

        String token = createToken(
                "abcdefghijklmnopqrstuvwxyz123456",
                String.valueOf(user.getId()),
                user.getUsername(),
                new Date(),
                Date.from(Instant.now().plusSeconds(3600))
        );

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", bearerToken(token)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void unexpectedErrorsDoNotLeakSensitiveDetails() throws Exception {
        doThrow(new RuntimeException("database password leaked"))
                .when(authService)
                .login(any());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "safeuser",
                                  "password": "supersecure"
                                }
                                """))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(content().string(not(containsString("database password leaked"))));
    }

    private ResultActions registerUser(String username, String password, String email) throws Exception {
        String emailField = email == null
                ? ""
                : """
                  ,"email":"%s"
                  """.formatted(email);

        return mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "username":"%s",
                          "password":"%s"%s
                        }
                        """.formatted(username, password, emailField)));
    }

    private ResultActions loginUser(String username, String password) throws Exception {
        return mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "username":"%s",
                          "password":"%s"
                        }
                        """.formatted(username, password)));
    }

    private String extractAccessToken(MvcResult result) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String createToken(
            String secret,
            String subject,
            String username,
            Date issuedAt,
            Date expiration
    ) {
        return Jwts.builder()
                .subject(subject)
                .claim("username", username)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)), Jwts.SIG.HS256)
                .compact();
    }

    private String bearerToken(String token) {
        return "Bearer " + token;
    }

    private String uniqueUsername(String prefix) {
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "");
    }
}
