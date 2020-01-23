pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/access/Whitelist.sol";

contract ClickCoinCrowdsale is MintableToken, PausableToken, Whitelist {
  
    using SafeMath for uint256;

    /* Token Details */
    string public name = "ClickCoin";
    string public symbol = "CLC";
    uint256 public decimals = 18;

  /* Token Supply Details */

    uint256 constant public MAX_TOTAL_SUPPLY = 1000000000e18;      //1 Billion.
    uint256 constant public PRESALE_SUPPLY = 150000000e18;        //15 %
    uint256 constant public TEAM_AND_FOUNDER_SUPPLY = 130000000e18; //13%
    uint256 constant public RESERVE_SUPPLY = 200000000e18;        //20%
    uint256 constant public ADVISER_SUPPLY = 20000000e18;         //2%
    uint256 constant public AIRDROP_SUPPLY = 10000000e18;         //1%
    uint256 constant public BOUNTY_SUPPLY = 40000000e18;          //4%
    uint256 constant public CROWDSALE_SUPPLY = 450000000e18;      //45%

 /* Crowdsale Details */

    uint256 public crowdSaleTotalTokensSold;
    uint256 public crowdSaleTotalEthRaised;

  /* General Crowdsale Details */

    uint256 public softCap = 10000 ether;
    uint256 public hardCap = 50000 ether;
    uint256 public CLCPerEther;
    uint256 public CLCPerBitcoin;
    uint256 public CLCPerDollar;
    //enum CrowdSaleStage { Unknown, Preparing, PreSale, ICOroundOne, ICOroundOneFinalized, ICOroundTwo, ICOroundTwoFinalized, ICOroundThree, ICOroundThreeFinalized, ICOroundFour, PreSaleFinalized, ICOFinalized }
    enum CrowdSaleStage {PreSale, RoundOne, RoundTwo, RoundThree, RoundFour, Preparing}
    address[] public walletAddress;
    mapping(address => uint256) public balanceamount;
    mapping(address => bool) public addressadded;
    uint public airdropAmount;
    CrowdSaleStage public _stage = CrowdSaleStage.RoundOne;
    bool private saleInActiveMode;
    bool private saleIsFinished;
    bool public hasPrematurelyEnded;
    address private constant WITHDRAW_TO_WALLET_ADDRESS = 0xfA2d5938722abcD418143a08CBE007fbAEB7b86c;
    uint256 public crowdsaleStartTime;
    uint256 public crowdsaleEndTime;
    struct Round {
        string roundName;
        uint256 roundStartDate;
        uint256 roundEndDate;
        uint256 roundTokensSold;
        uint256 roundEthRaised;
        uint8 percentOfTokensAvailable;
        uint8 roundBonusPercent;
    }

    mapping (uint256 => Round) public rounds;
    uint8[] public roundIndexes;

    address public teamAndFounderFund; // team wallet address
    address public reserveFund;
    address public adviserFund;
    address public bountyFund;

    bool public isSetTeamWallet = false;
    bool public isSetAdviserWallet = false;
    bool public isSetReserveWallet = false;
    bool public isSetBountyWallet = false;
    
    /** Set team address (only once) */
    function setTeamAddress(address _teamAndFounderFund) external onlyOwner {
        require(isSetTeamWallet == false);

        teamAndFounderFund = _teamAndFounderFund;
        isSetTeamWallet = true;
    }
    
    function setReserveAddress(address _reserveFund) external onlyOwner {
        require(isSetReserveWallet == false);

        reserveFund = _reserveFund;
        isSetReserveWallet = true;
    }
    
    function setAdviserAddress(address _adviserFund) external onlyOwner {
        require(isSetTeamWallet == false);

        adviserFund = _adviserFund;
        isSetAdviserWallet = true;
    }
    
    function setBountyAddress(address _bountyFund) external onlyOwner {
        require(isSetBountyWallet == false);

        bountyFund = _bountyFund;
        isSetBountyWallet = true;
    }

    modifier canTransfer (address sender) {
        if (sender == teamAndFounderFund) {
            require(now > (1539169200 + 180 days));
        }
        else if (sender == reserveFund) {
             require(now > (1539169200 + 180 days));
        }
        else if (sender == adviserFund) {
             require(now > (1539169200 + 180 days));
        }
        else if (sender == bountyFund) {
            require(now > (1539169200 + 180 days));
        }
        else {
           // require(now > (1539169200));
        }
        _;
    }

    function transfer(address _to, uint256 _value) public canTransfer(msg.sender) returns (bool) {
        return super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value) public canTransfer(_from) returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }

    //address private constant withdrawToWalletAddress = ;

    uint256 public initialSupply = 600000000e18;    //600 Million
    uint256 public tokensSold;
    uint256 public ethRaised;
  
    constructor() public {
        totalSupply_ = initialSupply;
        balances[msg.sender] = initialSupply;
        balanceamount[msg.sender] = initialSupply;
        ethRaised = 0;
        airdropAmount = 0;
        //_stage = CrowdSaleStage.Preparing;
        saleInActiveMode = false;
        CLCPerEther = 1000;
        CLCPerBitcoin = 5000;
        CLCPerDollar = 10;
        saleIsFinished = false;
        hasPrematurelyEnded = false;
        crowdSaleTotalTokensSold = 0;    //Initialization of Tokens Sold
        crowdSaleTotalEthRaised = 0;     //Initialization of Ethers Raised
        crowdsaleStartTime = 1531979961;     //15-07-2018 11:00:00
        crowdsaleEndTime = 1532775600;
        roundIndexes = [0, 1, 2, 3, 4];
        //Details Of All Rounds

        //Presale Round

        Round storage preSale = rounds[0];
        preSale.roundName = "Presale";
        preSale.roundStartDate = 1531979961;        //19th July
        preSale.roundEndDate = 1532088000;          //20th July
        preSale.roundTokensSold = 0;
        preSale.roundEthRaised = 0;
        preSale.percentOfTokensAvailable = 15;
        preSale.roundBonusPercent = 25;

        //Round One

        Round storage roundOne = rounds[1];
        roundOne.roundName = "Round 1";
        roundOne.roundStartDate = 1532170800;        //21th July
        roundOne.roundEndDate = 1532257200;          //22th July
        roundOne.roundTokensSold = 0;
        roundOne.roundEthRaised = 0;
        roundOne.percentOfTokensAvailable = 25;
        roundOne.roundBonusPercent = 20;

       //Round Two

        Round storage roundTwo = rounds[2];
        roundTwo.roundName = "Round 2";
        roundTwo.roundStartDate = 1532343600;        //23th July
        roundTwo.roundEndDate = 1532430000;          //24th July
        roundTwo.roundTokensSold = 0;
        roundTwo.roundEthRaised = 0;
        roundTwo.percentOfTokensAvailable = 10;
        roundTwo.roundBonusPercent = 15;

       //Round Three

        Round storage roundThree = rounds[3];
        roundThree.roundName = "Round 3";
        roundThree.roundStartDate = 1532516400;        //25th July
        roundThree.roundEndDate = 1532602800;          //26th July
        roundThree.roundTokensSold = 0;
        roundThree.roundEthRaised = 0;
        roundThree.percentOfTokensAvailable = 7;
        roundThree.roundBonusPercent = 10;

        //Round Four

        Round storage roundFour = rounds[4];
        roundFour.roundName = "Round 4";
        roundFour.roundStartDate = 1532689200;        //27th July
        roundFour.roundEndDate = 1532775600;          //28th July
        roundFour.roundTokensSold = 0;
        roundFour.roundEthRaised = 0;
        roundFour.percentOfTokensAvailable = 3;
        roundFour.roundBonusPercent = 5;
    }

    modifier hardCapReached () {
        require(crowdSaleTotalEthRaised >= hardCap);
        _;
    } 

    modifier hardCapNotReached () {
        require(crowdSaleTotalEthRaised < hardCap);
        _;
    } 

    modifier saleTimeFinished () {
        require(now > crowdsaleEndTime);
        _;
    }

    function getRoundDetails(uint256 index) external view  
    returns (string, uint256, uint256, uint256, uint256, uint8,uint8) {
        return (rounds[index].roundName, rounds[index].roundStartDate, rounds[index].roundEndDate, 
        rounds[index].roundTokensSold, rounds[index].roundEthRaised, rounds[index].percentOfTokensAvailable,rounds[index].roundBonusPercent);
    }

    function getRoundPrices() external view returns (uint256, uint256, uint256) {
        return (CLCPerEther,CLCPerBitcoin,CLCPerDollar);
    }

     function getBalanceInfo(address _address) external view returns(uint256) {
        return (balanceamount[_address]);
    } 

    function startCrowdsaleStage(uint256 index2) external onlyOwner {
        if (index2 == 0) {
            _stage = CrowdSaleStage.PreSale;
        }
        else if (index2 == 1) {
            _stage = CrowdSaleStage.RoundOne;
        }
        else if (index2 == 2) {
            _stage = CrowdSaleStage.RoundTwo;
        }
        else if (index2 == 3) {
             _stage = CrowdSaleStage.RoundThree;
        }
        else if (index2 == 4) {
            _stage = CrowdSaleStage.RoundFour;
        }
        else {
            _stage = CrowdSaleStage.Preparing;
        }
        
    }

    function endCrowdsaleStage() external onlyOwner{
        if (_stage == CrowdSaleStage.PreSale) {
            rounds[0].roundTokensSold = tokensSold;
            tokensSold = 0;
            rounds[0].roundEthRaised = ethRaised;
            ethRaised = 0;
        }
        else if (_stage == CrowdSaleStage.RoundOne) {
            rounds[1].roundTokensSold = tokensSold;
            tokensSold = 0;
            rounds[1].roundEthRaised = ethRaised;
            ethRaised = 0;
        }
        else if (_stage == CrowdSaleStage.RoundTwo) {
            rounds[2].roundTokensSold = tokensSold;
            tokensSold = 0;
            rounds[2].roundEthRaised = ethRaised;
            ethRaised = 0;
        }
        else if (_stage == CrowdSaleStage.RoundThree) {
            rounds[3].roundTokensSold = tokensSold;
            tokensSold = 0;
            rounds[3].roundEthRaised = ethRaised;
            ethRaised = 0;
        }
        else if (_stage == CrowdSaleStage.RoundFour) {
            rounds[4].roundTokensSold = tokensSold;
            tokensSold = 0;
            rounds[4].roundEthRaised = ethRaised;
            ethRaised = 0;
            saleIsFinished = true;
        }
        _stage =  CrowdSaleStage.Preparing;
    }

    function changeParameters(uint256 crowdsalestarttime,uint256 crowdsaleendtime,uint256 CLCperether,uint256 CLCperbitcoin,uint256 CLCperdollar) external onlyOwner returns (bool) {
        crowdsaleStartTime = crowdsalestarttime;
        crowdsaleEndTime = crowdsaleendtime;
        CLCPerEther = CLCperether;
        CLCPerBitcoin = CLCperbitcoin;
        CLCPerDollar = CLCperdollar;
        return true;
    }

    function () external payable {
        require(msg.value > 0);
        //require(CLCPerEther > 0);
        //require(!saleIsFinished);
        //require(block.timestamp > crowdsaleStartTime && block.timestamp < crowdsaleEndTime);
        //require(!hasPrematurelyEnded);
        //require(_stage != CrowdSaleStage.Preparing);
        uint256 tokens;
        
        tokens = msg.value * CLCPerEther;
        if (addressadded[msg.sender] != true) {
            walletAddress.push(msg.sender);
        }
        balanceamount[owner] = balanceamount[owner].sub(tokens);
        balanceamount[msg.sender] = balanceamount[msg.sender].add(tokens);
        //balances[owner] = balances[owner].sub(tokens);
        //balances[msg.sender] = balances[msg.sender].add(tokens);
        tokensSold = tokensSold.add(tokens);
        ethRaised = ethRaised.add(msg.value);
        crowdSaleTotalTokensSold = crowdSaleTotalTokensSold.add(tokens);
        crowdSaleTotalEthRaised = crowdSaleTotalEthRaised.add(msg.value);
        addressadded[msg.sender]  = true;
    }

    function buywithBTC(address sender,uint256 tokens) external {
         if (addressadded[msg.sender] != true) {
            walletAddress.push(sender);
        }
        balanceamount[owner] = balanceamount[owner].sub(tokens);
        balanceamount[sender] = balanceamount[sender].add(tokens);
        tokensSold = tokensSold.add(tokens);
        crowdSaleTotalTokensSold = crowdSaleTotalTokensSold.add(tokens);
        addressadded[msg.sender]  = true;
    }

    function transferAllTokens() external onlyOwner returns(bool) {
        for (uint32 j = 0; j < walletAddress.length; j++) {

            if (balanceamount[walletAddress[j]] > 0) {
                allocateTokens(msg.sender, walletAddress[j], balanceamount[walletAddress[j]]);
                balanceamount[walletAddress[j]] = 0; 
            }
            
        }

        return true;

    }

    function allocateTokens(address sendingAddress, address to, uint256 tokenAmount) public {
        require(sendingAddress == owner);
        require(tokenAmount <= balances[sendingAddress]);
        
        require(to != address(0));
        balances[sendingAddress] = balances[sendingAddress].sub(tokenAmount);
        balances[to] = balances[to].add(tokenAmount);
        emit Transfer(sendingAddress, to, tokenAmount);
    }

    function multisend(address[] dests, uint256[] values) external
    onlyOwner
    returns (uint) {
        uint i = 0;
        while (i < dests.length) {
           super.mint(dests[i], values[i] * 10 ** decimals);
           i = i + 1;
        }
        return(i);
    }

    function transferTokensToWallet() internal {
        require(WITHDRAW_TO_WALLET_ADDRESS != address(0));
        require(balances[owner] > 0);
        balances[WITHDRAW_TO_WALLET_ADDRESS] =  balances[WITHDRAW_TO_WALLET_ADDRESS].add(balances[owner]);
        balances[owner] = 0;
    }

}