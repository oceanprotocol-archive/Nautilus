"use strict";

const OceanRequester = artifacts.require("OceanRequester.sol");
const h = require("chainlink-test-helpers");
const BN = web3.utils.BN

const LINK_FEE = web3.utils.toHex(1*10**18)
const LB = web3.utils.toHex(100)
const UB = web3.utils.toHex(1000)
let link, ocean;

function wait(ms) {
    const start = new Date().getTime()
    let end = start
    while (end < start + ms) {
        end = new Date().getTime()
    }
}

contract("OceanRequester", (accounts) => {

  const defaultAccount = accounts[0];

  before(async () => {

    const linkTokenABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"transferAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]'
    link = new web3.eth.Contract(
      JSON.parse(linkTokenABI),
      "0x01BE23585060835E02B77ef475b0Cc51aA1e0709"
    );

    ocean = await OceanRequester.deployed();
  });

  describe("should request data and receive callback", () => {
    let request;

    it("Verify that default account has enough LINK tokens", async () => {
      let balance = await link.methods.balanceOf(defaultAccount).call()
      console.log('Default acount LINK balance', balance)

      assert.isTrue(new BN(balance).gte(new BN('1')), "Default account does not have enough LINK tokens")
    });

    it("Verify that default account has ETH for transactions", async () => {
      const ethBalance = await web3.eth.getBalance(defaultAccount)
      console.log('Default acount ETH balance', ethBalance)

      assert.isTrue(new BN(ethBalance).gt(new BN(0)), "Default account does not have ETH")
    });

    it("Transfer 1 LINK token to the OceanRequester contract if it does not have any", async () => {
      let balance = await link.methods.balanceOf(ocean.address).call()
      console.log('Ocean Requester LINK balance', balance)

      if (new BN(balance).eq(new BN('0'))) {
        await link.methods.transfer(ocean.address, LINK_FEE).send({from: defaultAccount})
      }

      assert.isTrue(true)
    });

    it("Check LINK balance", async () => {
      let initBalance = await link.methods.balanceOf(ocean.address).call()
      console.log("Ocean contract has " + web3.utils.fromWei(initBalance, 'ether') + " LINK tokens")

      assert.isTrue(true)
    });

    it("Create a request and send to Chainlink", async () => {
      let tx = await ocean.getRandom(LB, UB);
      request = h.decodeRunRequest(tx.receipt.rawLogs[3]);
      console.log("request has been sent. request id :=" + request.id)

      let data = 0
      let timer = 0
      while(data == 0){
        data = await ocean.getRequestResult()
        if(data != 0) {
          console.log("Request is fulfilled. data := " + data)
        }
        wait(1000)
        timer = timer + 1
        console.log("waiting for " + timer + " second")
      }

      assert.isTrue(true)
    });
  });
});
