import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Monero {
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

export const monero = new Monero();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/xmrusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'monero',
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
        crypto: 'monero',
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
        crypto: 'monero',
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

    monero.value = value;
    monero.time = time;

    if (!monero.manipulated && !monero.lastManipulatedCandleTime) {
      monero.high = high;
      monero.open = open;
      monero.low = low;
      monero.price = price;
    } else if (!monero.manipulated && monero.lastManipulatedCandleTime) {
      if (monero.lastManipulatedCandleTime !== time) {
        monero.lastManipulatedCandleTime = 0;
        monero.high = high;
        monero.open = open;
        monero.low = low;
        monero.price = price;
      } else {
        monero.price = price;
        if (monero.low > monero.price) {
          monero.low = monero.price;
        }
        if (monero.high < monero.price) {
          monero.high = monero.price;
        }
      }
    } else if (monero.manipulated) {
      if (monero.open !== open && !monero.lastManipulatedCandleTime) {
        monero.open = open;
      }
      if (monero.lastManipulatedCandleTime && monero.lastManipulatedCandleTime !== monero.time) {
        monero.open = monero.price;
      }
      monero.lastManipulatedCandleTime = time;
      monero.price += monero.amount;
      if (monero.low > monero.price) {
        monero.low = monero.price;
      }
      if (monero.high < monero.price) {
        monero.high = monero.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...monero.getCandle(), pair: 'monero' });
    }
  });
};

wsConnect();
