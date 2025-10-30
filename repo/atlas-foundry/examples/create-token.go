package main

import (
	"context"
	"fmt"
	"log"
	
	"github.com/atlas402/foundry/core"
)

func main() {
	ctx := context.Background()
	foundry := core.New("https://facilitator.payai.network")
	
	params := &core.TokenParams{
		Name:          "My Service Token",
		Symbol:        "MST",
		Supply:        "1000000",
		PricePerMint:  "10.00",
		Network:       "base",
		DeployerAddress: "0x1234567890123456789012345678901234567890",
	}
	
	token, err := foundry.CreateToken(ctx, params)
	if err != nil {
		log.Fatal(err)
	}
	
	fmt.Printf("Token created: %s\n", token.ContractAddress)
}





