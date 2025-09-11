// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract WhisperBid is SepoliaConfig {
    using FHE for *;
    
    struct Auction {
        euint32 auctionId;
        euint32 reservePrice;
        euint32 highestBid;
        euint32 bidCount;
        bool isActive;
        bool isEnded;
        string title;
        string description;
        string imageUrl;
        address seller;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
    }
    
    struct Bid {
        euint32 bidId;
        euint32 amount;
        address bidder;
        uint256 timestamp;
        bool isRevealed;
    }
    
    struct BidCommitment {
        bytes32 commitment;
        uint256 timestamp;
        address bidder;
    }
    
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bid) public bids;
    mapping(uint256 => mapping(address => BidCommitment)) public bidCommitments;
    mapping(address => euint32) public bidderReputation;
    mapping(address => euint32) public sellerReputation;
    
    uint256 public auctionCounter;
    uint256 public bidCounter;
    
    address public owner;
    address public verifier;
    
    // Events
    event AuctionCreated(uint256 indexed auctionId, address indexed seller, string title);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 indexed bidId);
    event BidRevealed(uint256 indexed auctionId, address indexed bidder, uint32 amount);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint32 winningBid);
    event ReputationUpdated(address indexed user, uint32 reputation);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    function createAuction(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _reservePrice,
        uint256 _duration
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Auction title cannot be empty");
        require(_duration > 0, "Duration must be positive");
        require(_reservePrice > 0, "Reserve price must be positive");
        
        uint256 auctionId = auctionCounter++;
        
        auctions[auctionId] = Auction({
            auctionId: FHE.asEuint32(0), // Will be set properly later
            reservePrice: FHE.asEuint32(0), // Will be set to actual value via FHE operations
            highestBid: FHE.asEuint32(0),
            bidCount: FHE.asEuint32(0),
            isActive: true,
            isEnded: false,
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            seller: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            highestBidder: address(0)
        });
        
        emit AuctionCreated(auctionId, msg.sender, _title);
        return auctionId;
    }
    
    function placeBid(
        uint256 auctionId,
        bytes32 commitment
    ) public returns (uint256) {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        require(auctions[auctionId].isActive, "Auction is not active");
        require(block.timestamp <= auctions[auctionId].endTime, "Auction has ended");
        require(commitment != bytes32(0), "Invalid commitment");
        
        uint256 bidId = bidCounter++;
        
        bidCommitments[auctionId][msg.sender] = BidCommitment({
            commitment: commitment,
            timestamp: block.timestamp,
            bidder: msg.sender
        });
        
        // Update bid count
        auctions[auctionId].bidCount = FHE.add(auctions[auctionId].bidCount, FHE.asEuint32(1));
        
        emit BidPlaced(auctionId, msg.sender, bidId);
        return bidId;
    }
    
    function revealBid(
        uint256 auctionId,
        externalEuint32 amount,
        bytes calldata inputProof,
        uint256 nonce
    ) public {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        require(auctions[auctionId].isActive, "Auction is not active");
        require(block.timestamp <= auctions[auctionId].endTime, "Auction has ended");
        
        BidCommitment storage commitment = bidCommitments[auctionId][msg.sender];
        require(commitment.bidder != address(0), "No bid commitment found");
        require(!bids[bidCounter - 1].isRevealed, "Bid already revealed");
        
        // Verify commitment
        bytes32 expectedCommitment = keccak256(abi.encodePacked(msg.sender, amount, nonce));
        require(commitment.commitment == expectedCommitment, "Invalid bid reveal");
        
        uint256 bidId = bidCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        
        bids[bidId] = Bid({
            bidId: FHE.asEuint32(0), // Will be set properly later
            amount: internalAmount,
            bidder: msg.sender,
            timestamp: block.timestamp,
            isRevealed: true
        });
        
        // Check if this is the highest bid
        ebool isHigher = FHE.gt(internalAmount, auctions[auctionId].highestBid);
        auctions[auctionId].highestBid = FHE.select(isHigher, internalAmount, auctions[auctionId].highestBid);
        
        // Update highest bidder if this is the highest bid
        if (FHE.decrypt(isHigher)) {
            auctions[auctionId].highestBidder = msg.sender;
        }
        
        emit BidRevealed(auctionId, msg.sender, 0); // Amount will be decrypted off-chain
    }
    
    function endAuction(uint256 auctionId) public {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        require(auctions[auctionId].isActive, "Auction is not active");
        require(block.timestamp > auctions[auctionId].endTime, "Auction has not ended yet");
        require(msg.sender == auctions[auctionId].seller || msg.sender == owner, "Not authorized");
        
        auctions[auctionId].isActive = false;
        auctions[auctionId].isEnded = true;
        
        emit AuctionEnded(auctionId, auctions[auctionId].highestBidder, 0); // Amount will be decrypted off-chain
    }
    
    function updateReputation(address user, euint32 reputation) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(user != address(0), "Invalid user address");
        
        // Determine if user is bidder or seller based on context
        if (bids[bidCounter - 1].bidder == user) {
            bidderReputation[user] = reputation;
        } else {
            sellerReputation[user] = reputation;
        }
        
        emit ReputationUpdated(user, 0); // FHE.decrypt(reputation) - will be decrypted off-chain
    }
    
    function getAuctionInfo(uint256 auctionId) public view returns (
        string memory title,
        string memory description,
        string memory imageUrl,
        uint8 reservePrice,
        uint8 highestBid,
        uint8 bidCount,
        bool isActive,
        bool isEnded,
        address seller,
        address highestBidder,
        uint256 startTime,
        uint256 endTime
    ) {
        Auction storage auction = auctions[auctionId];
        return (
            auction.title,
            auction.description,
            auction.imageUrl,
            0, // FHE.decrypt(auction.reservePrice) - will be decrypted off-chain
            0, // FHE.decrypt(auction.highestBid) - will be decrypted off-chain
            0, // FHE.decrypt(auction.bidCount) - will be decrypted off-chain
            auction.isActive,
            auction.isEnded,
            auction.seller,
            auction.highestBidder,
            auction.startTime,
            auction.endTime
        );
    }
    
    function getBidInfo(uint256 bidId) public view returns (
        uint8 amount,
        address bidder,
        uint256 timestamp,
        bool isRevealed
    ) {
        Bid storage bid = bids[bidId];
        return (
            0, // FHE.decrypt(bid.amount) - will be decrypted off-chain
            bid.bidder,
            bid.timestamp,
            bid.isRevealed
        );
    }
    
    function getBidderReputation(address bidder) public view returns (uint8) {
        return 0; // FHE.decrypt(bidderReputation[bidder]) - will be decrypted off-chain
    }
    
    function getSellerReputation(address seller) public view returns (uint8) {
        return 0; // FHE.decrypt(sellerReputation[seller]) - will be decrypted off-chain
    }
    
    function withdrawFunds(uint256 auctionId) public {
        require(auctions[auctionId].seller == msg.sender, "Only seller can withdraw");
        require(auctions[auctionId].isEnded, "Auction must be ended");
        require(auctions[auctionId].highestBidder != address(0), "No winning bid");
        
        // Transfer funds to seller
        // Note: In a real implementation, funds would be transferred based on decrypted amount
        auctions[auctionId].isActive = false;
        
        // For now, we'll transfer a placeholder amount
        // payable(msg.sender).transfer(amount);
    }
    
    function getBidCommitment(uint256 auctionId, address bidder) public view returns (
        bytes32 commitment,
        uint256 timestamp
    ) {
        BidCommitment storage bidCommitment = bidCommitments[auctionId][bidder];
        return (
            bidCommitment.commitment,
            bidCommitment.timestamp
        );
    }
}
