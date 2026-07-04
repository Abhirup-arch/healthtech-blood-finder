import https from 'https';

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function test() {
  const url = 'https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/nearbyBB.cnt?hmode=GETNEARBYSTOCKDETAILS&stateCode=18&districtCode=-1&bloodGroup=all&bloodComponent=11&lang=0';
  console.log('Fetching:', url);
  try {
    const json = await fetchJSON(url);
    console.log("Total records:", json.data ? json.data.length : 0);
    if (json.data && json.data.length > 0) {
      console.log("First record:", json.data[0]);
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
