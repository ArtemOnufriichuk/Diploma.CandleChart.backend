import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Zcash {
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

export const zcash = new Zcash();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/zecusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'zcash',
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
        crypto: 'zcash',
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
        crypto: 'zcash',
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

    zcash.value = value;
    zcash.time = time;

    if (!zcash.manipulated && !zcash.lastManipulatedCandleTime) {
      zcash.high = high;
      zcash.open = open;
      zcash.low = low;
      zcash.price = price;
    } else if (!zcash.manipulated && zcash.lastManipulatedCandleTime) {
      if (zcash.lastManipulatedCandleTime !== time) {
        zcash.lastManipulatedCandleTime = 0;
        zcash.high = high;
        zcash.open = open;
        zcash.low = low;
        zcash.price = price;
      } else {
        zcash.price = price;
        if (zcash.low > zcash.price) {
          zcash.low = zcash.price;
        }
        if (zcash.high < zcash.price) {
          zcash.high = zcash.price;
        }
      }
    } else if (zcash.manipulated) {
      if (zcash.open !== open && !zcash.lastManipulatedCandleTime) {
        zcash.open = open;
      }
      if (zcash.lastManipulatedCandleTime && zcash.lastManipulatedCandleTime !== zcash.time) {
        zcash.open = zcash.price;
      }
      zcash.lastManipulatedCandleTime = time;
      zcash.price += zcash.amount;
      if (zcash.low > zcash.price) {
        zcash.low = zcash.price;
      }
      if (zcash.high < zcash.price) {
        zcash.high = zcash.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...zcash.getCandle(), pair: 'zcash' });
    }
  });
};

wsConnect();
