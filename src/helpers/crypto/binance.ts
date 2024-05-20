import WebSocket from 'ws';
import { candleService } from '../../services/candle.service';
import { Candle } from '../constants';
import { loggerCrypto } from '../utils';

class Binance {
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

export const binance = new Binance();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/bnbusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'binance',
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
        crypto: 'binance',
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
        crypto: 'binance',
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

    binance.value = value;
    binance.time = time;

    if (!binance.manipulated && !binance.lastManipulatedCandleTime) {
      binance.high = high;
      binance.open = open;
      binance.low = low;
      binance.price = price;
    } else if (!binance.manipulated && binance.lastManipulatedCandleTime) {
      if (binance.lastManipulatedCandleTime !== time) {
        binance.lastManipulatedCandleTime = 0;
        binance.high = high;
        binance.open = open;
        binance.low = low;
        binance.price = price;
      } else {
        binance.price = price;
        if (binance.low > binance.price) {
          binance.low = binance.price;
        }
        if (binance.high < binance.price) {
          binance.high = binance.price;
        }
      }
    } else if (binance.manipulated) {
      if (binance.open !== open && !binance.lastManipulatedCandleTime) {
        binance.open = open;
      }
      if (binance.lastManipulatedCandleTime && binance.lastManipulatedCandleTime !== binance.time) {
        binance.open = binance.price;
      }
      binance.lastManipulatedCandleTime = time;
      binance.price += binance.amount;
      if (binance.low > binance.price) {
        binance.low = binance.price;
      }
      if (binance.high < binance.price) {
        binance.high = binance.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...binance.getCandle(), pair: 'binance' });
    }
  });
};

wsConnect();
