package uom.msd.lostfound.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uom.msd.lostfound.dto.LoginRequest;
import uom.msd.lostfound.dto.LoginResponse;
import uom.msd.lostfound.models.User;
import uom.msd.lostfound.services.AuthService;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request){
        String token = authService.login(request);

        return ResponseEntity.ok(new LoginResponse(token));
    }
}
