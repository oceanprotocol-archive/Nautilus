pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Burnable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract ERC721Token is ERC721Full, ERC721Burnable, Ownable {

    constructor (string memory name, string memory symbol)
    ERC721Full(name, symbol)
    public {}

    function mint(address to, uint256 tokenId) public returns (bool) {
            super._safeMint(to, tokenId);
        return true;
    }

  function burn(uint256 tokenId) public {
        //solhint-disable-next-line max-line-length
        super._burn(tokenId);
    }

}



