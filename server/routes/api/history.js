const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');
const ensureSeconds = timestamp => {
  return timestamp.toString().length === 13 ? Math.floor(timestamp / 1000) : timestamp;
};

const IDMapBySymbol = {};

router.get('/', async (req, res) => {
  const { symbol, resolution, from, to, countback } = req.query;

  if(IDMapBySymbol[symbol] === undefined) {
    const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${symbol}`)
    const { data } = response.data;
    if( !data[symbol] ) {
      res.status(404).send('Not found');
      return;
    }
    IDMapBySymbol[symbol] = data[symbol].id;
  }

  const timeStart = ensureSeconds(parseInt(from));
  const timeEnd = ensureSeconds(parseInt(to));
  console.log(timeStart, timeEnd)
  console.log(moment(timeStart*1000).format('HH:MM:SS'), moment(timeEnd*1000).format('HH:MM:SS'))
  const url = `https://api.coinmarketcap.com/data-api/v3.1/cryptocurrency/historical?id=${IDMapBySymbol[symbol]}&timeStart=${timeStart}&timeEnd=${timeEnd}&interval=1d`;

  try {
    const response = await axios.get(url);
    const quotes = response.data.data.quotes;

    const result = {
      t: [],
      o: [],
      h: [],
      l: [],
      c: [],
      v: [],
      s: 'ok'
    };

    quotes.forEach(quote => {
      result.t.push(new Date(quote.timeOpen).getTime() / 1000); // Convert to timestamp in seconds
      result.o.push(quote.quote.open);
      result.h.push(quote.quote.high);
      result.l.push(quote.quote.low);
      result.c.push(quote.quote.close);
      result.v.push(quote.quote.volume);
    });

    res.json(result);
  } catch (err) {
    console.error("error", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;