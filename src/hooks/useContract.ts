import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useState, useCallback } from 'react';
import { parseEther } from 'viem';

export function useContract() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [loading, setLoading] = useState(false);

  // Create auction
  const createAuction = useCallback(async (
    title: string,
    description: string,
    imageUrl: string,
    reservePrice: number,
    duration: number
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createAuction',
        args: [
          title,
          description,
          imageUrl,
          parseEther(reservePrice.toString()),
          duration
        ],
      });

      return result;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address, writeContractAsync]);

  // Place bid
  const placeBid = useCallback(async (
    auctionId: number,
    bidAmount: number
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'placeBid',
        args: [auctionId],
        value: parseEther(bidAmount.toString()),
      });

      return result;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address, writeContractAsync]);

  // End auction
  const endAuction = useCallback(async (auctionId: number) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'endAuction',
        args: [auctionId],
      });

      return result;
    } catch (error) {
      console.error('Error ending auction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address, writeContractAsync]);

  return {
    createAuction,
    placeBid,
    endAuction,
    loading
  };
}
