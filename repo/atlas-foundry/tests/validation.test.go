package utils

import (
	"testing"
)

func TestValidateTokenParams(t *testing.T) {
	params := map[string]interface{}{
		"name":    "Test Token",
		"symbol":  "TEST",
		"supply":  "1000000",
		"network": "base",
	}

	if err := ValidateTokenParams(params); err != nil {
		t.Errorf("Expected valid params, got error: %v", err)
	}
}

func TestValidateTokenParamsInvalid(t *testing.T) {
	params := map[string]interface{}{
		"name":    "",
		"symbol":  "T",
		"supply":  "0",
		"network": "invalid",
	}

	if err := ValidateTokenParams(params); err == nil {
		t.Error("Expected validation error for invalid params")
	}
}

