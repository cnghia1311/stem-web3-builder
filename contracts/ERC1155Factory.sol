// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// ============================================================================
// 1. ERC1155 "Siêu Cấp" (Full Option - Đa Token / Huy hiệu)
// ============================================================================
contract Stem1155 is ERC1155, ERC1155Burnable, ERC1155Supply, ERC2981, Ownable {
    string public name;
    string public symbol;
    bool public isSoulbound; // Cho phép khóa token thành Huy hiệu cố định

    constructor(
        string memory name_,
        string memory symbol_,
        string memory uri_,
        address initialOwner,
        bool isSoulbound_
    ) ERC1155(uri_) Ownable(initialOwner) {
        name = name_;
        symbol = symbol_;
        isSoulbound = isSoulbound_;
        // Cài đặt phí Royalty mặc định 5%
        _setDefaultRoyalty(initialOwner, 500);
    }

    // Chủ sở hữu có thể cập nhật URI lưu trữ thư mục chứa metadata các huy hiệu
    // Chuẩn ERC1155 thường dùng link có dạng: ipfs://.../{id}.json
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    // Hàm cập nhật Royalty (Chỉ Owner)
    function setRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    // Đúc (Mint) một loại huy hiệu/vật phẩm mới với số lượng tuỳ ý
    // id: Mã định danh của vật phẩm (vd: 1)
    // amount: Số lượng phát hành (vd: 1000)
    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    // Đúc nhiều loại vật phẩm cùng một lúc (Tối ưu Gas)
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // ========================================================================
    // TÍNH NĂNG ADMIN REVOKE (Thu hồi bắt buộc dành cho Nhà trường)
    // ========================================================================
    // Mặc dù token là Soulbound (bị khóa trong ví học sinh), 
    // Người phát hành (Owner) vẫn có quyền thu hồi lại huy hiệu/chứng chỉ này.
    function revokeBadge(address from, uint256 id, uint256 amount) public onlyOwner {
        _burn(from, id, amount);
    }

    // ========================================================================
    // Các hàm Override để xử lý Soulbound và Supply
    // ========================================================================
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        // Chặn chuyển nhượng nếu chế độ Soulbound được bật 
        // (Vẫn cho phép Mint: from = 0, và Burn: to = 0)
        if (isSoulbound && from != address(0) && to != address(0)) {
            revert("Stem1155: Soulbound badges cannot be transferred");
        }

        super._update(from, to, ids, values);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// ============================================================================
// 2. Factory cho ERC1155
// ============================================================================
contract ERC1155Factory {
    mapping(address => address[]) public userCollections;
    address[] public allCollections;

    event CollectionCreated(address indexed creator, address collectionAddress, string name, string symbol);

    function createCollection(
        string memory name, 
        string memory symbol, 
        string memory uri, 
        bool isSoulbound
    ) public returns (address) {
        
        Stem1155 newCollection = new Stem1155(name, symbol, uri, msg.sender, isSoulbound);
        address collectionAddr = address(newCollection);
        
        userCollections[msg.sender].push(collectionAddr);
        allCollections.push(collectionAddr);

        emit CollectionCreated(msg.sender, collectionAddr, name, symbol);

        return collectionAddr;
    }

    function getUserCollections(address user) public view returns (address[] memory) {
        return userCollections[user];
    }

    function getTotalCollections() public view returns (uint256) {
        return allCollections.length;
    }
}
