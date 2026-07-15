const https = require('https');

const files = [
  'Student%20Diary%202018-19.pdf',
  'Student%20Diary%202019-20.pdf',
  'Student%20Diary%202020-21.pdf',
  'Student%20Diary%202021-22.pdf',
  'Student%20Diary%202022-23.pdf',
  'Student%20Diary%202023-24.pdf',
  'Student%20Diary%202024-25.pdf',
  'Student%20Diary%202025-26.pdf',
  'StudentDiary2018-19.pdf',
  'StudentDiary2019-20.pdf',
  'StudentDiary2020-21.pdf',
  'StudentDiary2021-22.pdf',
  'StudentDiary2022-23.pdf',
  'StudentDiary2023-24.pdf',
  'StudentDiary2024-25.pdf',
  'StudentDiary2025-26.pdf'
];

const paths = [
  'https://www.dei.ac.in/files/academics/',
  'https://www.dei.ac.in/dei/files/academics/',
  'https://www.dei.ac.in/files/',
  'https://www.dei.ac.in/dei/files/'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD', rejectUnauthorized: false }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false))
      .end();
  });
}

async function main() {
  console.log('Testing diary files...');
  for (const path of paths) {
    for (const file of files) {
      const url = `${path}${file}`;
      const exists = await checkUrl(url);
      if (exists) {
        console.log(`[FOUND]: ${url}`);
      }
    }
  }
  console.log('Done testing.');
}

main();
