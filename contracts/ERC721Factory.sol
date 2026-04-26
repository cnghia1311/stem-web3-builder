// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ============================================================================
// 1. NFT "Siêu Cấp" (Full Option)
// Kế thừa: URIStorage (lưu ảnh), Enumerable (duyệt danh sách), Burnable (đốt), ERC2981 (Royalty)
// ============================================================================
contract StemNFT is ERC721, ERC721URIStorage, ERC721Enumerable, ERC721Burnable, ERC2981, Ownable {
    uint256 private _nextTokenId;
    bool public isSoulbound; // Đánh dấu nếu là chứng chỉ (không thể chuyển nhượng)

    // Khi khởi tạo, gán người tạo làm Owner
    constructor(
        string memory name_, 
        string memory symbol_, 
        address initialOwner,
        bool isSoulbound_
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        isSoulbound = isSoulbound_;
        // Thiết lập Royalty mặc định là 5% (500 basis points) trả về cho người tạo (Owner)
        _setDefaultRoyalty(initialOwner, 500);
    }

    // Hàm cập nhật Royalty (Chỉ Owner)
    function setRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    // Hàm Mint NFT: Chỉ có Owner (người tạo bộ sưu tập) mới được quyền Mint
    function mintNFT(address to, string memory uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // ========================================================================
    // TÍNH NĂNG ADMIN REVOKE (Thu hồi bắt buộc dành cho Nhà trường)
    // ========================================================================
    // Mặc dù token là Soulbound (bị khóa trong ví học sinh), 
    // Người phát hành (Owner) vẫn có quyền thu hồi lại chứng chỉ (đốt nó đi).
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    // ========================================================================
    // Các hàm bắt buộc phải override do xung đột đa kế thừa trong OpenZeppelin
    // ========================================================================
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Nếu bật chế độ Soulbound (Chứng chỉ), cấm mọi hành vi chuyển nhượng
        // (Vẫn cho phép Mint: from = 0, và Burn: to = 0)
        if (isSoulbound && from != address(0) && to != address(0)) {
            revert("StemNFT: Soulbound tokens cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// ============================================================================
// 2. NFT Factory (Thông thường - Không Proxy)
// ============================================================================
contract ERC721Factory {
    // Lưu danh sách các bộ sưu tập đã tạo của từng ví
    mapping(address => address[]) public userCollections;
    
    // Lưu tất cả các bộ sưu tập trên hệ thống
    address[] public allCollections;

    // Sự kiện được phát ra khi một bộ sưu tập mới được tạo thành công
    event CollectionCreated(address indexed creator, address collectionAddress, string name, string symbol);

    // Hàm tạo bộ sưu tập mới
    function createCollection(string memory name, string memory symbol, bool isSoulbound) public returns (address) {
        // Tạo Contract bộ sưu tập mới (Siêu Cấp) và gán quyền Owner cho người gọi hàm (msg.sender)
        StemNFT newCollection = new StemNFT(name, symbol, msg.sender, isSoulbound);
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
