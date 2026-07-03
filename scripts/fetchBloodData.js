import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processCSVFiles() {
  const datasetsDir = path.join(__dirname, '../datasets');
  const files = fs.readdirSync(datasetsDir).filter(f => f.endsWith('.csv'));
  
  let totalImported = 0;
  let invalidRows = 0;
  const uniqueBanks = new Map();

  for (const file of files) {
    const filePath = path.join(datasetsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    for (const row of records) {
      totalImported++;
      
      // Dynamic Schema Detection
      // Name field can be "NAME OF THE BLOOD BANK" or "BSC NAME"
      const rawName = row['NAME OF THE BLOOD BANK'] || row['BSC NAME'];
      const rawDistrict = row['DISTRICT'] || '';
      
      if (!rawName) {
        invalidRows++;
        continue;
      }

      // Clean the name
      const cleanedName = rawName.replace(/[\r\n]+/g, ' ').trim();
      
      if (cleanedName === '') {
        invalidRows++;
        continue;
      }
      
      // Simple address extraction if there's a comma in the name
      let address = '';
      const commaIndex = cleanedName.indexOf(',');
      if (commaIndex > -1) {
        address = cleanedName.substring(commaIndex + 1).trim();
      }

      const bloodBank = {
        id: (uniqueBanks.size + 1).toString(), // Generate clean sequential ID
        name: cleanedName,
        state: '', // Left blank as per requirements
        district: rawDistrict,
        units: 0, // Left at 0 as per requirements
        address: address,
        contact: '', // Left blank
        bloodGroup: '' // Left blank
      };
      
      // Deduplication using lowercase name as key
      const dedupKey = cleanedName.toLowerCase();
      if (!uniqueBanks.has(dedupKey)) {
        uniqueBanks.set(dedupKey, bloodBank);
      }
    }
  }

  const finalDataset = Array.from(uniqueBanks.values());
  const duplicatesRemoved = totalImported - invalidRows - finalDataset.length;

  return {
    data: finalDataset,
    metrics: {
      totalImported,
      invalidRows,
      duplicatesRemoved,
      finalSize: finalDataset.length
    }
  };
}

async function main() {
  try {
    const { data, metrics } = await processCSVFiles();
    const outputDir = path.join(__dirname, '../public/data');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const jsonPath = path.join(outputDir, 'blood_stock.json');
    const gzipPath = path.join(outputDir, 'blood_stock.json.gz');

    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(jsonPath, jsonString);
    const compressed = zlib.gzipSync(jsonString);
    fs.writeFileSync(gzipPath, compressed);
    
    console.log('--- VALIDATION REPORT ---');
    console.log(`Total records imported: ${metrics.totalImported}`);
    console.log(`Invalid rows removed: ${metrics.invalidRows}`);
    console.log(`Duplicate records removed: ${metrics.duplicatesRemoved}`);
    console.log(`Final dataset size: ${metrics.finalSize}`);
    console.log('-------------------------');
    console.log(`Successfully wrote ${jsonPath} and compressed version.`);
    
  } catch (error) {
    console.error('Fatal error during data generation:', error);
    process.exit(1);
  }
}

main();
