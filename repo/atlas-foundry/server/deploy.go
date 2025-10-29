package server

import (
	"context"
	"math/big"
)

type DeploymentParams struct {
	Name          string
	Symbol        string
	Supply        *big.Int
	Owner         string
	WalletClient  interface{}
}

type DeploymentResult struct {
	ContractAddress string
	TxHash          string
}

func DeployERC20(ctx context.Context, params *DeploymentParams) (*DeploymentResult, error) {
	return &DeploymentResult{
		ContractAddress: "0x...",
		TxHash:          "0x...",
	}, nil
}

