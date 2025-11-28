// hooks/useContract.ts
"use client"

import { useState, useEffect } from "react"
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi"
import { parseEther, formatEther } from "viem"
import { contractABI, contractAddress } from "@/lib/contract"

export interface ContractData {
  contractBalance: string
  price: string
  owner: `0x${string}` | null
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: `0x${string}` | undefined
  error: Error | null
}

export interface ContractActions {
  pay: (amount: string) => Promise<void>
  setPrice: (newPrice: string) => Promise<void>
  withdraw: () => Promise<void>
}

export const useWillContract = () => {
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)

  // Read price (uint256) from contract
  const { data: rawPrice, refetch: refetchPrice } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "price",
  })

  // Read owner
  const { data: contractOwner, refetch: refetchOwner } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "owner",
  })

  // Read contract balance using wagmi's useBalance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: contractAddress,
  })

  const { writeContractAsync, data: hashResp, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: (hashResp as any)?.hash ?? undefined,
  })

  useEffect(() => {
    if (isConfirmed) {
      // refresh reads when tx is confirmed
      refetchPrice()
      refetchOwner()
      refetchBalance()
    }
  }, [isConfirmed, refetchPrice, refetchOwner, refetchBalance])

  const pay = async (amount: string) => {
    if (!amount) return
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "pay",
        args: [],
        value: parseEther(amount),
      })
    } catch (err) {
      console.error("Error paying:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const setPrice = async (newPrice: string) => {
    if (!newPrice) return
    try {
      setIsLoading(true)
      // Accept newPrice as ETH units string and convert to wei
      const priceWei = BigInt(parseEther(newPrice))
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "setPrice",
        args: [priceWei],
      })
    } catch (err) {
      console.error("Error setting price:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const withdraw = async () => {
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "withdraw",
        args: [],
      })
    } catch (err) {
      console.error("Error withdrawing:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const data: ContractData = {
    contractBalance: balanceData ? formatEther(BigInt(balanceData.value)) : "0",
    price: rawPrice ? formatEther(rawPrice as bigint) : "0",
    owner: contractOwner ? (contractOwner as `0x${string}`) : null,
  }

  const actions: ContractActions = {
    pay,
    setPrice,
    withdraw,
  }

  const state: ContractState = {
    isLoading: isLoading || Boolean((hashResp as any)?.status === "pending"),
    isPending: Boolean((hashResp as any)?.status === "pending"),
    isConfirming,
    isConfirmed,
    hash: (hashResp as any)?.hash,
    error: error ?? null,
  }

  return {
    data,
    actions,
    state,
  }
}

export default useWillContract
