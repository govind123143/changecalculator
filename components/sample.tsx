// components/sample.tsx
"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useWillContract } from "@/hooks/useContract"
import { isAddress } from "viem"

const SampleIntregation = () => {
  const { isConnected, address } = useAccount()
  const [payAmount, setPayAmount] = useState("")
  const [newPrice, setNewPrice] = useState("")

  const { data, actions, state } = useWillContract()

  const handlePay = async () => {
    if (!payAmount) return
    try {
      await actions.pay(payAmount)
      setPayAmount("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleSetPrice = async () => {
    if (!newPrice) return
    try {
      await actions.setPrice(newPrice)
      setNewPrice("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleWithdraw = async () => {
    try {
      await actions.withdraw()
    } catch (err) {
      console.error("Error:", err)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-3">ChangeCalculator Contract</h2>
          <p className="text-muted-foreground">Please connect your wallet to interact with the contract.</p>
        </div>
      </div>
    )
  }

  const isOwner = data.owner && address && data.owner.toLowerCase() === address.toLowerCase()
  const canPay = payAmount !== "" && Number(payAmount) > 0
  const canSetPrice = newPrice !== "" && Number(newPrice) >= 0

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">ChangeCalculator (Pay & Get Change)</h1>
          <p className="text-muted-foreground text-sm mt-1">Interact with the deployed contract on Coston2.</p>
        </div>

        {/* Contract Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Contract Balance</p>
            <p className="text-2xl font-semibold text-foreground">{data.contractBalance} FLR</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Price (per item)</p>
            <p className="text-2xl font-semibold text-foreground">{data.price} FLR</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Contract Owner</p>
            <p className="text-sm font-mono text-foreground break-all">{data.owner ?? "—"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          {/* Pay Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                1
              </span>
              <label className="block text-sm font-medium text-foreground">Pay (send funds)</label>
            </div>
            <input
              type="number"
              placeholder={`Amount (ETH) — send >= price (${data.price})`}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <button
              onClick={handlePay}
              disabled={state.isLoading || state.isPending || !canPay}
              className="mt-3 w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.isLoading || state.isPending ? "Processing..." : "Pay"}
            </button>
          </div>

          {/* Owner Controls */}
          <div className={isOwner ? "opacity-100" : "opacity-60 pointer-events-none"}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isOwner ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                2
              </span>
              <label className="block text-sm font-medium text-foreground">Owner Controls</label>
              {!isOwner && <span className="text-xs text-muted-foreground">(Only contract owner)</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="New price (ETH)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                onClick={handleSetPrice}
                disabled={state.isLoading || state.isPending || !canSetPrice}
                className="w-full px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {state.isLoading || state.isPending ? "Setting..." : "Set Price"}
              </button>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={state.isLoading || state.isPending}
              className="mt-3 w-full px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.isLoading || state.isPending ? "Withdrawing..." : "Withdraw"}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {state.hash && (
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Transaction Hash</p>
            <p className="text-sm font-mono text-foreground break-all mb-3">{state.hash}</p>
            {state.isConfirming && <p className="text-sm text-primary">Waiting for confirmation...</p>}
            {state.isConfirmed && <p className="text-sm text-green-500">Transaction confirmed!</p>}
          </div>
        )}

        {state.error && (
          <div className="mt-6 p-4 bg-card border border-destructive rounded-lg">
            <p className="text-sm text-destructive-foreground">Error: {state.error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SampleIntregation
