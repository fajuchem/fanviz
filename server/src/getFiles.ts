import axios from 'axios';
import fs from 'fs';

async function downloadZipFile(url: string, filePath: string): Promise<void> {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise<void>((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Usage example
// downloadZipFile('https://github.com/fajuchem/poc-codecov/archive/refs/heads/main.zip', './data/main.zip')
//   .then(() => console.log('File downloaded successfully!'))
//   .catch(error => console.error('Error downloading file:', error));
