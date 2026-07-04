import https from 'https';

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
  
  // Find URL endpoints
  const lines = html.split('\n');
  const urls = [];
  lines.forEach(line => {
    if (line.includes('hmode=') || line.includes('url:') || line.includes('action=')) {
      urls.push(line.trim());
    }
  });
  
  console.log("Endpoints found:");
  urls.forEach(u => console.log(u.substring(0, 150)));
}

test();
