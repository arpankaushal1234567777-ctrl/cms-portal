import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';
import * as cheerio from 'cheerio';

export const revalidate = 3600; // Cache this route for 1 hour

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GET() {
  try {
    const response = await axios.get(
      'https://www.dei.ac.in/index.php?option=com_content&view=article&id=195&Itemid=292',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        httpsAgent,
        timeout: 15000,
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);
    const resultsList = [];

    // Parse all sliders/toggles on the page
    $('.jwts_toggleContent').each((idx, contentEl) => {
      // Find the toggle control title associated with this content box
      const controlEl = $(contentEl).prevAll('.jwts_toggleControlContainer').first();
      let subcategory = controlEl.find('.jwts_toggleControlTitle').text().trim();
      
      // Clean up subcategory symbols like + or - signs
      subcategory = subcategory.replace(/^[+\-\s]+|[+\-\s]+$/g, '').trim();

      // Find the main section heading (e.g. "Results for session 2025-26 Even Semester")
      const headingEl = $(contentEl).prevAll('h3').first();
      let heading = headingEl.text().trim();
      heading = heading.replace(/^[+\-\s]+|[+\-\s]+$/g, '').trim();

      // Construct category tag
      const categoryTag = heading && subcategory 
        ? `${heading} • ${subcategory}`
        : heading || subcategory || 'General Announcements';

      // Fetch all links inside this slider
      $(contentEl).find('a').each((i, linkEl) => {
        const href = $(linkEl).attr('href');
        const text = $(linkEl).text().replace(/\s+/g, ' ').trim();

        if (href && (href.toLowerCase().includes('.pdf') || href.toLowerCase().includes('result'))) {
          let absoluteUrl = href;
          if (!href.startsWith('http://') && !href.startsWith('https://')) {
            const cleanHref = href.startsWith('/') ? href.slice(1) : href;
            absoluteUrl = `https://www.dei.ac.in/${cleanHref}`;
          }

          if (text.length > 2 && !resultsList.some(r => r.url === absoluteUrl)) {
            resultsList.push({
              title: text,
              url: absoluteUrl,
              category: categoryTag
            });
          }
        }
      });
    });

    // Also fallback to fetch any links that are not in sliders
    $('.item-page a').each((i, linkEl) => {
      const href = $(linkEl).attr('href');
      const text = $(linkEl).text().replace(/\s+/g, ' ').trim();

      if (href && (href.toLowerCase().includes('.pdf') || href.toLowerCase().includes('result'))) {
        let absoluteUrl = href;
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
          const cleanHref = href.startsWith('/') ? href.slice(1) : href;
          absoluteUrl = `https://www.dei.ac.in/${cleanHref}`;
        }

        if (text.length > 2 && !resultsList.some(r => r.url === absoluteUrl)) {
          // Find nearest preceding heading
          const headingEl = $(linkEl).prevAll('h3').first();
          let heading = headingEl.text().trim().replace(/^[+\-\s]+|[+\-\s]+$/g, '').trim();
          
          resultsList.push({
            title: text,
            url: absoluteUrl,
            category: heading || 'General Announcements'
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
