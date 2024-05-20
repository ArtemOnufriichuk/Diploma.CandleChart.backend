import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Dogecoin {
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

export const dogecoin = new Dogecoin();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/dogeusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'dogecoin',
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
        crypto: 'dogecoin',
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
        crypto: 'dogecoin',
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

    dogecoin.value = value;
    dogecoin.time = time;

    if (!dogecoin.manipulated && !dogecoin.lastManipulatedCandleTime) {
      dogecoin.high = high;
      dogecoin.open = open;
      dogecoin.low = low;
      dogecoin.price = price;
    } else if (!dogecoin.manipulated && dogecoin.lastManipulatedCandleTime) {
      if (dogecoin.lastManipulatedCandleTime !== time) {
        dogecoin.lastManipulatedCandleTime = 0;
        dogecoin.high = high;
        dogecoin.open = open;
        dogecoin.low = low;
        dogecoin.price = price;
      } else {
        dogecoin.price = price;
        if (dogecoin.low > dogecoin.price) {
          dogecoin.low = dogecoin.price;
        }
        if (dogecoin.high < dogecoin.price) {
          dogecoin.high = dogecoin.price;
        }
      }
    } else if (dogecoin.manipulated) {
      if (dogecoin.open !== open && !dogecoin.lastManipulatedCandleTime) {
        dogecoin.open = open;
      }
      if (
        dogecoin.lastManipulatedCandleTime &&
        dogecoin.lastManipulatedCandleTime !== dogecoin.time
      ) {
        dogecoin.open = dogecoin.price;
      }
      dogecoin.lastManipulatedCandleTime = time;
      dogecoin.price += dogecoin.amount;
      if (dogecoin.low > dogecoin.price) {
        dogecoin.low = dogecoin.price;
      }
      if (dogecoin.high < dogecoin.price) {
        dogecoin.high = dogecoin.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...dogecoin.getCandle(), pair: 'dogecoin' });
    }
  });
};

wsConnect();
