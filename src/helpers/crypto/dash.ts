import WebSocket from 'ws';
import { Candle } from '../constants';
import { candleService } from '../../services/candle.service';
import { loggerCrypto } from '../utils';

class Dash {
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

export const dash = new Dash();

const wsConnect = () => {
  const socket = new WebSocket('wss://stream.binance.com:9443/ws/dashusdt@kline_1m');

  socket.on('close', (...data) => {
    loggerCrypto.log(
      'info',
      JSON.stringify({
        crypto: 'dash',
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
        crypto: 'dash',
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
        crypto: 'dash',
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

    dash.value = value;
    dash.time = time;

    if (!dash.manipulated && !dash.lastManipulatedCandleTime) {
      dash.high = high;
      dash.open = open;
      dash.low = low;
      dash.price = price;
    } else if (!dash.manipulated && dash.lastManipulatedCandleTime) {
      if (dash.lastManipulatedCandleTime !== time) {
        dash.lastManipulatedCandleTime = 0;
        dash.high = high;
        dash.open = open;
        dash.low = low;
        dash.price = price;
      } else {
        dash.price = price;
        if (dash.low > dash.price) {
          dash.low = dash.price;
        }
        if (dash.high < dash.price) {
          dash.high = dash.price;
        }
      }
    } else if (dash.manipulated) {
      if (dash.open !== open && !dash.lastManipulatedCandleTime) {
        dash.open = open;
      }
      if (dash.lastManipulatedCandleTime && dash.lastManipulatedCandleTime !== dash.time) {
        dash.open = dash.price;
      }
      dash.lastManipulatedCandleTime = time;
      dash.price += dash.amount;
      if (dash.low > dash.price) {
        dash.low = dash.price;
      }
      if (dash.high < dash.price) {
        dash.high = dash.price;
      }
    }

    if (closing) {
      await candleService.createCandle({ ...dash.getCandle(), pair: 'dash' });
    }
  });
};

wsConnect();
