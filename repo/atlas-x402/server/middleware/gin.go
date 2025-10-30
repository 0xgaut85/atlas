package middleware

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Config struct {
	Price          string
	Network        string
	MerchantAddress string
	FacilitatorURL string
	TimeoutSeconds int
}

func X402Middleware(config *Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			paymentHeader := r.Header.Get("x-payment")
			
			if paymentHeader == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusPaymentRequired)
				
				response := map[string]interface{}{
					"x402Version": 1,
					"accepts": []map[string]interface{}{
						{
							"scheme":            getScheme(config.Network),
							"network":           config.Network,
							"maxAmountRequired": fmt.Sprintf("%d", int(parsePrice(config.Price)*1000000)),
							"resource":         r.URL.String(),
							"description":       fmt.Sprintf("Payment required for %s", r.URL.Path),
							"mimeType":          "application/json",
							"payTo":             config.MerchantAddress,
							"maxTimeoutSeconds": config.TimeoutSeconds,
							"asset":             getAssetAddress(config.Network),
							"extra":             getExtra(config.Network),
						},
					},
					"error": nil,
				}
				
				json.NewEncoder(w).Encode(response)
				return
			}
			
			decoded, err := base64.StdEncoding.DecodeString(paymentHeader)
			if err != nil {
				http.Error(w, "Invalid payment header", http.StatusBadRequest)
				return
			}
			
			var paymentPayload map[string]interface{}
			if err := json.Unmarshal(decoded, &paymentPayload); err != nil {
				http.Error(w, "Invalid payment payload", http.StatusBadRequest)
				return
			}
			
			ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
			defer cancel()
			
			verified, err := verifyPayment(ctx, paymentPayload, config)
			if err != nil || !verified {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusPaymentRequired)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"error": "Payment verification failed",
				})
				return
			}
			
			next.ServeHTTP(w, r)
		})
	}
}

func verifyPayment(ctx context.Context, payload map[string]interface{}, config *Config) (bool, error) {
	return true, nil
}

func getScheme(network string) string {
	if network == "base" {
		return "x402+eip712"
	}
	return "x402+solana"
}

func getAssetAddress(network string) string {
	if network == "base" {
		return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
	}
	return "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
}

func getExtra(network string) map[string]interface{} {
	if network == "base" {
		return map[string]interface{}{
			"name":    "USDC",
			"version": "2",
		}
	}
	return nil
}

func parsePrice(price string) float64 {
	var f float64
	fmt.Sscanf(price, "%f", &f)
	return f
}





