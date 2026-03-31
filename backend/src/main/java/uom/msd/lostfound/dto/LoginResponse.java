package uom.msd.lostfound.dto;

public class LoginResponse {
    private String accessToken;

    public LoginResponse(String accessToken){
        this.accessToken = accessToken;
    }

    public String getAccessToken(){
        return accessToken;
    }
}
