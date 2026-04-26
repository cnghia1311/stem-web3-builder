// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// ============================================================================
// 1. Token "Siêu Cấp" (Full Option: Transfer, Burn, Vote, Permit)
// Tương thích 100% với mọi khối: Bầu cử DAO, DEX, Marketplace, Két Sắt...
// ============================================================================
contract StemToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address owner) 
        ERC20(name, symbol) 
        ERC20Permit(name) 
    {
        _mint(owner, initialSupply * 10 ** decimals());
    }

    // Bắt buộc override để giải quyết xung đột đa kế thừa
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}

// ============================================================================
// 2. Token Factory (Thông thường - Không Proxy)
// ============================================================================
contract ERC20Factory {
    
    mapping(address => address[]) public userTokens;
    address[] public allTokens;

    event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol, uint256 supply);

    function createToken(string memory name, string memory symbol, uint256 initialSupply) public returns (address) {
        require(initialSupply > 0, "Supply must be > 0");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");

        // Gọi đẻ Token Siêu Cấp và gán quyền chủ sở hữu cho người gọi hàm (msg.sender)
        StemToken newToken = new StemToken(name, symbol, initialSupply, msg.sender);

        userTokens[msg.sender].push(address(newToken));
        allTokens.push(address(newToken));

        emit TokenCreated(msg.sender, address(newToken), name, symbol, initialSupply);
        return address(newToken);
    }

    function getUserTokens(address user) public view returns (address[] memory) {
        return userTokens[user];
    }

    function getTotalTokens() public view returns (uint256) {
        return allTokens.length;
    }
}
