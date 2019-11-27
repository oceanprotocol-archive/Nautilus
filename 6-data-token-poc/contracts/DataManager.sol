pragma solidity ^0.5.0;

import './ERC721Token.sol';
import './ERC20Token.sol';

contract DataManager {
    using SafeMath for uint256;

    struct NFT {
        bytes32 did;
        uint256 tokenId;
        string name;
        string symbol;
        ERC721Token token;
        address owner;
        bool    erc20Exist;
        uint256 price;
        uint256 supply;
        ERC20Token ft;
    }

    uint256 tokenId;
    ERC20Token dummy_erc20;
    mapping(bytes32 => uint256) private did2nftId;
    mapping(uint256 => NFT) private nftId2Token;
    mapping(string => bool) private nameExist;
    mapping(string => bool) private symbolExist;
    mapping(bytes32 => ERC20Token) private did2erc20;

    // modifier
    modifier nftExist(bytes32 _did) {
        require(did2nftId[_did] > 0, "NFT token does not exist for this dataset DID.");
        _;
    }

    // events
    event nftMinted(address indexed _owner, bytes32 indexed _did, uint256 indexed _tokenId);
    event nftBurnt(address indexed _owner, bytes32 indexed _did, uint256 indexed _tokenId);
    event erc20Created(address indexed _owner, bytes32 indexed _did, address indexed _erc20Token);
    event erc20Minted(address indexed _owner, bytes32 indexed _did, uint256 indexed _amount);
    event erc20Burnt(address indexed _owner, bytes32 indexed _did, uint256 indexed _amount);

    constructor () public {
        tokenId = 0;
        dummy_erc20 = new ERC20Token("", "");
    }

    /**
     * @dev Mint ERC721 token for new dataset 
     * @param _did refers to the unique id of the dataset.
     */
    function mintNFT(bytes32 _did, string memory _name, string memory _symbol) public returns (bool) {
        require(did2nftId[_did] == 0, "NFT token exists for this dataset DID.");
        require(bytes(_name).length != 0 && nameExist[_name] == false, "name cannot be empty or exist.");
        require(bytes(_symbol).length != 0 && symbolExist[_symbol] == false, "symbol cannot be empty or exist.");

        tokenId = tokenId.add(1);
        did2nftId[_did] = tokenId;
        nameExist[_name] = true;
        symbolExist[_symbol] = true;
        // create NFT token
        ERC721Token _token = new ERC721Token(_name, _symbol);
        _token.mint(msg.sender, tokenId);
        // create NFT struct
        nftId2Token[tokenId] = NFT({
            did: _did,
            tokenId: tokenId,
            name: _name,
            symbol: _symbol,
            token: _token,
            owner: msg.sender,
            erc20Exist: false,
            price: 0,
            supply: 0,
            ft: dummy_erc20
        });
    
        emit nftMinted(msg.sender, _did, tokenId);
        return true;
    }

    /**
     * @dev Burn ERC721 token after all underlying ERC20 tokens had been burnt
     * @param _did refers to the unique id of the dataset.
     */
    function burnNFT(bytes32 _did) public nftExist(_did) returns (bool) {
        uint256 _tokenId = did2nftId[_did];
        NFT memory nft = nftId2Token[_tokenId];
        require(msg.sender == nft.owner, "NFT must be burnt by its owner.");

        require(nft.supply == 0, "NFT cannot be burnt before all underlying ERC20 tokens are burnt.");
        ERC721Token _token = nft.token;
        _token.burn(_tokenId);

        emit nftBurnt(msg.sender, _did, tokenId);
        return true;
    }

    /**
     * @dev Mint ERC20 token for a specific NFT token (Only NFT token Ower can mint ERC20)
     * @param _did refers to the unique id of the dataset.
     */
    function createERC20 (bytes32 _did, string memory _name, string memory _symbol, uint256 _price) public nftExist(_did) returns (bool) {
        uint256 _tokenId = did2nftId[_did];
        require(msg.sender == nftId2Token[_tokenId].owner, "NFT must be burnt by its owner.");

        ERC20Token _erc20 = new ERC20Token(_name, _symbol);
        nftId2Token[_tokenId].ft = _erc20;
        did2erc20[_did] = _erc20;
        nftId2Token[_tokenId].erc20Exist = true;
        nftId2Token[_tokenId].price = _price; // in unit of Ether

        emit erc20Created(msg.sender, _did, address(_erc20));
        return true;
    }


    /**
     * @dev Mint ERC20 token for a specific NFT token (user need to send Ether to mint ERC20)
     * @param _did refers to the unique id of the dataset.
     */
    function mintERC20 (bytes32 _did) public nftExist(_did) payable returns (bool) {
        uint256 _tokenId = did2nftId[_did];
        uint256 amount = msg.value / nftId2Token[_tokenId].price;
        ERC20Token _erc20 = did2erc20[_did];
        _erc20.mint(msg.sender, amount);
        nftId2Token[_tokenId].supply = nftId2Token[_tokenId].supply.add(amount);
        emit erc20Minted(msg.sender, _did, amount);
        return true;
    }


    /**
     * @dev Burnt ERC20 token for a specific NFT token (user burn ERC20 and exchange for Ether)
     * @param _did refers to the unique id of the dataset.
     */
    function burnERC20 (bytes32 _did, uint256 _amount) public nftExist(_did) returns (bool) {
        uint256 _tokenId = did2nftId[_did];
        ERC20Token _erc20 = did2erc20[_did];

        require(_erc20.transferFrom(msg.sender, address(this), _amount), "must transfer erc20 token into escrow contract.");
        _erc20.burn(_amount);
        nftId2Token[_tokenId].supply = nftId2Token[_tokenId].supply.sub(_amount);

        uint256 nEther = _amount * nftId2Token[_tokenId].price;
        msg.sender.transfer(nEther);
        emit erc20Burnt(msg.sender, _did, _amount);
        return true;
        
    }

    /**
     * @dev return NFT token address
     * @param _did refers to the unique id of the dataset.
     */
    function getNFTaddress(bytes32 _did) public nftExist(_did) view returns (address){
        uint256 _tokenId = did2nftId[_did];
        return address(nftId2Token[_tokenId].token);
    }

        /**
     * @dev return ERC20 token address
     * @param _did refers to the unique id of the dataset.
     */
    function getERC20address(bytes32 _did) public nftExist(_did) view returns (address){
        uint256 _tokenId = did2nftId[_did];
        require(nftId2Token[_tokenId].erc20Exist == true, "ERC20 token does not exist.");
        return address(nftId2Token[_tokenId].ft);
    }

}