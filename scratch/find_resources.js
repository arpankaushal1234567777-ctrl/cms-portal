const https = require('https');

async function getPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      rejectUnauthorized: false
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const query = 'Syllabus';
  const url = `https://www.dei.ac.in/dei/index.php?searchword=${encodeURIComponent(query)}&searchphrase=all&option=com_search`;
  console.log(`Searching DEI site for "${query}" using URL: ${url}`);
  try {
    const html = await getPage(url);
    console.log(`Search result HTML length: ${html.length}`);
    
    // Find any links in search results
    const linkRegex = /href="([^"]+)"[^>]*>([^<]+)/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      if (href.includes('option=com_content') || href.includes('.pdf') || text.toLowerCase().includes('syllab')) {
        console.log(`Link found - Text: "${text}" | Href: "${href}"`);
      }
    }
  } catch (err) {
    console.log(`Failed: ${err.message}`);
  }
}

main();
