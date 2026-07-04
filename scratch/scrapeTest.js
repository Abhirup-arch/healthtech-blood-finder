import https from 'https';
import * as cheerio from 'cheerio';

async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  const html = await fetchHTML('https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/stockAvailability.cnt');
  const $ = cheerio.load(html);
  
  // Extract states
  const states = [];
  $('#stateCode option').each((i, el) => {
    const val = $(el).attr('value');
    if (val && val !== '-1') {
      states.push({ code: val, name: $(el).text().trim() });
    }
  });
  
  console.log("Found States:", states.length);
  if (states.length > 0) {
    console.log("Example states:", states.slice(0, 3));
  }
}

test();
