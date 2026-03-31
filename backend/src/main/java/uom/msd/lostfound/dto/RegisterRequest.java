package uom.msd.lostfound.dto;

public class RegisterRequest {
    private final String email;
    private final String password;

    public RegisterRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // getters
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}