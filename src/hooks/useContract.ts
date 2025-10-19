import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useState, useCallback } from 'react';
import { parseEther } from 'viem';
import { useZamaInstance } from './useZamaInstance';
import { useEthersSigner } from './useEthersSigner';

export function useContract() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { instance } = useZamaInstance();
  const signerPromise = useEthersSigner();
  const [loading, setLoading] = useState(false);

  // Create auction with FHE encryption
  const createAuction = useCallback(async (
    title: string,
    description: string,
    imageUrl: string,
    location: string,
    bedrooms: number,
    bathrooms: number,
    squareFeet: number,
    reservePrice: number,
    duration: number
  ) => {
    console.log('🔍 useContract Debug:', {
      address: !!address,
      instance: !!instance,
      signerPromise: !!signerPromise,
      addressValue: address,
      signerType: typeof signerPromise
    });

    if (!address || !instance || !signerPromise) {
      throw new Error(`Missing wallet or encryption service: address=${!!address}, instance=${!!instance}, signer=${!!signerPromise}`);
    }

    setLoading(true);
    try {
      console.log('🚀 Starting FHE auction creation process...');
      console.log('📊 Input parameters:', { title, reservePrice, duration });

      // Create encrypted input
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      
      // Convert reserve price to a smaller value for FHE (price is in millions USD)
      // For FHE, we'll use the price in millions as a simple integer
      const reservePriceInMillions = Math.floor(reservePrice / 1000000000000000000000000); // Convert wei to millions
      console.log('💰 Reserve price in millions USD for FHE:', reservePriceInMillions);
      
      // Ensure the value is within 32-bit limit
      if (reservePriceInMillions > 4294967295) {
        throw new Error('Reserve price too large for FHE encryption. Please use a smaller amount.');
      }
      
      input.add32(BigInt(reservePriceInMillions)); // Reserve price in millions USD
      const encryptedInput = await input.encrypt();

      // Convert handles to proper format (32 bytes)
      const convertToBytes32 = (handle: Uint8Array): string => {
        const hex = `0x${Array.from(handle)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')}`;
        // Ensure exactly 32 bytes (66 characters including 0x)
        if (hex.length < 66) {
          return hex.padEnd(66, '0');
        } else if (hex.length > 66) {
          return hex.substring(0, 66);
        }
        return hex;
      };

      const reservePriceHandle = convertToBytes32(encryptedInput.handles[0]);
      const proof = `0x${Array.from(encryptedInput.inputProof as Uint8Array)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;

      console.log('🔄 Calling contract with FHE encrypted data...');
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createAuction',
        args: [
          title,
          description,
          imageUrl,
          location,
          bedrooms,
          bathrooms,
          squareFeet,
          reservePriceHandle, // FHE encrypted reserve price
          duration,
          proof
        ],
      });

      console.log('✅ Auction creation successful!');
      return result;
    } catch (error) {
      console.error('❌ Error creating auction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address, instance, signerPromise, writeContractAsync]);

  // Place bid with FHE encryption
  const placeBid = useCallback(async (
    auctionId: number,
    bidAmount: number
  ) => {
    if (!address || !instance || !signerPromise) {
      throw new Error('Missing wallet or encryption service');
    }

    setLoading(true);
    try {
      console.log('🚀 Starting FHE bid placement process...');
      console.log('📊 Input parameters:', { auctionId, bidAmount });

      // Create encrypted input
      const input = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      
      // Convert bid amount to a smaller value for FHE (bid amount is in millions USD)
      // For FHE, we'll use the bid amount in millions as a simple integer
      const bidAmountInMillions = Math.floor(bidAmount / 1000000000000000000000000); // Convert wei to millions
      console.log('💰 Bid amount in millions USD for FHE:', bidAmountInMillions);
      
      // Ensure the value is within 32-bit limit
      if (bidAmountInMillions > 4294967295) {
        throw new Error('Bid amount too large for FHE encryption. Please use a smaller amount.');
      }
      
      input.add32(BigInt(bidAmountInMillions)); // Bid amount in millions USD
      input.addAddress(address); // Bidder address
      const encryptedInput = await input.encrypt();

      // Convert handles to proper format (32 bytes)
      const convertToBytes32 = (handle: Uint8Array): string => {
        const hex = `0x${Array.from(handle)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')}`;
        // Ensure exactly 32 bytes (66 characters including 0x)
        if (hex.length < 66) {
          return hex.padEnd(66, '0');
        } else if (hex.length > 66) {
          return hex.substring(0, 66);
        }
        return hex;
      };

      const bidAmountHandle = convertToBytes32(encryptedInput.handles[0]);
      const bidderHandle = convertToBytes32(encryptedInput.handles[1]);
      const proof = `0x${Array.from(encryptedInput.inputProof as Uint8Array)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;

      console.log('🔄 Calling contract with FHE encrypted bid...');
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'placeBid',
        args: [
          auctionId,
          bidAmountHandle, // FHE encrypted bid amount
          bidderHandle,    // FHE encrypted bidder address
          proof            // FHE input proof
        ],
      });

      console.log('✅ Bid placement successful!');
      return result;
    } catch (error) {
      console.error('❌ Error placing bid:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [address, instance, signerPromise, writeContractAsync]);

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

  // FHE Decryption functions
  const decryptAuctionData = useCallback(async (auctionId: number) => {
    if (!instance || !address || !signerPromise) {
      throw new Error('Missing wallet or encryption service');
    }

    try {
      console.log('🔍 Starting FHE auction data decryption...');
      
      // Get encrypted data from contract
      const contract = new (await import('ethers')).Contract(CONTRACT_ADDRESS, CONTRACT_ABI, await signerPromise);
      const encryptedData = await contract.getAuctionEncryptedData(auctionId);
      
      console.log('🔍 Encrypted data from contract:', encryptedData);
      
      // Create keypair for decryption
      const keypair = instance.generateKeypair();
      
      // Prepare handle-contract pairs for decryption
      const handleContractPairs = [
        { handle: encryptedData.reservePrice, contractAddress: CONTRACT_ADDRESS },
        { handle: encryptedData.highestBid, contractAddress: CONTRACT_ADDRESS },
        { handle: encryptedData.highestBidder, contractAddress: CONTRACT_ADDRESS }
      ];
      
      console.log('🔍 Handle-contract pairs:', handleContractPairs);

      // Create EIP712 signature
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      const signer = await signerPromise;
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      // Decrypt the data
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      console.log('🔍 Decryption result:', result);

      return {
        reservePrice: result[encryptedData.reservePrice]?.toString() || '0',
        highestBid: result[encryptedData.highestBid]?.toString() || '0',
        highestBidder: result[encryptedData.highestBidder] || '0x0000000000000000000000000000000000000000',
        bidCount: encryptedData.bidCount?.toString() || '0',
        isActive: encryptedData.isActive,
        isEnded: encryptedData.isEnded,
        title: encryptedData.title,
        description: encryptedData.description,
        imageUrl: encryptedData.imageUrl,
        seller: encryptedData.seller,
        startTime: encryptedData.startTime?.toString() || '0',
        endTime: encryptedData.endTime?.toString() || '0'
      };
    } catch (err) {
      console.error('❌ Error decrypting auction data:', err);
      throw err;
    }
  }, [instance, address, signerPromise]);

  const decryptBidData = useCallback(async (auctionId: number, bidIndex: number) => {
    if (!instance || !address || !signerPromise) {
      throw new Error('Missing wallet or encryption service');
    }

    try {
      console.log('🔍 Starting FHE bid data decryption...');
      
      // Get encrypted bid data from contract
      const contract = new (await import('ethers')).Contract(CONTRACT_ADDRESS, CONTRACT_ABI, await signerPromise);
      const encryptedData = await contract.getBidEncryptedData(auctionId, bidIndex);
      
      console.log('🔍 Encrypted bid data from contract:', encryptedData);
      
      // Create keypair for decryption
      const keypair = instance.generateKeypair();
      
      // Prepare handle-contract pairs for decryption
      const handleContractPairs = [
        { handle: encryptedData.amount, contractAddress: CONTRACT_ADDRESS }
      ];
      
      console.log('🔍 Handle-contract pairs for bid:', handleContractPairs);

      // Create EIP712 signature
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      const signer = await signerPromise;
      const signature = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      // Decrypt the data
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      console.log('🔍 Bid decryption result:', result);

      return {
        bidId: encryptedData.bidId?.toString() || '0',
        amount: result[encryptedData.amount]?.toString() || '0',
        bidder: encryptedData.bidder,
        timestamp: encryptedData.timestamp?.toString() || '0',
        isRevealed: encryptedData.isRevealed
      };
    } catch (err) {
      console.error('❌ Error decrypting bid data:', err);
      throw err;
    }
  }, [instance, address, signerPromise]);

  return {
    createAuction,
    placeBid,
    endAuction,
    decryptAuctionData,
    decryptBidData,
    loading
  };
}
