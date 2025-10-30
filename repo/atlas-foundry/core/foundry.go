package core

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type TokenParams struct {
	Name          string
	Symbol        string
	Supply        string
	PricePerMint  string
	Network       string
	DeployerAddress string
	Description   string
	Decimals      int
}

type TokenResult struct {
	ContractAddress string
	MintEndpoint    string
	DeploymentTxHash string
	ExplorerLink    string
	Network         string
}

type AtlasFoundry struct {
	facilitatorURL string
	httpClient     *http.Client
}

func New(facilitatorURL string) *AtlasFoundry {
	return &AtlasFoundry{
		facilitatorURL: facilitatorURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (f *AtlasFoundry) CreateToken(ctx context.Context, params *TokenParams) (*TokenResult, error) {
	if params.Network == "base" {
		return f.createERC20Token(ctx, params)
	}
	return f.createSPLToken(ctx, params)
}

func (f *AtlasFoundry) createERC20Token(ctx context.Context, params *TokenParams) (*TokenResult, error) {
	deployment, err := deployERC20(ctx, params)
	if err != nil {
		return nil, err
	}

	mintEndpoint := fmt.Sprintf("/api/token/%s/mint", deployment.ContractAddress)
	
	if err := f.registerWithX402Scan(ctx, mintEndpoint, "base", params.DeployerAddress, params.PricePerMint); err != nil {
		return nil, err
	}

	return &TokenResult{
		ContractAddress: deployment.ContractAddress,
		MintEndpoint:    mintEndpoint,
		DeploymentTxHash: deployment.TxHash,
		ExplorerLink:    fmt.Sprintf("https://basescan.org/tx/%s", deployment.TxHash),
		Network:         "base",
	}, nil
}

func (f *AtlasFoundry) createSPLToken(ctx context.Context, params *TokenParams) (*TokenResult, error) {
	return nil, fmt.Errorf("Solana token deployment not yet implemented")
}

func (f *AtlasFoundry) registerWithX402Scan(ctx context.Context, endpoint, network, merchantAddress, price string) error {
	payload := map[string]interface{}{
		"endpoint":        endpoint,
		"network":         network,
		"merchantAddress": merchantAddress,
		"price":           price,
		"category":        "Tokens",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/discovery/resources", f.facilitatorURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := f.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("registration failed with status %d", resp.StatusCode)
	}

	return nil
}

type DeploymentResult struct {
	ContractAddress string
	TxHash          string
}

func deployERC20(ctx context.Context, params *TokenParams) (*DeploymentResult, error) {
	return nil, fmt.Errorf("ERC20 deployment requires wallet integration")
}





