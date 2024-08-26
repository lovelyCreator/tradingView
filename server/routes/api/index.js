const express = require('express');
const router = express.Router();
const axios = require('axios');
const {TokenListProvider} = require('@solana/spl-token-registry');
// const { Connection, PublicKey } = require('@solana/web3.js');
// const { Metaplex } = require('@metaplex-foundation/js');
// const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');

axios.defaults.headers.common['X-CMC_PRO_API_KEY'] = 'bc44268c-f664-4b26-98c7-7215ae4e4ec9'

const token = require('../../models/Token');

router.get('/time', async (req, res) => {
  try {
    res.json(Number(new Date()));
  } catch (error) {}
});

router.get('/symbols', async (req, res) => {
  try {
    const {query} = req;
    console.log("query", query)

    const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${query.symbol}`)
    const { data } = response.data;
    if( !data[query.symbol] || data[query.symbol].length === 0 ) {
      res.status(404).send('Not found');
      return;
    }
    let tokens = data[query.symbol];
    if(!Array.isArray(tokens)) tokens = [tokens];

    const requiredTokens = tokens.filter(token => token.platform && token.platform.id === "5426")
    if(requiredTokens.length === 0) return res.status(404).send('Not found');
    const tokenInfo = requiredTokens[0]

    const ret = {
      name: tokenInfo.symbol,
      'exchange-traded': 'NasdaqNM',
      'exchange-listed': 'NasdaqNM',
      timezone: 'America/New_York',
      minmov: 1,
      minmov2: 0,
      pointvalue: 1,
      session: '0930-1630',
      has_intraday: false,
      visible_plots_set: 'ohlcv',
      description: tokenInfo.description,
      type: 'currency',
      supported_resolutions: ['5'],
      pricescale: 100,
      ticker: tokenInfo.symbol,
      logo_urls: [tokenInfo.logo],
      exchange_logo: 'https://s3-symbol-logo.tradingview.com/country/US.svg'
    };
    res.json(ret);
  } catch (error) {
    console.log(error)
    res.status(500).send('Server Error');
  }
});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', async (req, res) => {
  try {
    const tokens = await new TokenListProvider().resolve();
    const tokenList = tokens.filterByClusterSlug("mainnet-beta").getList();
    console.log(tokens.length)
    res.json({ ...tokenList, success: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req;
    console.log("query", query.query)

    const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${query.query}`)
    const { data } = response.data;
    if( !data[query.query] ) {
      res.status(404).send('Not found');
      return;
    }
    let tokens = data[query.query];
    if(!Array.isArray(tokens)) tokens = [tokens];

    const requiredTokens = tokens.filter(token => token.platform.id === "5426")
    if(requiredTokens.length === 0) return res.status(404).send('Not found');
    const tokenInfo = requiredTokens[0]
  

    const ret = {
      symbol: tokenInfo.symbol,
      full_name: tokenInfo.symbol,
      description: tokenInfo.description,
      exchange: 1,
      type: "currency",
    };
    res.json([ret]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
