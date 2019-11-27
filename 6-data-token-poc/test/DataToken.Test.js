/* eslint-env mocha */
/* global web3, artifacts, assert, contract, describe, it */
const chai = require('chai')
const { assert } = chai
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const ERC20Token = artifacts.require('ERC20Token')
const DataManager = artifacts.require('DataManager')

global.artifacts = artifacts
global.web3 = web3

contract('DataManager', (accounts) => {
    let did = '0x319d158c3a5d81d15b0160cf8929916089218bdb4aa78c3ecd16633afd44b8ae'
    let erc20token
    let data
    let gasPrice = 22000000000;

    describe('Test Data Token Functions', () => {
        it('Should deploy data manager contract first', async () => {
            data = await DataManager.deployed()
            console.log(`deployed data manager contract address := ` + data.address)
        })

        it('Should create nft for given did', async () => {
            let name = 'OceanData'
            let symbol = 'ODT'
            let receipt = await data.mintNFT(did, name, symbol, {from: accounts[0]})
            // console.log(`nft created with token id := `+ receipt.logs[0].args._tokenId.toNumber())
            let nftAddress = await data.getNFTaddress(did)
            console.log(`nft created with address := `+ nftAddress)
        })

        it('Should create erc20 for the nft corresponding to the did', async () => {
            let name = 'DataERC20'
            let symbol = 'DEC20'
            let price = 1
            let receipt = await data.createERC20(did, name, symbol, price, {from: accounts[0]})
            console.log(`erc20 created with contract address := `+ receipt.logs[0].args._erc20Token)
            erc20token = await ERC20Token.at(receipt.logs[0].args._erc20Token)
        })

        it('Should mint erc20 token by sending Ether into dataManager contract', async () => {
            let amount = 10
            let receipt = await data.mintERC20(did, {from: accounts[1], value: amount})
            console.log(`number of erc20 minted := `+ receipt.logs[0].args._amount.toNumber())
        })

        it('Should not be able to burn nft as there is outstanding erc20 tokens exist', async () => {
            await assert.isRejected(data.burnNFT(did, {from: accounts[0]}), 'revert')
            console.log(`should fail on burning NFT with outstanding erc20 tokens exist`)
        })

        it('Should burn erc20 token by user to exchange for Ether', async () => {
            let amount = 10
            let balance = await erc20token.balanceOf(accounts[1])
            console.log(`user's erc20 token balance := ` + balance)
            await erc20token.approve(data.address, balance, { from: accounts[1]} );
            let receipt = await data.burnERC20(did, balance, {from: accounts[1]})
            console.log(`number of erc20 burnt := `+ receipt.logs[0].args._amount.toNumber())
        })

        it('Should be able to burn nft as there is no erc20 tokens exist', async () => {
            await data.burnNFT(did, {from: accounts[0]})
            console.log(`burnt NFT token`)
        })
  
    })
})
