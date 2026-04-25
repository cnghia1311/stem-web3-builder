// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVotes {
    function getPastVotes(address account, uint256 timepoint) external view returns (uint256);
}

// ==========================================
// Hợp đồng Phòng Bỏ Phiếu (DAO Voting)
// ==========================================
contract RealTokenVoting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    IVotes public votingToken;
    uint256 public snapshotBlock; // Block chốt sổ để lấy số dư
    bool public snapshotSet;      // Đã bắt đầu (chốt sổ) chưa?
    address public admin;         // Chủ tọa cuộc bầu cử
    
    mapping(address => bool) public voters;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    // SỬA LỖI: Nhận _initialAdmin từ Factory truyền vào
    constructor(address _tokenAddress, string[] memory _candidateNames, address _initialAdmin) {
        votingToken = IVotes(_tokenAddress);
        admin = _initialAdmin; // Gán quyền Admin cho học sinh (msg.sender của Factory)

        for(uint i = 0; i < _candidateNames.length; i++) {
            candidatesCount++;
            candidates[candidatesCount] = Candidate(candidatesCount, _candidateNames[i], 0);
        }
    }

    // Admin gọi hàm này SAU KHI phát Token xong để chốt danh sách & bắt đầu bầu cử
    function startVoting() external {
        require(msg.sender == admin, "Loi: Chi admin moi bat dau duoc!");
        require(!snapshotSet, "Loi: Da bat dau roi!");
        snapshotBlock = block.number - 1; // Chốt sổ tại block trước đó
        snapshotSet = true;
    }

    // Người dùng bỏ phiếu
    function vote(uint _candidateId) public {
        require(snapshotSet, "Loi: Cuoc bau cu chua bat dau!");
        require(!voters[msg.sender], "Loi: Ban da binh chon roi!");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Loi: Ung vien khong hop le!");

        // Lấy số dư Token của người dùng TẠI THỜI ĐIỂM CHỐT SỔ (Tránh gian lận mượn Token)
        uint256 power = votingToken.getPastVotes(msg.sender, snapshotBlock);
        require(power > 0, "Loi: Ban khong co Token tai thoi diem chot so!");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount += power;
    }

    // Hàm tiện ích để xem thông tin ứng viên
    function getCandidate(uint _candidateId) external view returns (uint, string memory, uint) {
        Candidate memory c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }
}

// ==========================================
// Nhà Máy Tạo Phòng Bỏ Phiếu (Voting Factory)
// ==========================================
contract VotingFactory {
    // Lưu lịch sử các phòng bầu cử
    address[] public allVotings;
    mapping(address => address[]) public userVotings;

    event VotingCreated(address indexed creator, address votingAddress, address tokenAddress);

    // Học sinh gọi hàm này để tự đẻ ra 1 cuộc bầu cử mới
    function createVoting(address _tokenAddress, string[] memory _candidateNames) external returns (address) {
        require(_candidateNames.length > 0, "Phai co it nhat 1 ung vien");
        
        // Gọi lệnh đẻ hợp đồng, truyền msg.sender vào làm _initialAdmin
        RealTokenVoting newVoting = new RealTokenVoting(_tokenAddress, _candidateNames, msg.sender);
        address votingAddr = address(newVoting);
        
        // Lưu lịch sử
        allVotings.push(votingAddr);
        userVotings[msg.sender].push(votingAddr);
        
        emit VotingCreated(msg.sender, votingAddr, _tokenAddress);
        
        return votingAddr;
    }

    // Xem danh sách phòng bầu cử của một học sinh
    function getUserVotings(address user) external view returns (address[] memory) {
        return userVotings[user];
    }

    // Tổng số phòng bầu cử trên toàn hệ thống
    function getTotalVotings() external view returns (uint256) {
        return allVotings.length;
    }
}
