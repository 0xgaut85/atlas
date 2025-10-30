package client

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Config struct {
	Network       string
	WalletAddress string
	FacilitatorURL string
	HTTPClient    *http.Client
}

func NewConfig(network, walletAddress string) *Config {
	return &Config{
		Network:       network,
		WalletAddress: walletAddress,
		FacilitatorURL: "https://facilitator.payai.network",
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func X402Fetch(ctx context.Context, url string, config *Config) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := config.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode == http.StatusPaymentRequired {
		var paymentReq struct {
			Accepts []struct {
				Scheme           string `json:"scheme"`
				Network          string `json:"network"`
				MaxAmountRequired string `json:"maxAmountRequired"`
				PayTo            string `json:"payTo"`
			} `json:"accepts"`
		}

		if err := json.NewDecoder(resp.Body).Decode(&paymentReq); err != nil {
			resp.Body.Close()
			return nil, err
		}
		resp.Body.Close()

		if len(paymentReq.Accepts) == 0 {
			return nil, fmt.Errorf("no payment requirements provided")
		}

		requirement := paymentReq.Accepts[0]
		paymentPayload := createPayment(requirement, config)

		paymentJSON, err := json.Marshal(paymentPayload)
		if err != nil {
			return nil, err
		}

		paymentHeader := base64.StdEncoding.EncodeToString(paymentJSON)

		req.Header.Set("x-payment", paymentHeader)
		resp, err = config.HTTPClient.Do(req)
		if err != nil {
			return nil, err
		}
	}

	return resp, nil
}

func createPayment(requirement struct {
	Scheme           string `json:"scheme"`
	Network          string `json:"network"`
	MaxAmountRequired string `json:"maxAmountRequired"`
	PayTo            string `json:"payTo"`
}, config *Config) map[string]interface{} {
	return map[string]interface{}{
		"x402Version": 1,
		"scheme":      requirement.Scheme,
		"network":     requirement.Network,
		"payload": map[string]interface{}{
			"transactionHash": "0x...",
			"amount":          requirement.MaxAmountRequired,
			"currency":        "USDC",
			"payTo":           requirement.PayTo,
		},
	}
}





