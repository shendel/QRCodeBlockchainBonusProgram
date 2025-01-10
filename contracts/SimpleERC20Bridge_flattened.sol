
// File: IERC20.sol


pragma solidity ^0.8.12;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}
// File: AddressSet.sol


pragma solidity ^0.8.12;

library AddressSet {
    struct Storage {
        mapping (address => bool) _exists;
        address[] _items;
    }
    function add(Storage storage arr, address item) public  {
        if (!arr._exists[item]) {
            arr._items.push(item);
            arr._exists[item] = true;
        }
    }
    function exists(Storage storage arr, address item) public view returns (bool) {
        return arr._exists[item];
    }
    function length(Storage storage arr) public view returns (uint256) {
        return arr._items.length;
    }
    function items(Storage storage arr, uint256 _offset, uint256 _limit) public view returns (address[] memory) {
        if (_limit == 0) return arr._items;
        uint256 iEnd = _offset + _limit;
        if (iEnd > arr._items.length) {
            iEnd = arr._items.length;
        }
        address[] memory ret = new address[](iEnd - _offset);
        for (uint256 i = 0; i < iEnd - _offset ; i++) {
            ret[i] = arr._items[
                arr._items.length - i - _offset - 1
            ];
        }
        return ret;
    }
    function get(Storage storage arr, uint256 index) public view returns (address ret) {
        if (index < arr._items.length) {
            return arr._items[index];
        }
    }
    function del(Storage storage arr, address item) public  {
        if (arr._exists[item]) {
            arr._exists[item] = false;
            if (arr._items.length == 1 || (arr._items[arr._items.length-1] == item)) {
                arr._items.pop();
                return;
            }
            for(uint256 i = 0; i < arr._items.length; i++) {
                if (arr._items[i] == item) {
                    arr._items[i] = arr._items[arr._items.length -1];
                    arr._items.pop();
                    return;
                }
            }
        }
    }
}
// File: BanList/IBannedClaimers.sol


pragma solidity ^0.8.12;

interface IBannedClaimers {
    struct BannedClaimer {
        address claimer;
        address who;
        string why;
        uint256 when;
    }
    function setOwner(address newOwner) external;
    function setFactory(address newFactory) external;

    function bannedClaimersWho(address claimer) external view returns (address);
    function bannedClaimersWhy(address claimer) external view returns (string memory);
    function bannedClaimersWhen(address claimer) external view returns (uint256);

    function addClaimerBan(address claimer, string memory why) external;
    function delClaimerBan(address claimer) external;
    function isBannedClaimer(address who) external view returns (bool);
    function getBannedClaimersCount() external view returns (uint256);
    function getBannedClaimers(uint256 offset,uint256 limit) external view returns (BannedClaimer[] memory);
}
// File: SimpleERC20Bridge.sol


pragma solidity ^0.8.12;




contract SimpleERC20Bridge {
    using AddressSet for AddressSet.Storage;

    uint256 public refundTime = 1 hours;
    AddressSet.Storage private owners;
    address public oracle;
    address public token;
    
    IBannedClaimers public blacklist;

    struct SwapIn {
        uint256 swapId;
        address fromAddress;
        address toAddress;
        uint256 amount;
        uint256 utx;
    }

    struct SwapOut {
        uint256 swapId;
        address fromAddress;
        address toAddress;
        uint256 amount;
        uint256 utx;
        uint256 blocknumber;
        bool swapped;
        bool refunded;
        bytes32 inHash;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only for oracle");
        _;
    }
    modifier onlyOwner() {
        require(owners.exists(msg.sender) == true, "Only for owner");
        _;
    }

    mapping (uint256 => SwapOut) public swapsOut;
    mapping (address => uint256[]) public swapsOutByOwner;

    uint256[] public swapsOutQuery;
    mapping (uint256 => bool) public swapsOutQueryExists;
    uint256 public lastSwapOutId;
    
    mapping (uint256 => SwapIn) public swapsIn;


    constructor(
        address _oracle,
        address _token,
        address _blacklist
    ) {
        owners.add(msg.sender);
        oracle = _oracle;
        token = _token;
        blacklist = IBannedClaimers(_blacklist);
    }

    function _swapsOutQueryAdd(uint256 swapId) private {
        if (!swapsOutQueryExists[swapId]) {
            swapsOutQuery.push(swapId);
            swapsOutQueryExists[swapId] = true;
        }
    }
    
    function _swapsOutQueryDel(uint256 swapId) private {
        if (swapsOutQueryExists[swapId]) {
            swapsOutQueryExists[swapId] = false;
            if (swapsOutQuery[swapsOutQuery.length-1] == swapId) {
                swapsOutQuery.pop();
                return;
            }
            for(uint256 i = 0; i < swapsOutQuery.length; i++) {
                if (swapsOutQuery[i] == swapId) {
                    swapsOutQuery[i] = swapsOutQuery[swapsOutQuery.length -1];
                    swapsOutQuery.pop();
                    return;
                }
            }
        }
    }

    event onSwapIn(uint256 swapId, address from, address to, uint256 amount);

    function swapIn(
        uint256 swapId,
        address fromAddress,
        address toAddress,
        uint256 amount
    ) public onlyOracle {
        require(swapsIn[swapId].swapId == 0, "Swap already in");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Balance on contract not enought");

        swapsIn[swapId] = SwapIn(
            swapId,
            fromAddress,
            toAddress,
            amount,
            block.timestamp
        );

        IERC20(token).transfer(toAddress, amount);

        emit onSwapIn(
            swapId,
            fromAddress,
            toAddress,
            amount
        );
    }

    function getNextSwapOut() public view returns(SwapOut memory ret) {
        if (swapsOutQuery.length > 0) {
            ret = swapsOut[swapsOutQuery[0]];
        }
        return ret;
    }

    event onSwapOutReady(uint256 swapId, bytes32 inHash);

    function swapOutReady(
        uint256 swapId,
        bytes32 inHash
    ) public onlyOracle {
        swapsOut[swapId].swapped = true;
        swapsOut[swapId].inHash = inHash;
        _swapsOutQueryDel(swapId);
        emit onSwapOutReady(swapId, inHash);
    }

    event onSwapOutRefund(uint256 swapId, address refunder);

    function swapOutRefund(
        uint256 swapId
    ) public {
        require(swapsOut[swapId].swapped == false, "Swap already swapped");
        require(swapsOut[swapId].refunded == false, "Swap already refunded");
        require(block.timestamp > swapsOut[swapId].utx + refundTime, "Refund timeout freeze");
        require(IERC20(token).balanceOf(address(this)) >= swapsOut[swapId].amount, "Balance on Bridge not enought");
        
        swapsOut[swapId].refunded = true;
        _swapsOutQueryDel(swapId);

        IERC20(token).transfer(swapsOut[swapId].fromAddress, swapsOut[swapId].amount);
        emit onSwapOutRefund(swapId, msg.sender);
    }

    event onSwapOut(uint256 swapId, address from, address to, uint256 amount);

    function swapOut(
        address toAddress,
        uint256 amount
    ) public {
        require(blacklist.isBannedClaimer(msg.sender) == false, "Blacklisted");
        require(msg.sender == tx.origin, "Contract call not allowed");
        require(blacklist.isBannedClaimer(toAddress) == false, "Blacklisted");
        require(IERC20(token).balanceOf(msg.sender) >= amount, "Balance not enought");
        require(IERC20(token).allowance(msg.sender, address(this)) >= amount, "Allowance not enought");

        lastSwapOutId++;
        swapsOut[lastSwapOutId] = SwapOut(
            lastSwapOutId,
            msg.sender,
            toAddress,
            amount,
            block.timestamp,
            block.number,
            false,
            false,
            0x00
        );
        swapsOutByOwner[msg.sender].push(lastSwapOutId);
        _swapsOutQueryAdd(lastSwapOutId);

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit onSwapOut(
            lastSwapOutId,
            msg.sender,
            toAddress,
            amount
        );
    }

    
    function getSwapsOQuery() public view returns(uint256[] memory) {
        return swapsOutQuery;
    }
    function swapOutQueryAdd(uint256 swapId) public onlyOwner {
        _swapsOutQueryAdd(swapId);
    }
    function swapOutQueryDel(uint256 swapId) public onlyOwner {
        _swapsOutQueryDel(swapId);
    }
    function setOracle(address newOracle) public onlyOwner {
        oracle = newOracle;
    }
    function setToken(address newToken) public onlyOwner {
        token = newToken;
    }
    function setBlacklist(address newBlacklist) public onlyOwner {
        blacklist = IBannedClaimers(newBlacklist);
    }
    function getTokenName() public view returns (string memory) {
        return IERC20(token).name();
    }
    function getTokenSymbol() public view returns (string memory) {
        return IERC20(token).symbol();
    }
    function getTokenDecimals() public view returns (uint8) {
        return IERC20(token).decimals();
    }
    function getBalance() public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    function safeTokens(address tokenAddress, address to) public onlyOwner {
        IERC20(token).transfer(to, IERC20(tokenAddress).balanceOf(address(this)));
    }
    function withdrawTokens(address to) public onlyOwner {
        IERC20(token).transfer(to, IERC20(token).balanceOf(address(this)));
    }

    function addOwner(address owner) public onlyOwner {
        require(owner != address(0), "Owner address cant be zero");
        if(!owners.exists(owner)) owners.add(owner);
    }
    function delOwner(address owner) public onlyOwner {
        if(owners.exists(owner)) owners.del(owner);
    }
    function getOwners() public view returns(address[] memory) {
        return owners.items(0,0);
    }
}