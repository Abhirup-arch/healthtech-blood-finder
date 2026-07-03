import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock fetching data from an external API
async function fetchLatestData() {
  console.log('Fetching latest blood stock data...');
  // In reality, this would be an API call. For now, we generate dynamic mock data.
  const states = ['MH', 'DL', 'KA'];
  const districts = {
    'MH': ['MUM', 'PUN'],
    'DL': ['NDL'],
    'KA': ['BLR']
  };
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  
  const mockData = [];
  for (let i = 1; i <= 20; i++) {
    const state = states[Math.floor(Math.random() * states.length)];
    const district = districts[state][Math.floor(Math.random() * districts[state].length)];
    
    mockData.push({
      id: i.toString(),
      name: `Blood Bank ${i}`,
      state,
      district,
      units: Math.floor(Math.random() * 50),
      address: `Random Address ${i}, ${district}`,
      contact: `000-12345${i.toString().padStart(2, '0')}`,
      bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)]
    });
  }
  return mockData;
}

async function main() {
  try {
    const data = await fetchLatestData();
    const outputDir = path.join(__dirname, '../public/data');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const jsonPath = path.join(outputDir, 'blood_stock.json');
    const gzipPath = path.join(outputDir, 'blood_stock.json.gz');

    // Write raw JSON
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(jsonPath, jsonString);
    console.log(`Successfully wrote ${jsonPath}`);

    // Compress JSON
    const compressed = zlib.gzipSync(jsonString);
    fs.writeFileSync(gzipPath, compressed);
    console.log(`Successfully wrote compressed JSON to ${gzipPath}`);
    
  } catch (error) {
    console.error('Error fetching blood data:', error);
    process.exit(1);
  }
}

main();
