// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Hợp đồng Chợ Phi Tập Trung (Mini Marketplace)
// Áp dụng mô hình Escrow (Ký gửi thực) và Pull Payment (Rút tiền thủ công)
contract MiniMarketplace is ReentrancyGuard, IERC721Receiver, Ownable {
    using SafeERC20 for IERC20;

    // Địa chỉ giả định đại diện cho Native Token (như ETH trên Ethereum, MATIC trên Polygon...)
    address public constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    uint256 private _listingIds;
    string public marketplaceName;

    struct Listing {
        uint256 listingId;
        address seller;
        address assetContract;
        uint256 tokenId;
        address currency;
        uint256 price;
        bool isActive;
    }

    // Lưu trữ thông tin các đơn hàng
    mapping(uint256 => Listing) public listings;
    
    // Két sắt: Lưu trữ số dư của từng người bán theo từng loại tiền tệ
    // seller => currency => amount
    mapping(address => mapping(address => uint256)) public balances;

    event ListingCreated(uint256 indexed listingId, address indexed seller, address assetContract, uint256 tokenId, address currency, uint256 price);
    event ListingBought(uint256 indexed listingId, address indexed buyer, address assetContract, uint256 tokenId, uint256 price);
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event FundsWithdrawn(address indexed seller, address currency, uint256 amount);

    constructor(string memory _name, address _owner) Ownable(_owner) {
        marketplaceName = _name;
    }

    // 1. KÝ GỬI NFT LÊN CHỢ
    function createListing(
        address _assetContract,
        uint256 _tokenId,
        address _currency,
        uint256 _price
    ) external nonReentrant returns (uint256) {
        require(_price > 0, "Gia ban phai lon hon 0");

        // Escrow: Bắt buộc chuyển NFT từ ví người bán chui vào trong Chợ
        // Lưu ý: Người bán phải gọi hàm `approve` cho Chợ trước khi gọi hàm này
        IERC721(_assetContract).safeTransferFrom(msg.sender, address(this), _tokenId);

        _listingIds++;
        uint256 newListingId = _listingIds;

        listings[newListingId] = Listing({
            listingId: newListingId,
            seller: msg.sender,
            assetContract: _assetContract,
            tokenId: _tokenId,
            currency: _currency,
            price: _price,
            isActive: true
        });

        emit ListingCreated(newListingId, msg.sender, _assetContract, _tokenId, _currency, _price);
        return newListingId;
    }

    // 2. MUA NFT TỪ CHỢ
    function buyListing(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Don hang khong ton tai hoac da ban");
        
        // Đánh dấu đã bán để tránh mua đúp (Reentrancy protection thêm)
        listing.isActive = false; 

        // Xử lý thanh toán
        if (listing.currency == NATIVE_TOKEN) {
            // Thanh toán bằng ETH
            require(msg.value == listing.price, "So tien ETH gui vao khong dung voi gia ban");
            // Ghi có vào két sắt của người bán
            balances[listing.seller][NATIVE_TOKEN] += msg.value;
        } else {
            // Thanh toán bằng Token (ERC-20)
            require(msg.value == 0, "Khong duoc gui ETH khi mua bang Token");
            // Rút Token từ ví người mua chuyển vào Chợ
            // Lưu ý: Người mua phải gọi hàm `approve` cho Chợ trước khi gọi hàm này
            IERC20(listing.currency).safeTransferFrom(msg.sender, address(this), listing.price);
            // Ghi có vào két sắt của người bán
            balances[listing.seller][listing.currency] += listing.price;
        }

        // Trả NFT về cho người mua
        IERC721(listing.assetContract).safeTransferFrom(address(this), msg.sender, listing.tokenId);

        emit ListingBought(_listingId, msg.sender, listing.assetContract, listing.tokenId, listing.price);
    }

    // 3. HỦY BÁN VÀ LẤY LẠI NFT
    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.isActive, "Don hang khong ton tai hoac da ban");
        require(listing.seller == msg.sender || owner() == msg.sender, "Chi nguoi ban hoac chu cho moi duoc huy");

        listing.isActive = false;

        // Trả NFT về lại ví của người bán
        IERC721(listing.assetContract).safeTransferFrom(address(this), listing.seller, listing.tokenId);

        emit ListingCancelled(_listingId, msg.sender);
    }

    // 4. NGƯỜI BÁN RÚT TIỀN TỪ KÉT SẮT VỀ VÍ (PULL PAYMENT)
    function withdrawFunds(address _currency) external nonReentrant {
        uint256 amount = balances[msg.sender][_currency];
        require(amount > 0, "Khet sat cua ban dang trong rong");

        // Xóa số dư trước khi chuyển tiền (Tránh lỗi Reentrancy Attack cực kỳ quan trọng)
        balances[msg.sender][_currency] = 0;

        if (_currency == NATIVE_TOKEN) {
            // Rút ETH
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "Loi khi rut ETH");
        } else {
            // Rút Token
            IERC20(_currency).safeTransfer(msg.sender, amount);
        }

        emit FundsWithdrawn(msg.sender, _currency, amount);
    }

    // Xem tổng số đơn hàng đã từng được tạo trên Chợ
    function getTotalListings() external view returns (uint256) {
        return _listingIds;
    }

    // Bắt buộc phải có hàm này để Smart Contract có thể nhận và giữ NFT
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

// ==========================================
// Hợp đồng Nhà Máy (Marketplace Factory)
// ==========================================
contract MarketplaceFactory {
    event MarketplaceCreated(address indexed marketplaceAddress, string name, address indexed owner);

    // Bất kỳ ai cũng có thể gọi hàm này để đẻ ra một cái Chợ của riêng họ
    function createMarketplace(string memory _name) external returns (address) {
        MiniMarketplace newMarket = new MiniMarketplace(_name, msg.sender);
        emit MarketplaceCreated(address(newMarket), _name, msg.sender);
        return address(newMarket);
    }
}
