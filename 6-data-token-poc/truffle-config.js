const HDWalletProvider = require('truffle-hdwallet-provider')
var mnemonic = process.env.NMEMORIC
const url = process.env.KEEPER_RPC_URL

module.exports = {
    networks: {
        // only used locally, i.e. ganache
        development: {
            host: 'localhost',
            port: 7545,
            // has to be '*' because this is usually ganache
            network_id: '*',
            gas: 6600000
        },
        // kovan testnet
        kovan: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://kovan.infura.io/v3/7ffbee98713e4856877d879508d242a0")
            },
            network_id: '42',
            websockets: true,
            gas: 6000000,
            gasPrice: 10000000000 // 10 Gwei
        },
        // Rinkeby testnet
        rinkeby: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://rinkeby.infura.io/v3/7ffbee98713e4856877d879508d242a0")
            },
            network_id: '4',
            gas: 6600000,
            gasPrice: 10000000000 // 10 Gwei
        },
        ropsten: {
            provider: function() {
              return new HDWalletProvider(process.env.NMEMORIC, "https://ropsten.infura.io/v3/7ffbee98713e4856877d879508d242a0")
            },
            gas: 6000000,
            gasPrice: 10000000000, // 10 Gwei
            network_id: 3
        },
    },
    compilers: {
        solc: {
            version: '0.5.5',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
}
