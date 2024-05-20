import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Ethereum {
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

export const ethereum = new Ethereum();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'ethereum',
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
        crypto: 'ethereum',
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
        crypto: 'ethereum',
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

    ethereum.value = value;
    ethereum.time = time;

    if (!ethereum.manipulated && !ethereum.lastManipulatedCandleTime) {
      ethereum.high = high;
      ethereum.open = open;
      ethereum.low = low;
      ethereum.price = price;
    } else if (!ethereum.manipulated && ethereum.lastManipulatedCandleTime) {
      if (ethereum.lastManipulatedCandleTime !== time) {
        ethereum.lastManipulatedCandleTime = 0;
        ethereum.high = high;
        ethereum.open = open;
        ethereum.low = low;
        ethereum.price = price;
      } else {
        ethereum.price = price;
        if (ethereum.low > ethereum.price) {
          ethereum.low = ethereum.price;
        }
        if (ethereum.high < ethereum.price) {
          ethereum.high = ethereum.price;
        }
      }
    } else if (ethereum.manipulated) {
      if (ethereum.open !== open && !ethereum.lastManipulatedCandleTime) {
        ethereum.open = open;
      }
      if (
        ethereum.lastManipulatedCandleTime &&
        ethereum.lastManipulatedCandleTime !== ethereum.time
      ) {
        ethereum.open = ethereum.price;
      }
      ethereum.lastManipulatedCandleTime = time;
      ethereum.price += ethereum.amount;
      if (ethereum.low > ethereum.price) {
        ethereum.low = ethereum.price;
      }
      if (ethereum.high < ethereum.price) {
        ethereum.high = ethereum.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...ethereum.getCandle(), pair: 'ethereum' });
    }
  });
};

wsConnect();
