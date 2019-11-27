/* globals artifacts */
const data = artifacts.require('DataManager.sol')

module.exports = function(deployer) {
    deployer.deploy(data)
}
