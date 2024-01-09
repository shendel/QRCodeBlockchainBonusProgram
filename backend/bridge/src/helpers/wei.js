const { BigNumber } = require('bignumber.js')

const toWei = (amount, decimals = 18) => {
  return new BigNumber(amount).multipliedBy(10 ** decimals).toFixed()
}

const fromWei = (amount, decimals = 18) => {
  return new BigNumber(amount).div(new BigNumber(10).pow(decimals)).toFixed()
}

module.exports = {
  toWei,
  fromWei
}