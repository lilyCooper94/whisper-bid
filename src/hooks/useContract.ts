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
      
      // For FHE, we need to convert decimal millions to integer for BigInt
      // Multiply by 100 to convert 2.85M to 285 (representing 2.85M)
      const reservePriceInteger = Math.floor(reservePrice * 100);
      console.log('💰 Reserve price in millions USD for FHE:', reservePrice);
      console.log('🔢 Reserve price as integer for FHE:', reservePriceInteger);
      
      // Ensure the value is within 32-bit limit
      if (reservePriceInteger > 4294967295) {
        throw new Error('Reserve price too large for FHE encryption. Please use a smaller amount.');
      }
      
      input.add32(BigInt(reservePriceInteger)); // Reserve price as integer (e.g., 2.85M -> 285)
      const encryptedInput = await input.encrypt();

      // Convert handles to proper format (32 bytes)
      const convertToBytes32 = (handle: Uint8Array): string => {
        const hex = `0x${Array.from(handle)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')}`;
        // Ensure exactly 32 bytes (66 characters including 0x)
        // Pad with zeros to make it exactly 32 bytes
        return hex.padEnd(66, '0');
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
      
      // For FHE, we need to convert decimal millions to integer for BigInt
      // Multiply by 100 to convert 3.5M to 350 (representing 3.50M)
      const bidAmountInteger = Math.floor(bidAmount * 100);
      console.log('💰 Bid amount in millions USD for FHE:', bidAmount);
      console.log('🔢 Bid amount as integer for FHE:', bidAmountInteger);
      
      // Ensure the value is within 32-bit limit
      if (bidAmountInteger > 4294967295) {
        throw new Error('Bid amount too large for FHE encryption. Please use a smaller amount.');
      }
      
      input.add32(BigInt(bidAmountInteger)); // Bid amount as integer (e.g., 3.5M -> 350)
      const encryptedInput = await input.encrypt();

      // Convert handles to proper format (32 bytes)
      const convertToBytes32 = (handle: Uint8Array): string => {
        const hex = `0x${Array.from(handle)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')}`;
        // Ensure exactly 32 bytes (66 characters including 0x)
        // Pad with zeros to make it exactly 32 bytes
        return hex.padEnd(66, '0');
      };

      const bidAmountHandle = convertToBytes32(encryptedInput.handles[0]);
      const proof = `0x${Array.from(encryptedInput.inputProof as Uint8Array)
        .map(b => b.toString(16).padStart(2, '0')).join('')}`;

      console.log('🔍 FHE Handle Debug Info:');
      console.log('📊 Bid amount handle:', bidAmountHandle, 'Length:', (bidAmountHandle.length - 2) / 2, 'bytes');
      console.log('📊 Proof length:', (proof.length - 2) / 2, 'bytes');

      console.log('🔄 Calling contract with FHE encrypted bid...');
      const result = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'placeBid',
        args: [
          auctionId,
          bidAmountHandle, // FHE encrypted bid amount
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

      // Convert integer values back to decimal millions USD
      const reservePriceDecimal = result[encryptedData.reservePrice] ? 
        (Number(result[encryptedData.reservePrice]) / 100).toString() : '0';
      const highestBidDecimal = result[encryptedData.highestBid] ? 
        (Number(result[encryptedData.highestBid]) / 100).toString() : '0';

      return {
        reservePrice: reservePriceDecimal,
        highestBid: highestBidDecimal,
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

      // Convert integer amount back to decimal millions USD
      const amountDecimal = result[encryptedData.amount] ? 
        (Number(result[encryptedData.amount]) / 100).toString() : '0';

      return {
        bidId: encryptedData.bidId?.toString() || '0',
        amount: amountDecimal,
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
