import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';

export const revalidate = 3600; // Cache this route for 1 hour

// Ignore SSL certificate verification issues for dei.ac.in (common on university sites)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET() {
  try {
    // Fetch official results notice board page
    const response = await axios.get(
      'https://www.dei.ac.in/index.php?option=com_content&view=article&id=195&Itemid=292',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        httpsAgent,
        timeout: 10000,
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);
    const resultsList = [];

    // Parse all anchors inside the main page content (.item-page)
    $('.item-page a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().replace(/\s+/g, ' ').trim();

      if (href && (href.toLowerCase().includes('.pdf') || href.toLowerCase().includes('result'))) {
        // Resolve relative paths to absolute URLs against the university domain
        let absoluteUrl = href;
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
          const cleanHref = href.startsWith('/') ? href.slice(1) : href;
          absoluteUrl = `https://www.dei.ac.in/${cleanHref}`;
        }

        // Avoid empty titles or duplicate links
        if (text.length > 3 && !resultsList.some(r => r.url === absoluteUrl)) {
          resultsList.push({
            title: text,
            url: absoluteUrl,
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toISOString(),
      results: resultsList,
    });
  } catch (error) {
    console.error('[api/official-results] Scraper failed:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve official results board.' },
      { status: 500 }
    );
  }
}
