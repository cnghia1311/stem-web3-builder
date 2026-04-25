// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Đây là Contract đại diện cho 1 Bộ Sưu Tập NFT của người dùng
contract UserNFTCollection is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Khi khởi tạo, gán người tạo làm Owner
    constructor(
        string memory name_, 
        string memory symbol_, 
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {}

    // Hàm Mint NFT: Chỉ có Owner mới được quyền tạo NFT mới trong bộ sưu tập này
    function mintNFT(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
    
    // Hàm xem tổng số lượng NFT đã phát hành trong bộ sưu tập này
    function getTotalMinted() public view returns (uint256) {
        return _nextTokenId;
    }
}

// Đây là Nhà Máy (Factory) để tạo ra các Bộ Sưu Tập
contract ERC721Factory {
    // Lưu danh sách các bộ sưu tập đã tạo của từng ví
    mapping(address => address[]) public userCollections;
    
    // Lưu tất cả các bộ sưu tập trên hệ thống
    address[] public allCollections;

    // Sự kiện được phát ra khi một bộ sưu tập mới được tạo thành công
    event CollectionCreated(address indexed creator, address collectionAddress, string name, string symbol);

    // Hàm tạo bộ sưu tập mới
    function createCollection(string memory name, string memory symbol) public returns (address) {
        // Tạo Contract bộ sưu tập mới và gán quyền Owner cho người đang gọi hàm (msg.sender)
        UserNFTCollection newCollection = new UserNFTCollection(name, symbol, msg.sender);
        address collectionAddr = address(newCollection);
        
        // Lưu lại lịch sử
        userCollections[msg.sender].push(collectionAddr);
        allCollections.push(collectionAddr);

        // Báo hiệu ra bên ngoài mạng blockchain
        emit CollectionCreated(msg.sender, collectionAddr, name, symbol);

        return collectionAddr;
    }

    // Hàm lấy danh sách các bộ sưu tập của 1 người dùng
    function getUserCollections(address user) public view returns (address[] memory) {
        return userCollections[user];
    }

    // Hàm đếm tổng số bộ sưu tập đã được tạo bởi máy in này
    function getTotalCollections() public view returns (uint256) {
        return allCollections.length;
    }
}
