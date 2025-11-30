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

// Function to scrape detailed page
async function scrapeDetailPage(url) {
    try {
        console.log(`Scraping detail page: ${url}`);
        await delay(Math.floor(Math.random() * 500) + 200);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://babynamemeaningz.com/',
            },
            timeout: 8000
        });

        const $ = cheerio.load(response.data);
        const details = {};

        // Extract name
        details.name = $('h1').first().text().trim() || $('title').text().split('-')[0].trim();

        // SPECIFIC EXTRACTION FOR BABYNAMEMEANINGZ.COM using .split-info-row structure
        $('.split-info-row').each((i, elem) => {
            const label = $(elem).find('.split-info-label').text().trim().toLowerCase();
            const value = $(elem).find('.split-info-text').text().trim();

            if (!value || value === '') return;

            if (label.includes('gender')) details.gender = value;
            if (label.includes('origin')) details.origin = value;
            if (label.includes('religion')) details.religion = value;
            if (label.includes('meaning')) details.meaning = value;
            if (label.includes('how to write')) details.howToWrite = value;
            if (label.includes('syllable')) details.syllables = value;
            if (label.includes('lucky number')) details.luckyNumber = value;
            if (label.includes('lucky color') || label.includes('lucky colour')) details.luckyColor = value;
            if (label.includes('lucky day')) details.luckyDay = value;
            if (label.includes('lucky metal')) details.luckyMetal = value;
            if (label.includes('lucky stone')) details.luckyStone = value;
        });

        // Extract meaning from meta description as fallback
        if (!details.meaning) {
            details.meaning = $('meta[name="description"]').attr('content') ||
                $('p:contains("Meaning")').first().text().replace(/Meaning:?/i, '').trim() ||
                $('.meaning').text().trim() || 'N/A';
        }

        // Extract from table/list format (fallback for other sites)
        $('table tr, .info-table tr, .detail-table tr, ul li, .details-list li').each((i, elem) => {
            const text = $(elem).text();
            const label = $(elem).find('td, th, strong, b, .label').first().text().toLowerCase();
            const value = $(elem).find('td').last().text().trim() ||
                text.split(':').pop().trim();

            if (!value || value === label) return;

            if (label.includes('origin') && !details.origin) details.origin = value;
            if (label.includes('religion') && !details.religion) details.religion = value;
            if (label.includes('gender') && !details.gender) details.gender = value;
            if (label.includes('lucky number') && !details.luckyNumber) details.luckyNumber = value;
            if ((label.includes('lucky color') || label.includes('lucky colour')) && !details.luckyColor) details.luckyColor = value;
            if (label.includes('lucky day') && !details.luckyDay) details.luckyDay = value;
            if (label.includes('lucky metal') && !details.luckyMetal) details.luckyMetal = value;
            if ((label.includes('lucky stone') || label.includes('lucky stones')) && !details.luckyStone) details.luckyStone = value;
            if (label.includes('syllable') && !details.syllables) details.syllables = value;
            if ((label.includes('urdu') || label.includes('arabic') || label.includes('script')) && !details.howToWrite) {
                details.howToWrite = value;
            }
        });

        // Extract similar names from sections with "similar" heading
        const similarNames = [];
        $('h2, h3, h4, h5').each((i, headingElem) => {
            const headingText = $(headingElem).text().toLowerCase();

            if (headingText.includes('similar') || headingText.includes('related')) {
                // Get the parent container
                const container = $(headingElem).parent();

                // Find all links within the container and siblings
                container.find('a').each((i, linkElem) => {
                    const href = $(linkElem).attr('href');
                    const nameText = $(linkElem).text().trim();

                    if (href && (href.includes('/girl/') || href.includes('/boy/')) &&
                        nameText.length > 1 && nameText.length < 30 &&
                        !similarNames.includes(nameText)) {
                        similarNames.push(nameText);
                    }
                });

                // Also check next elements after the heading
                $(headingElem).nextAll().slice(0, 5).find('a').each((i, linkElem) => {
                    const href = $(linkElem).attr('href');
                    const nameText = $(linkElem).text().trim();

                    if (href && (href.includes('/girl/') || href.includes('/boy/')) &&
                        nameText.length > 1 && nameText.length < 30 &&
                        !similarNames.includes(nameText)) {
                        similarNames.push(nameText);
                    }
                });
            }
        });

        if (similarNames.length > 0) {
            details.similarNames = similarNames.slice(0, 10);
        }

        // Extract how to write (Arabic/Urdu script) if not already found
        if (!details.howToWrite || details.howToWrite === 'N/A') {
            const scripts = [];
            $('.split-info-text, span, div').each((i, elem) => {
                const text = $(elem).text().trim();
                // Detect Arabic/Urdu script (right-to-left Unicode range)
                if (text && /[\u0600-\u06FF\u0750-\u077F]/.test(text) && text.length < 50) {
                    // Make sure it's mostly Arabic text
                    const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length;
                    if (arabicChars > text.length / 2) {
                        scripts.push(text);
                    }
                }
            });
            if (scripts.length > 0) {
                details.howToWrite = scripts[0];
            }
        }

        return details;
    } catch (error) {
        console.error('Error scraping detail page:', error.message);
        return null;
    }
}

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
                $('a').each((i, elem) => {
                    const href = $(elem).attr('href');
                    const text = $(elem).text().trim();

                    // Look for likely result links
                    if (href && (href.includes('/girl/') || href.includes('/boy/')) &&
                        text.toLowerCase().includes(name.toLowerCase())) {

                        results.push({
                            name: text,
                            gender: href.includes('/girl/') ? 'Girl' : 'Boy',
                            url: href.startsWith('http') ? href : `https://babynamemeaningz.com${href.startsWith('/') ? '' : '/'}${href}`,
                        });
                    }
                });

                if (results.length > 0) {
                    searchResults = { results: results };
                    console.log('Method 2 success');
                } else {
                    // Check for "name-card" class
                    $('a.name-card').each((i, elem) => {
                        const href = $(elem).attr('href');
                        const nameText = $(elem).find('h3').text().trim();

                        if (href && nameText) {
                            results.push({
                                name: nameText,
                                gender: href.includes('/girl/') ? 'Girl' : 'Boy',
                                url: href.startsWith('http') ? href : `https://babynamemeaningz.com${href.startsWith('/') ? '' : '/'}${href}`,
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
            // METHOD 3: Try direct URL construction as last resort
            try {
                console.log('Attempting Method 3 (Direct URL)');
                const nameLower = name.toLowerCase().replace(/\s+/g, '-');

                // Try both girl and boy URLs
                const urlsToTry = [
                    `https://babynamemeaningz.com/girl/${nameLower}.html`,
                    `https://babynamemeaningz.com/boy/${nameLower}.html`
                ];

                for (const testUrl of urlsToTry) {
                    try {
                        console.log(`Trying direct URL: ${testUrl}`);
                        await delay(Math.floor(Math.random() * 300) + 100);

                        const response = await axios.head(testUrl, {
                            headers: {
                                'User-Agent': getRandomUserAgent(),
                            },
                            timeout: 5000
                        });

                        if (response.status === 200) {
                            // URL exists, create a fake search result
                            const gender = testUrl.includes('/girl/') ? 'Girl' : 'Boy';
                            searchResults = {
                                results: [{
                                    name: name,
                                    url: testUrl,
                                    gender: gender
                                }]
                            };
                            console.log(`Method 3 success: Found ${gender} name`);
                            break;
                        }
                    } catch (e) {
                        // URL doesn't exist,continue to next
                        continue;
                    }
                }

                if (!searchResults) {
                    errorDetails += 'Method 3: No direct URL match found';
                }
            } catch (e) {
                console.log('Method 3 failed:', e.message);
                errorDetails += `Method 3: ${e.message}`;
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

        // Get basic data from search result
        let nameData = {
            name: firstResult.name || name,
            url: firstResult.url || null,
            gender: firstResult.gender || 'N/A',
            origin: firstResult.origin || 'N/A',
            religion: firstResult.religion || 'N/A',
            meaning: firstResult.meaning || firstResult.u_mean || 'N/A',
            howToWrite: firstResult.translated_names || firstResult.urdu || firstResult.name_urdu || 'N/A',
            syllables: firstResult.syllables || 'N/A',
            luckyNumber: firstResult.lucky_no || firstResult.lucky_number || 'N/A',
            luckyColor: firstResult.lucky_color || 'N/A',
            luckyDay: firstResult.lucky_day || 'N/A',
            luckyMetal: firstResult.lucky_metal || 'N/A',
            luckyStone: firstResult.lucky_stone || 'N/A',
            similarNames: []
        };

        // Construct URL if not provided
        if (!nameData.url && nameData.name && nameData.gender && nameData.gender !== 'N/A') {
            const nameLower = nameData.name.toLowerCase().replace(/\s+/g, '-');
            const genderPath = nameData.gender.toLowerCase() === 'girl' ? 'girl' : 'boy';
            nameData.url = `https://babynamemeaningz.com/${genderPath}/${nameLower}.html`;
        }

        // If we have a URL, scrape the detail page for complete information
        if (nameData.url) {
            const detailData = await scrapeDetailPage(nameData.url);

            if (detailData) {
                // Merge detail data with search result data (detail data takes precedence)
                nameData = {
                    name: detailData.name || nameData.name,
                    url: firstResult.url,
                    gender: detailData.gender || nameData.gender,
                    origin: detailData.origin || nameData.origin,
                    religion: detailData.religion || nameData.religion,
                    meaning: detailData.meaning || nameData.meaning,
                    howToWrite: detailData.howToWrite || nameData.howToWrite,
                    syllables: detailData.syllables || nameData.syllables,
                    luckyNumber: detailData.luckyNumber || nameData.luckyNumber,
                    luckyColor: detailData.luckyColor || nameData.luckyColor,
                    luckyDay: detailData.luckyDay || nameData.luckyDay,
                    luckyMetal: detailData.luckyMetal || nameData.luckyMetal,
                    luckyStone: detailData.luckyStone || nameData.luckyStone,
                    similarNames: detailData.similarNames || []
                };
            }
        }

        // Add similar names from search results if we don't have any
        if (nameData.similarNames.length === 0 && searchResults.results.length > 1) {
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
