// javascript:  query the new exchange contract address for given token contract

let fs = require("fs");
let Web3 = require("web3");
require('dotenv').config()
const INFURA_ID = process.env.INFURA_ID

var abi = '[{"name":"NewExchange","inputs":[{"type":"address","name":"token","indexed":true},{"type":"address","name":"exchange","indexed":true}],"anonymous":false,"type":"event"},{"name":"initializeFactory","outputs":[],"inputs":[{"type":"address","name":"template"}],"constant":false,"payable":false,"type":"function","gas":35725},{"name":"createExchange","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"address","name":"token"}],"constant":false,"payable":false,"type":"function","gas":187911},{"name":"getExchange","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"address","name":"token"}],"constant":true,"payable":false,"type":"function","gas":715},{"name":"getToken","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"address","name":"exchange"}],"constant":true,"payable":false,"type":"function","gas":745},{"name":"getTokenWithId","outputs":[{"type":"address","name":"out"}],"inputs":[{"type":"uint256","name":"token_id"}],"constant":true,"payable":false,"type":"function","gas":736},{"name":"exchangeTemplate","outputs":[{"type":"address","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":633},{"name":"tokenCount","outputs":[{"type":"uint256","name":"out"}],"inputs":[],"constant":true,"payable":false,"type":"function","gas":663}]'

// OCEAN token contract on Rinkeby 
var token = '0x56F598cF576d923d7723781cB90BfBF41d81089f'
// UniSwap Exchange factory contract
var address = '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36';
// Your account
const account = '0x0e364eb0ad6eb5a4fc30fc3d2c2ae8ebe75f245c';
let web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/" + INFURA_ID));
const uniswap = new web3.eth.Contract(JSON.parse(abi), address);

async function call(transaction) {
    return await transaction.call({from: account});
}

async function getTokenExchange() {
    let exchange = await call(uniswap.methods.getExchange(token));
    console.log("the exchange address for Ocean token is:" + exchange)
}
getTokenExchange()
