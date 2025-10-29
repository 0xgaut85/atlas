package core

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type PaymentRequirements struct {
	Scheme           string
	Network          string
	MaxAmountRequired string
	Resource         string
	Description      string
	MimeType         string
	PayTo            string
	MaxTimeoutSeconds int
	Asset            string
	Extra            map[string]interface{}
}

type PaymentPayload struct {
	X402Version int
	Scheme      string
	Network     string
	Payload     map[string]interface{}
}

type VerificationResult struct {
	IsValid      bool
	InvalidReason string
}

func VerifyPayment(
	ctx context.Context,
	paymentPayload *PaymentPayload,
	requirements *PaymentRequirements,
	facilitatorURL string,
	rpcURL string,
) (*VerificationResult, error) {
	if facilitatorURL != "" {
		return verifyViaFacilitator(ctx, paymentPayload, requirements, facilitatorURL)
	}

	if requirements.Scheme == "x402+eip712" {
		return verifyEIP712Payment(ctx, paymentPayload, requirements, rpcURL)
	}

	if requirements.Scheme == "x402+solana" {
		return verifySolanaPayment(ctx, paymentPayload, requirements, rpcURL)
	}

	return &VerificationResult{
		IsValid:      false,
		InvalidReason: fmt.Sprintf("Unsupported scheme: %s", requirements.Scheme),
	}, nil
}

func verifyViaFacilitator(
	ctx context.Context,
	paymentPayload *PaymentPayload,
	requirements *PaymentRequirements,
	facilitatorURL string,
) (*VerificationResult, error) {
	payloadJSON, err := json.Marshal(paymentPayload)
	if err != nil {
		return nil, err
	}

	paymentHeader := base64.StdEncoding.EncodeToString(payloadJSON)

	reqBody := map[string]interface{}{
		"x402Version":        1,
		"paymentHeader":      paymentHeader,
		"paymentRequirements": requirements,
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", facilitatorURL+"/verify", bytes.NewBuffer(reqJSON))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result struct {
		IsValid       bool   `json:"isValid"`
		InvalidReason string `json:"invalidReason"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &VerificationResult{
		IsValid:      result.IsValid,
		InvalidReason: result.InvalidReason,
	}, nil
}

func verifyEIP712Payment(
	ctx context.Context,
	paymentPayload *PaymentPayload,
	requirements *PaymentRequirements,
	rpcURL string,
) (*VerificationResult, error) {
	txHash, ok := paymentPayload.Payload["transactionHash"].(string)
	if !ok {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: "Missing transaction hash",
		}, nil
	}

	if rpcURL == "" {
		if requirements.Network == "base" {
			rpcURL = "https://mainnet.base.org"
		} else {
			rpcURL = "https://mainnet.infura.io/v3/..."
		}
	}

	reqBody := map[string]interface{}{
		"jsonrpc": "2.0",
		"method":  "eth_getTransactionReceipt",
		"params":  []string{txHash},
		"id":      1,
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", rpcURL, bytes.NewBuffer(reqJSON))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: err.Error(),
		}, nil
	}
	defer resp.Body.Close()

	var result struct {
		Result struct {
			Status string `json:"status"`
			To     string `json:"to"`
		} `json:"result"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: "Failed to parse RPC response",
		}, nil
	}

	if result.Result.Status != "0x1" {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: "Transaction failed",
		}, nil
	}

	return &VerificationResult{
		IsValid: true,
	}, nil
}

func verifySolanaPayment(
	ctx context.Context,
	paymentPayload *PaymentPayload,
	requirements *PaymentRequirements,
	rpcURL string,
) (*VerificationResult, error) {
	signature, ok := paymentPayload.Payload["signature"].(string)
	if !ok {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: "Missing transaction signature",
		}, nil
	}

	if rpcURL == "" {
		rpcURL = "https://api.mainnet-beta.solana.com"
	}

	reqBody := map[string]interface{}{
		"jsonrpc": "2.0",
		"id":      1,
		"method":  "getTransaction",
		"params":  []interface{}{signature, map[string]interface{}{"encoding": "json"}},
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", rpcURL, bytes.NewBuffer(reqJSON))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: err.Error(),
		}, nil
	}
	defer resp.Body.Close()

	var result struct {
		Result struct {
			Meta struct {
				Err interface{} `json:"err"`
			} `json:"meta"`
		} `json:"result"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: "Failed to parse RPC response",
		}, nil
	}

	if result.Result.Meta.Err != nil {
		return &VerificationResult{
			IsValid:      false,
			InvalidReason: "Transaction failed",
		}, nil
	}

	return &VerificationResult{
		IsValid: true,
	}, nil
}

