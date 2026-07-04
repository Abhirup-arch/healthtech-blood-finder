import https from 'https';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ data: [] }); // Gracefully handle parse errors
        }
      });
    }).on('error', reject);
  });
}

function parseStockString(stockHtml) {
  const stock = {};
  if (!stockHtml || stockHtml.includes('Not Available')) {
    return stock;
  }
  
  // Format is usually: "Available, A+Ve:10, B+Ve:5"
  const cleanStr = stockHtml.replace(/<[^>]*>?/gm, '').trim();
  const parts = cleanStr.split(',');
  
  parts.forEach(part => {
    if (part.includes(':')) {
      const [grp, qty] = part.split(':');
      const normalizedGrp = grp.trim().replace('Ve', '');
      const parsedQty = parseInt(qty.trim(), 10);
      if (!isNaN(parsedQty)) {
        stock[normalizedGrp] = parsedQty;
      }
    }
  });
  
  return stock;
}

async function scrapeERaktKosh() {
  console.log('Fetching master state list...');
  const mainHtml = await fetchHTML('https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/stockAvailability.cnt');
  const $ = cheerio.load(mainHtml);
  
  const states = [];
  $('#stateCode option').each((i, el) => {
    const val = $(el).attr('value');
    const name = $(el).text().trim().toLowerCase();
    if (val && val !== '-1' && val !== '-2') {
      states.push({ code: val, name });
    }
  });

  console.log(`Found ${states.length} states.`);
  
  const finalDataset = {};
  let totalRecords = 0;
  
  for (const state of states) {
    console.log(`Fetching data for ${state.name}...`);
    // API endpoint for nearby blood stock
    const url = `https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/nearbyBB.cnt?hmode=GETNEARBYSTOCKDETAILS&stateCode=${state.code}&districtCode=-1&bloodGroup=all&bloodComponent=11&lang=0`;
    
    const response = await fetchJSON(url);
    const records = response.data || [];
    
    const stateData = [];
    
    records.forEach(row => {
      try {
        // Row format:
        // [0] S.No
        // [1] Name <br/> Address <br/> Phone..., Email...
        // [2] Type
        // [3] Availability string
        // [4] Last Updated
        
        const detailsStr = row[1] || '';
        const parts = detailsStr.split('<br/>');
        const name = parts[0] ? parts[0].trim() : 'Unknown';
        
        let address = '';
        let district = '';
        let contact = '';
        
        if (parts.length > 1) {
          address = parts[1].trim();
          // Attempt to extract district from address (usually comma separated, 3rd from end is district or 2nd from end)
          const addressParts = address.split(',');
          if (addressParts.length >= 3) {
            district = addressParts[addressParts.length - 3].trim();
          }
        }
        
        if (parts.length > 2) {
          contact = parts[2].trim().replace(/Phone:\s*/i, '').replace(/,\s*Fax.*/i, '');
        }

        const stockStr = row[3] || '';
        const stockData = parseStockString(stockStr);

        stateData.push({
          name,
          district,
          ...stockData,
          contact,
          address
        });
        
        totalRecords++;
      } catch (e) {
        console.error(`Error parsing row for ${state.name}:`, e.message);
      }
    });
    
    if (stateData.length > 0) {
      finalDataset[state.name] = stateData;
    }
  }

  return {
    data: finalDataset,
    totalRecords
  };
}

async function main() {
  try {
    const { data, totalRecords } = await scrapeERaktKosh();
    const outputDir = path.join(__dirname, '../public/data');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const jsonPath = path.join(outputDir, 'blood_availability.json');
    const gzipPath = path.join(outputDir, 'blood_availability.json.gz');

    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(jsonPath, jsonString);
    const compressed = zlib.gzipSync(jsonString);
    fs.writeFileSync(gzipPath, compressed);
    
    console.log('--- VALIDATION REPORT ---');
    console.log(`Source: e-RaktKosh API`);
    console.log(`Total records collected: ${totalRecords}`);
    console.log(`States populated: ${Object.keys(data).length}`);
    console.log('-------------------------');
    console.log(`Successfully wrote ${jsonPath} and compressed version.`);
    
  } catch (error) {
    console.error('Fatal error during data generation:', error);
    process.exit(1);
  }
}

main();
