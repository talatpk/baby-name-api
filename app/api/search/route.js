import axios from 'axios';
import { NextResponse } from 'next/server';

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

        // Step 1: Search for the name using the internal API
        const searchApiUrl = `https://babynamemeaningz.com/search.php?action=search&query=${encodeURIComponent(name)}&gender=&offset=0&limit=20`;

        console.log(`Fetching: ${searchApiUrl}`);

        const searchResponse = await axios.get(searchApiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://babynamemeaningz.com/',
                'X-Requested-With': 'XMLHttpRequest',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"macOS"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            },
            timeout: 8000 // 8 second timeout
        });

        // The API returns JSON data with name results
        const searchResults = searchResponse.data;

        // Log the response type for debugging
        console.log('Response type:', typeof searchResults);

        // Check if response is string (sometimes they return HTML on error)
        if (typeof searchResults === 'string' && searchResults.includes('<!DOCTYPE html>')) {
            throw new Error('Target website returned HTML instead of JSON. Request might be blocked.');
        }

        if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            return NextResponse.json(
                { error: 'No results found for this name' },
                { status: 404 }
            );
        }

        // Get the first result
        const firstResult = searchResults.results[0];

        // Build the detail page URL
        const nameSlug = firstResult.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        const gender = firstResult.gender || 'Girl';
        const detailPath = gender === 'Boy'
            ? `boy/${nameSlug}.html`
            : gender === 'Girl'
                ? `girl/${nameSlug}.html`
                : `gender-neutral/${nameSlug}.html`;

        const detailUrl = `https://babynamemeaningz.com/${detailPath}`;

        // Build the response from the search result data
        const nameData = {
            name: firstResult.name || name,
            url: detailUrl,
            gender: firstResult.gender || 'N/A',
            origin: firstResult.origin || 'N/A',
            religion: firstResult.religion || 'N/A',
            meaning: firstResult.meaning || firstResult.u_mean || 'N/A',
            howToWrite: firstResult.translated_names || 'N/A',
            syllables: 'N/A',
            luckyNumber: firstResult.lucky_no || firstResult.lucky_number || 'N/A',
            luckyColor: firstResult.lucky_color || 'N/A',
            luckyDay: firstResult.lucky_day || 'N/A',
            luckyMetal: firstResult.lucky_metal || 'N/A',
            luckyStone: firstResult.lucky_stone || 'N/A',
        };

        // Add similar names if available
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
