const https = require('https');

const files = [
  'Faculty%20of%20Science.pdf',
  'Faculty%20of%20Science%20FULL.pdf',
  'Faculty%20of%20Engineering.pdf',
  'Faculty%20of%20Commerce.pdf',
  'Faculty%20of%20Social%20Sciences.pdf',
  'Faculty%20of%20Arts.pdf',
  'Faculty%20of%20Education.pdf',
  'B.Sc.pdf',
  'B.Sc%20FULL.pdf',
  'B.Tech.pdf',
  'b.tec%20part%20time.pdf',
  'b.tec%20part%20time%20FULL.pdf',
  'Science.pdf',
  'Engineering.pdf',
  'Arts.pdf',
  'Commerce.pdf',
  'Social%20Sciences.pdf',
  'Education.pdf'
];

const basePath = 'https://www.dei.ac.in/files/NAAC/Criterion1/Syllabus%20for%20all%20Programs(2017-18)/';

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD', rejectUnauthorized: false }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false))
      .end();
  });
}

async function main() {
  console.log('Testing syllabus files inside NAAC folder...');
  for (const file of files) {
    const url = `${basePath}${file}`;
    const exists = await checkUrl(url);
    if (exists) {
      console.log(`[FOUND]: ${url}`);
    }
  }
  console.log('Done testing.');
}

main();
