import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Ripple {
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

export const ripple = new Ripple();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/xrpusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'ripple',
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
        crypto: 'ripple',
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
        crypto: 'ripple',
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

    ripple.value = value;
    ripple.time = time;

    if (!ripple.manipulated && !ripple.lastManipulatedCandleTime) {
      ripple.high = high;
      ripple.open = open;
      ripple.low = low;
      ripple.price = price;
    } else if (!ripple.manipulated && ripple.lastManipulatedCandleTime) {
      if (ripple.lastManipulatedCandleTime !== time) {
        ripple.lastManipulatedCandleTime = 0;
        ripple.high = high;
        ripple.open = open;
        ripple.low = low;
        ripple.price = price;
      } else {
        ripple.price = price;
        if (ripple.low > ripple.price) {
          ripple.low = ripple.price;
        }
        if (ripple.high < ripple.price) {
          ripple.high = ripple.price;
        }
      }
    } else if (ripple.manipulated) {
      if (ripple.open !== open && !ripple.lastManipulatedCandleTime) {
        ripple.open = open;
      }
      if (ripple.lastManipulatedCandleTime && ripple.lastManipulatedCandleTime !== ripple.time) {
        ripple.open = ripple.price;
      }
      ripple.lastManipulatedCandleTime = time;
      ripple.price += ripple.amount;
      if (ripple.low > ripple.price) {
        ripple.low = ripple.price;
      }
      if (ripple.high < ripple.price) {
        ripple.high = ripple.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...ripple.getCandle(), pair: 'ripple' });
    }
  });
};

wsConnect();
