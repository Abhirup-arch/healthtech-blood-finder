import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://www.indianredcross.org/ircs/ircsbloodbanks/';

function cleanText(text) {
  if (!text) return "";
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

async function scrapeBloodCentres() {
  console.log(`Fetching data from ${URL}...`);
  const response = await fetch(URL);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  
  const records = [];
  let totalCollected = 0;
  let invalidRows = 0;
  const uniqueKeys = new Set();

  $('table tbody tr').each((i, row) => {
    const cols = $(row).find('td');
    if (cols.length >= 8) {
      totalCollected++;
      
      const sNo = cleanText($(cols[0]).text());
      const state = cleanText($(cols[1]).text());
      
      // Col 3 contains City/District and often the Blood Centre Name
      const col3 = cleanText($(cols[2]).text());
      const city = col3;
      const bloodCentreName = col3; 
      
      const contactPerson = cleanText($(cols[3]).text());
      const designation = cleanText($(cols[4]).text());
      const phone = cleanText($(cols[5]).text());
      
      // Clean email: extract text, removing a tags or mailto
      const email = cleanText($(cols[6]).text());
      
      // Clean address: replace br with spaces
      $(cols[7]).find('br').replaceWith(' ');
      const address = cleanText($(cols[7]).text());

      // Filter out totally empty rows (like row 121 which is just 'Lucknow' and empty)
      if (!city && !contactPerson && !phone) {
        invalidRows++;
        return;
      }

      const record = {
        id: sNo || (records.length + 1).toString(),
        state,
        city,
        bloodCentreName,
        contactPerson,
        designation,
        phone,
        email,
        address,
        source: "Indian Red Cross Society"
      };

      const dedupKey = `${state}|${city}|${phone}`.toLowerCase();
      if (!uniqueKeys.has(dedupKey)) {
        uniqueKeys.add(dedupKey);
        records.push(record);
      }
    }
  });

  const duplicatesRemoved = totalCollected - invalidRows - records.length;

  return {
    data: records,
    metrics: {
      totalCollected,
      invalidRows,
      duplicatesRemoved,
      finalSize: records.length
    }
  };
}

async function main() {
  try {
    const { data, metrics } = await scrapeBloodCentres();
    const outputDir = path.join(__dirname, '../public/data');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const jsonPath = path.join(outputDir, 'blood_centres.json');
    const gzipPath = path.join(outputDir, 'blood_centres.json.gz');

    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(jsonPath, jsonString);
    const compressed = zlib.gzipSync(jsonString);
    fs.writeFileSync(gzipPath, compressed);
    
    console.log('--- VALIDATION REPORT ---');
    console.log(`Total records collected: ${metrics.totalCollected}`);
    console.log(`Invalid rows removed: ${metrics.invalidRows}`);
    console.log(`Duplicates removed: ${metrics.duplicatesRemoved}`);
    console.log(`Final dataset size: ${metrics.finalSize}`);
    console.log('-------------------------');
    console.log(`Successfully wrote ${jsonPath} and compressed version.`);
    
  } catch (error) {
    console.error('Fatal error during data generation:', error);
    process.exit(1);
  }
}

main();
