package com.atlas402.foundry.examples;

import com.atlas402.foundry.core.*;

public class CreateToken {
    public static void main(String[] args) {
        AtlasFoundry foundry = new AtlasFoundry("https://facilitator.payai.network");
        
        TokenParams params = new TokenParams(
            "My Service Token",
            "MST",
            "1000000",
            "10.00",
            "base",
            "0x1234567890123456789012345678901234567890"
        );
        
        TokenResult token = foundry.createToken(params).join();
        System.out.println("Token created: " + token.getContractAddress());
    }
}

