import { bitcoin } from './crypto/bitcoin';
import { binance } from './crypto/binance';
import { dash } from './crypto/dash';
import { dogecoin } from './crypto/dogecoin';
import { ethereum } from './crypto/ethereum';
import { litecoin } from './crypto/litecoin';
import { monero } from './crypto/monero';
import { bitcoinCash } from './crypto/bitcoinCash';
import { ripple } from './crypto/xrp';
import { zcash } from './crypto/zcash';
import { Candle } from './constants';

export const getCryptoPrice: () => {
  bitcoin: Candle;
  binance: Candle;
  dash: Candle;
  dogecoin: Candle;
  ethereum: Candle;
  litecoin: Candle;
  monero: Candle;
  bitcoinCash: Candle;
  ripple: Candle;
  zcash: Candle;
} = () => {
  return {
    bitcoin: bitcoin.getCandle(),
    binance: binance.getCandle(),
    dash: dash.getCandle(),
    dogecoin: dogecoin.getCandle(),
    ethereum: ethereum.getCandle(),
    litecoin: litecoin.getCandle(),
    monero: monero.getCandle(),
    bitcoinCash: bitcoinCash.getCandle(),
    ripple: ripple.getCandle(),
    zcash: zcash.getCandle()
  };
};

export const setManipulated: (pair: string, amount: number) => void = (
  pair: string,
  amount: number
) => {
  switch (pair) {
    case 'bitcoin':
      bitcoin.manipulated = true;
      bitcoin.amount = amount;
      break;
    case 'binance':
      binance.manipulated = true;
      binance.amount = amount;
      break;
    case 'dash':
      dash.manipulated = true;
      dash.amount = amount;
      break;
    case 'dogecoin':
      dogecoin.manipulated = true;
      dogecoin.amount = amount;
      break;
    case 'ethereum':
      ethereum.manipulated = true;
      ethereum.amount = amount;
      break;
    case 'litecoin':
      litecoin.manipulated = true;
      litecoin.amount = amount;
      break;
    case 'monero':
      monero.manipulated = true;
      monero.amount = amount;
      break;
    case 'bitcoinCash':
      bitcoinCash.manipulated = true;
      bitcoinCash.amount = amount;
      break;
    case 'ripple':
      ripple.manipulated = true;
      ripple.amount = amount;
      break;
    case 'zcash':
      zcash.manipulated = true;
      zcash.amount = amount;
      break;
    default:
      throw new Error('This type of crypto does not exist');
  }
};

export const unsetManipulated: (pair: string) => void = (pair: string) => {
  switch (pair) {
    case 'bitcoin':
      bitcoin.manipulated = false;
      break;
    case 'binance':
      binance.manipulated = false;
      break;
    case 'dash':
      dash.manipulated = false;
      break;
    case 'dogecoin':
      dogecoin.manipulated = false;
      break;
    case 'ethereum':
      ethereum.manipulated = false;
      break;
    case 'litecoin':
      litecoin.manipulated = false;
      break;
    case 'monero':
      monero.manipulated = false;
      break;
    case 'bitcoinCash':
      bitcoinCash.manipulated = false;
      break;
    case 'ripple':
      ripple.manipulated = false;
      break;
    case 'zcash':
      zcash.manipulated = false;
      break;
    default:
      throw new Error('This type of crypto does not exist');
  }
};
