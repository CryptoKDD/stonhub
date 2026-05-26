const fs = require('fs');
const path = require('path');
const https = require('https');

const tokens = {
  'ton.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/11419.png',
  'ston.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/28224.png',
  'usdt.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
  'tston.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/29729.png',
  'not.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/29909.png',
  'dogs.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/32688.png',
  'cati.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/30351.png',
  'hmstr.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/32392.png',
  'redo.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/30609.png',
  'jusdt.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
  'jusdc.png': 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
};

const outputDir = path.join(__dirname, '..', 'public', 'tokens');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadFile(filename, url) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outputDir, filename);
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {}); // clean up the empty file
        reject(new Error(`Failed to get '${filename}' (Status: ${response.statusCode})`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          console.log(`Successfully downloaded ${filename} (${stats.size} bytes)`);
          resolve();
        });
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {}); // clean up the empty file
      reject(err);
    });
  });
}

async function main() {
  console.log('Starting token logo downloads...');
  for (const [filename, url] of Object.entries(tokens)) {
    try {
      await downloadFile(filename, url);
    } catch (err) {
      console.error(`Error downloading ${filename}: ${err.message}`);
    }
  }
  console.log('All downloads completed!');
}

main();
