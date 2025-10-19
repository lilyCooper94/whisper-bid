// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, eaddress, externalEaddress, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract WhisperBidBasic is SepoliaConfig {
    using FHE for *;
    
    struct Auction {
        uint256 auctionId;           // Public ID
        euint32 reservePrice;         // FHE encrypted reserve price
        euint32 highestBid;           // FHE encrypted highest bid
        uint256 bidCount;             // Public bid count
        bool isActive;                // Public status
        bool isEnded;                 // Public status
        string title;                 // Public title
        string description;           // Public description
        string imageUrl;              // Public image URL
        string location;              // Public location (e.g., "Beverly Hills, CA")
        uint8 bedrooms;               // Public bedroom count
        uint8 bathrooms;              // Public bathroom count
        uint32 squareFeet;            // Public square footage
        address seller;               // Public seller address
        uint256 startTime;            // Public start time
        uint256 endTime;              // Public end time
        eaddress highestBidder;       // FHE encrypted highest bidder
    }
    
    struct Bid {
        uint256 bidId;                // Public bid ID
        euint32 amount;               // FHE encrypted bid amount
        address bidder;               // Public bidder address
        uint256 timestamp;            // Public timestamp
        bool isRevealed;              // Public reveal status
    }
    
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bid[]) public auctionBids;
    
    uint256 public auctionCounter;
    uint256 public bidCounter;
    
    address public owner;
    
    // Events
    event AuctionCreated(uint256 indexed auctionId, address indexed seller, string title);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 indexed bidId);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid);
    
    constructor() {
        owner = msg.sender;
    }
    
    function createAuction(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        string memory _location,
        uint8 _bedrooms,
        uint8 _bathrooms,
        uint32 _squareFeet,
        externalEuint32 _reservePrice,
        uint256 _duration,
        bytes calldata _inputProof
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Auction title cannot be empty");
        require(_duration > 0, "Duration must be positive");
        require(_bedrooms > 0, "Bedrooms must be positive");
        require(_bathrooms > 0, "Bathrooms must be positive");
        require(_squareFeet > 0, "Square feet must be positive");
        
        uint256 auctionId = auctionCounter++;
        
        // Convert external encrypted value to internal encrypted value
        euint32 reservePrice = FHE.fromExternal(_reservePrice, _inputProof);
        
        auctions[auctionId] = Auction({
            auctionId: auctionId,
            reservePrice: reservePrice,
            highestBid: FHE.asEuint32(0), // Initialize with encrypted 0
            bidCount: 0,
            isActive: true,
            isEnded: false,
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            location: _location,
            bedrooms: _bedrooms,
            bathrooms: _bathrooms,
            squareFeet: _squareFeet,
            seller: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            highestBidder: FHE.asEaddress(address(0)) // Initialize with encrypted zero address
        });
        
        // Set ACL permissions for universal decryption access
        FHE.allow(auctions[auctionId].reservePrice, address(0));
        FHE.allow(auctions[auctionId].highestBid, address(0));
        FHE.allow(auctions[auctionId].highestBidder, address(0));
        
        emit AuctionCreated(auctionId, msg.sender, _title);
        return auctionId;
    }
    
    function placeBid(
        uint256 auctionId,
        externalEuint32 _bidAmount,
        externalEaddress _bidder,
        bytes calldata _inputProof
    ) public {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        require(auctions[auctionId].isActive, "Auction is not active");
        require(block.timestamp <= auctions[auctionId].endTime, "Auction has ended");
        require(msg.sender != auctions[auctionId].seller, "Seller cannot bid");
        
        uint256 bidId = bidCounter++;
        
        // Convert external encrypted values to internal encrypted values
        euint32 bidAmount = FHE.fromExternal(_bidAmount, _inputProof);
        eaddress bidder = FHE.fromExternal(_bidder, _inputProof);
        
        // Check if bid is higher than current highest bid (FHE comparison)
        ebool isHigher = bidAmount.gt(auctions[auctionId].highestBid);
        
        // Update highest bid if this bid is higher
        auctions[auctionId].highestBid = isHigher.select(bidAmount, auctions[auctionId].highestBid);
        auctions[auctionId].highestBidder = isHigher.select(bidder, auctions[auctionId].highestBidder);
        auctions[auctionId].bidCount++;
        
        // Store the encrypted bid
        auctionBids[auctionId].push(Bid({
            bidId: bidId,
            amount: bidAmount,
            bidder: msg.sender, // Public bidder address for identification
            timestamp: block.timestamp,
            isRevealed: false // Bid amount remains encrypted
        }));
        
        // Set ACL permissions for bid amount decryption
        FHE.allow(bidAmount, address(0));
        
        emit BidPlaced(auctionId, msg.sender, bidId);
    }
    
    function endAuction(uint256 auctionId) public {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        require(auctions[auctionId].isActive, "Auction is not active");
        require(block.timestamp > auctions[auctionId].endTime, "Auction has not ended yet");
        require(msg.sender == auctions[auctionId].seller || msg.sender == owner, "Not authorized");
        
        auctions[auctionId].isActive = false;
        auctions[auctionId].isEnded = true;
        
        emit AuctionEnded(auctionId, auctions[auctionId].highestBidder.decrypt(), auctions[auctionId].highestBid.decrypt());
    }
    
    function getAuctionInfo(uint256 auctionId) public view returns (
        string memory title,
        string memory description,
        string memory imageUrl,
        string memory location,
        uint8 bedrooms,
        uint8 bathrooms,
        uint32 squareFeet,
        uint256 reservePrice,
        uint256 highestBid,
        uint256 bidCount,
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
            auction.location,
            auction.bedrooms,
            auction.bathrooms,
            auction.squareFeet,
            auction.reservePrice.decrypt(), // Decrypt for public view
            auction.highestBid.decrypt(),   // Decrypt for public view
            auction.bidCount,
            auction.isActive,
            auction.isEnded,
            auction.seller,
            auction.highestBidder.decrypt(), // Decrypt for public view
            auction.startTime,
            auction.endTime
        );
    }
    
    function getAuctionBids(uint256 auctionId) public view returns (Bid[] memory) {
        return auctionBids[auctionId];
    }
    
    function getAuctionCount() public view returns (uint256) {
        return auctionCounter;
    }
    
    function getBidCount(uint256 auctionId) public view returns (uint256) {
        return auctionBids[auctionId].length;
    }
    
    function getUserBids(address user) public view returns (uint256[] memory) {
        uint256[] memory userBids = new uint256[](bidCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < auctionCounter; i++) {
            for (uint256 j = 0; j < auctionBids[i].length; j++) {
                if (auctionBids[i][j].bidder == user) {
                    userBids[count] = auctionBids[i][j].bidId;
                    count++;
                }
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userBids[i];
        }
        
        return result;
    }
    
    // FHE Decryption functions - only accessible by the bidder or after auction ends
    function getAuctionEncryptedData(uint256 auctionId) public view returns (
        bytes32 reservePrice,
        bytes32 highestBid,
        bytes32 highestBidder,
        uint256 bidCount,
        bool isActive,
        bool isEnded,
        string memory title,
        string memory description,
        string memory imageUrl,
        string memory location,
        uint8 bedrooms,
        uint8 bathrooms,
        uint32 squareFeet,
        address seller,
        uint256 startTime,
        uint256 endTime
    ) {
        Auction storage auction = auctions[auctionId];
        return (
            auction.reservePrice.getHandle(),
            auction.highestBid.getHandle(),
            auction.highestBidder.getHandle(),
            auction.bidCount,
            auction.isActive,
            auction.isEnded,
            auction.title,
            auction.description,
            auction.imageUrl,
            auction.location,
            auction.bedrooms,
            auction.bathrooms,
            auction.squareFeet,
            auction.seller,
            auction.startTime,
            auction.endTime
        );
    }
    
    function getBidEncryptedData(uint256 auctionId, uint256 bidIndex) public view returns (
        uint256 bidId,
        bytes32 amount,
        address bidder,
        uint256 timestamp,
        bool isRevealed
    ) {
        Bid storage bid = auctionBids[auctionId][bidIndex];
        return (
            bid.bidId,
            bid.amount.getHandle(),
            bid.bidder,
            bid.timestamp,
            bid.isRevealed
        );
    }
    
    // Function to decrypt user's own bid (only accessible by the bidder)
    function decryptMyBid(uint256 auctionId, uint256 bidIndex) public view returns (
        uint256 bidId,
        uint256 amount,
        address bidder,
        uint256 timestamp,
        bool isRevealed
    ) {
        Bid storage bid = auctionBids[auctionId][bidIndex];
        require(bid.bidder == msg.sender, "Only bidder can decrypt their own bid");
        
        return (
            bid.bidId,
            bid.amount.decrypt(),
            bid.bidder,
            bid.timestamp,
            bid.isRevealed
        );
    }
}
