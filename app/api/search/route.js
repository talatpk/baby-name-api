import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// List of user agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: 'Name parameter is required' },
                { status: 400 }
            );
        }

        let searchResults = null;
        let errorDetails = '';

        // METHOD 1: Try the Internal API
        try {
            const searchApiUrl = `https://babynamemeaningz.com/search.php?action=search&query=${encodeURIComponent(name)}&gender=&offset=0&limit=20`;
            console.log(`Attempting Method 1 (API): ${searchApiUrl}`);

            // Random delay
            await delay(Math.floor(Math.random() * 300) + 100);

            const response = await axios.get(searchApiUrl, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://babynamemeaningz.com/',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                timeout: 5000
            });

            if (typeof response.data === 'object' && response.data.results) {
                searchResults = response.data;
                console.log('Method 1 success');
            } else {
                throw new Error('Invalid API response');
            }
        } catch (e) {
            console.log('Method 1 failed:', e.message);
            errorDetails += `Method 1: ${e.message}; `;
        }

        // METHOD 2: Fallback to HTML Scraping if Method 1 failed
        if (!searchResults) {
            try {
                const searchHtmlUrl = `https://babynamemeaningz.com/search.php?search=${encodeURIComponent(name)}`;
                console.log(`Attempting Method 2 (HTML): ${searchHtmlUrl}`);

                await delay(Math.floor(Math.random() * 500) + 200);

                const response = await axios.get(searchHtmlUrl, {
                    headers: {
                        'User-Agent': getRandomUserAgent(),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.google.com/',
                    },
                    timeout: 8000
                });

                const $ = cheerio.load(response.data);
                const results = [];

                // Try to find results in the HTML
                // Note: This depends on the site returning server-side rendered HTML
                // If it's purely client-side, this might fail, but it's worth a shot as a fallback
                $('a').each((i, elem) => {
                    const href = $(elem).attr('href');
                    const text = $(elem).text().trim();

                    // Look for likely result links
                    if (href && (href.includes('/girl/') || href.includes('/boy/')) &&
                        text.toLowerCase().includes(name.toLowerCase())) {

                        // Extract basic info if possible
                        const parent = $(elem).closest('div');
                        const meaning = parent.text().match(/Meaning:?\s*([^.\n]+)/i)?.[1] || 'N/A';

                        results.push({
                            name: text,
                            gender: href.includes('/girl/') ? 'Girl' : 'Boy',
                            url: href.startsWith('http') ? href : `https://babynamemeaningz.com/${href.replace(/^\//, '')}`,
                            meaning: meaning,
                            origin: 'N/A', // Hard to extract from list view reliably
                            religion: 'N/A'
                        });
                    }
                });

                if (results.length > 0) {
                    searchResults = { results: results };
                    console.log('Method 2 success');
                } else {
                    // Check for "name-card" class which we saw earlier
                    $('a.name-card').each((i, elem) => {
                        const href = $(elem).attr('href');
                        const nameText = $(elem).find('h3').text().trim();

                        if (href && nameText) {
                            results.push({
                                name: nameText,
                                gender: href.includes('/girl/') ? 'Girl' : 'Boy',
                                url: href.startsWith('http') ? href : `https://babynamemeaningz.com/${href.replace(/^\//, '')}`,
                                meaning: $(elem).find('p').text().trim() || 'N/A',
                                origin: $(elem).find('span').first().text().trim() || 'N/A',
                                religion: 'N/A'
                            });
                        }
                    });

                    if (results.length > 0) {
                        searchResults = { results: results };
                        console.log('Method 2 success (name-card)');
                    }
                }

            } catch (e) {
                console.log('Method 2 failed:', e.message);
                errorDetails += `Method 2: ${e.message}`;
            }
        }

        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            return NextResponse.json(
                {
                    error: 'No results found for this name',
                    debug: errorDetails
                },
                { status: 404 }
            );
        }

        // Process the first result
        const firstResult = searchResults.results[0];

        // Normalize the data
        const nameData = {
            name: firstResult.name || name,
            url: firstResult.url, // Keep the URL for internal use but don't display it in UI if not needed
            gender: firstResult.gender || 'N/A',
            origin: firstResult.origin || 'N/A',
            religion: firstResult.religion || 'N/A',
            meaning: firstResult.meaning || firstResult.u_mean || 'N/A',
            howToWrite: firstResult.translated_names || firstResult.urdu || firstResult.name_urdu || 'N/A',
            syllables: 'N/A',
            luckyNumber: firstResult.lucky_no || firstResult.lucky_number || 'N/A',
            luckyColor: firstResult.lucky_color || 'N/A',
            luckyDay: firstResult.lucky_day || 'N/A',
            luckyMetal: firstResult.lucky_metal || 'N/A',
            luckyStone: firstResult.lucky_stone || 'N/A',
        };

        // Add similar names
        if (searchResults.results.length > 1) {
            nameData.similarNames = searchResults.results.slice(1, 11).map(n => n.name);
        }

        return NextResponse.json({
            success: true,
            data: nameData
        });

    } catch (error) {
        console.error('Error scraping name data:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch name data',
                details: error.message
            },
            { status: 500 }
        );
    }
}
