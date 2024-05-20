import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class BitcoinCash {
  public open = 0;
  public price = 0;
  public high = 0;
  public low = 0;
  public time = 0;
  public value = 0;
  public manipulated = false;
  public amount = 0;

  public lastManipulatedCandleTime = 0;

  public getCandle(): Candle {
    return {
      open: this.open,
      low: this.low,
      high: this.high,
      close: this.price,
      time: this.time,
      value: this.value
    };
  }
}

export const bitcoinCash = new BitcoinCash();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/bchusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'bitcoinCash',
        event: 'close',
        args: data
      })
    );
    wsConnect();
  });

  socket.on('error', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'bitcoinCash',
        event: 'error',
        args: data
      })
    );
    socket.close();
  });

  socket.on('unexpected-response', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'bitcoinCash',
        event: 'unexpected-response',
        args: data
      })
    );
    socket.close();
  });

  socket.on('message', async (event: string) => {
    let {
      k: { h: high, o: open, l: low, c: price, t: time, x: closing, q: value }
    } = JSON.parse(event);
    time = Number(time) / 1000;
    closing = Boolean(closing);
    value = Number(value.split('.')[0]);
    high = Number(Number(high).toFixed(2));
    open = Number(Number(open).toFixed(2));
    low = Number(Number(low).toFixed(2));
    price = Number(Number(price).toFixed(2));

    bitcoinCash.value = value;
    bitcoinCash.time = time;

    if (!bitcoinCash.manipulated && !bitcoinCash.lastManipulatedCandleTime) {
      bitcoinCash.high = high;
      bitcoinCash.open = open;
      bitcoinCash.low = low;
      bitcoinCash.price = price;
    } else if (!bitcoinCash.manipulated && bitcoinCash.lastManipulatedCandleTime) {
      if (bitcoinCash.lastManipulatedCandleTime !== time) {
        bitcoinCash.lastManipulatedCandleTime = 0;
        bitcoinCash.high = high;
        bitcoinCash.open = open;
        bitcoinCash.low = low;
        bitcoinCash.price = price;
      } else {
        bitcoinCash.price = price;
        if (bitcoinCash.low > bitcoinCash.price) {
          bitcoinCash.low = bitcoinCash.price;
        }
        if (bitcoinCash.high < bitcoinCash.price) {
          bitcoinCash.high = bitcoinCash.price;
        }
      }
    } else if (bitcoinCash.manipulated) {
      if (bitcoinCash.open !== open && !bitcoinCash.lastManipulatedCandleTime) {
        bitcoinCash.open = open;
      }
      if (
        bitcoinCash.lastManipulatedCandleTime &&
        bitcoinCash.lastManipulatedCandleTime !== bitcoinCash.time
      ) {
        bitcoinCash.open = bitcoinCash.price;
      }
      bitcoinCash.lastManipulatedCandleTime = time;
      bitcoinCash.price += bitcoinCash.amount;
      if (bitcoinCash.low > bitcoinCash.price) {
        bitcoinCash.low = bitcoinCash.price;
      }
      if (bitcoinCash.high < bitcoinCash.price) {
        bitcoinCash.high = bitcoinCash.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...bitcoinCash.getCandle(), pair: 'bitcoinCash' });
    }
  });
};

wsConnect();
