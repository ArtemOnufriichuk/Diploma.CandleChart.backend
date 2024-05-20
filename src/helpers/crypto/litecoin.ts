import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Litecoin {
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

export const litecoin = new Litecoin();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/ltcusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'litecoin',
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
        crypto: 'litecoin',
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
        crypto: 'litecoin',
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

    litecoin.value = value;
    litecoin.time = time;

    if (!litecoin.manipulated && !litecoin.lastManipulatedCandleTime) {
      litecoin.high = high;
      litecoin.open = open;
      litecoin.low = low;
      litecoin.price = price;
    } else if (!litecoin.manipulated && litecoin.lastManipulatedCandleTime) {
      if (litecoin.lastManipulatedCandleTime !== time) {
        litecoin.lastManipulatedCandleTime = 0;
        litecoin.high = high;
        litecoin.open = open;
        litecoin.low = low;
        litecoin.price = price;
      } else {
        litecoin.price = price;
        if (litecoin.low > litecoin.price) {
          litecoin.low = litecoin.price;
        }
        if (litecoin.high < litecoin.price) {
          litecoin.high = litecoin.price;
        }
      }
    } else if (litecoin.manipulated) {
      if (litecoin.open !== open && !litecoin.lastManipulatedCandleTime) {
        litecoin.open = open;
      }
      if (
        litecoin.lastManipulatedCandleTime &&
        litecoin.lastManipulatedCandleTime !== litecoin.time
      ) {
        litecoin.open = litecoin.price;
      }
      litecoin.lastManipulatedCandleTime = time;
      litecoin.price += litecoin.amount;
      if (litecoin.low > litecoin.price) {
        litecoin.low = litecoin.price;
      }
      if (litecoin.high < litecoin.price) {
        litecoin.high = litecoin.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...litecoin.getCandle(), pair: 'litecoin' });
    }
  });
};

wsConnect();
