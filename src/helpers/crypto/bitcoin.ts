import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Bitcoin {
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

export const bitcoin = new Bitcoin();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'bitcoin',
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
        crypto: 'bitcoin',
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
        crypto: 'bitcoin',
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

    bitcoin.value = value;
    bitcoin.time = time;

    if (!bitcoin.manipulated && !bitcoin.lastManipulatedCandleTime) {
      bitcoin.high = high;
      bitcoin.open = open;
      bitcoin.low = low;
      bitcoin.price = price;
    } else if (!bitcoin.manipulated && bitcoin.lastManipulatedCandleTime) {
      if (bitcoin.lastManipulatedCandleTime !== time) {
        bitcoin.lastManipulatedCandleTime = 0;
        bitcoin.high = high;
        bitcoin.open = open;
        bitcoin.low = low;
        bitcoin.price = price;
      } else {
        bitcoin.price = price;
        if (bitcoin.low > bitcoin.price) {
          bitcoin.low = bitcoin.price;
        }
        if (bitcoin.high < bitcoin.price) {
          bitcoin.high = bitcoin.price;
        }
      }
    } else if (bitcoin.manipulated) {
      if (bitcoin.open !== open && !bitcoin.lastManipulatedCandleTime) {
        bitcoin.open = open;
      }
      if (bitcoin.lastManipulatedCandleTime && bitcoin.lastManipulatedCandleTime !== bitcoin.time) {
        bitcoin.open = bitcoin.price;
      }
      bitcoin.lastManipulatedCandleTime = time;
      bitcoin.price += bitcoin.amount;
      if (bitcoin.low > bitcoin.price) {
        bitcoin.low = bitcoin.price;
      }
      if (bitcoin.high < bitcoin.price) {
        bitcoin.high = bitcoin.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...bitcoin.getCandle(), pair: 'bitcoin' });
    }
  });
};

wsConnect();
