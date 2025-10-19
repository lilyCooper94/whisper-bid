// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract WhisperBidSimple {
    struct Auction {
        uint256 auctionId;
        uint256 reservePrice;
        uint256 highestBid;
        uint256 bidCount;
        bool isActive;
        bool isEnded;
        string title;
        string description;
        string imageUrl;
        string location;
        uint8 bedrooms;
        uint8 bathrooms;
        uint32 squareFeet;
        address seller;
        uint256 startTime;
        uint256 endTime;
        address highestBidder;
    }
    
    struct Bid {
        uint256 bidId;
        uint256 amount;
        address bidder;
        uint256 timestamp;
        bool isRevealed;
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
        uint256 _reservePrice,
        uint256 _duration
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Auction title cannot be empty");
        require(_duration > 0, "Duration must be positive");
        require(_bedrooms > 0, "Bedrooms must be positive");
        require(_bathrooms > 0, "Bathrooms must be positive");
        require(_squareFeet > 0, "Square feet must be positive");
        
        uint256 auctionId = auctionCounter++;
        
        auctions[auctionId] = Auction({
            auctionId: auctionId,
            reservePrice: _reservePrice,
            highestBid: 0,
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
            highestBidder: address(0)
        });
        
        emit AuctionCreated(auctionId, msg.sender, _title);
        return auctionId;
    }
    
    function placeBid(uint256 auctionId) public payable {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        require(auctions[auctionId].isActive, "Auction is not active");
        require(block.timestamp <= auctions[auctionId].endTime, "Auction has ended");
        require(msg.sender != auctions[auctionId].seller, "Seller cannot bid");
        require(msg.value > auctions[auctionId].highestBid, "Bid must be higher than current highest");
        require(msg.value >= auctions[auctionId].reservePrice, "Bid must meet reserve price");
        
        uint256 bidId = bidCounter++;
        
        // Update highest bid
        auctions[auctionId].highestBid = msg.value;
        auctions[auctionId].highestBidder = msg.sender;
        auctions[auctionId].bidCount++;
        
        // Store the bid
        auctionBids[auctionId].push(Bid({
            bidId: bidId,
            amount: msg.value,
            bidder: msg.sender,
            timestamp: block.timestamp,
            isRevealed: true
        }));
        
        emit BidPlaced(auctionId, msg.sender, bidId);
    }
    
    function endAuction(uint256 auctionId) public {
        require(auctions[auctionId].seller != address(0), "Auction does not exist");
        require(auctions[auctionId].isActive, "Auction is not active");
        require(block.timestamp > auctions[auctionId].endTime, "Auction has not ended yet");
        require(msg.sender == auctions[auctionId].seller || msg.sender == owner, "Not authorized");
        
        auctions[auctionId].isActive = false;
        auctions[auctionId].isEnded = true;
        
        emit AuctionEnded(auctionId, auctions[auctionId].highestBidder, auctions[auctionId].highestBid);
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
            auction.reservePrice,
            auction.highestBid,
            auction.bidCount,
            auction.isActive,
            auction.isEnded,
            auction.seller,
            auction.highestBidder,
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
}
