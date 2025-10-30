package utils

import (
	"errors"
	"fmt"
)

func ValidateTokenParams(params map[string]interface{}) error {
	if name, ok := params["name"].(string); !ok || name == "" {
		return errors.New("token name is required")
	}

	if symbol, ok := params["symbol"].(string); !ok || len(symbol) < 2 || len(symbol) > 10 {
		return errors.New("token symbol must be between 2 and 10 characters")
	}

	if supply, ok := params["supply"].(string); !ok {
		return errors.New("supply is required")
	} else {
		var f float64
		if _, err := fmt.Sscanf(supply, "%f", &f); err != nil || f <= 0 {
			return errors.New("supply must be greater than 0")
		}
	}

	if network, ok := params["network"].(string); !ok || (network != "base" && network != "solana-mainnet") {
		return errors.New("network must be base or solana-mainnet")
	}

	return nil
}

func CalculateDeploymentFee(price string, network string) float64 {
	baseFee := 10.0
	var priceValue float64
	fmt.Sscanf(price, "%f", &priceValue)
	return baseFee + priceValue
}




