import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Baby Name API - Scrapes data from babynamemeaningz.com',
    version: '1.0.0',
    endpoints: {
      search: {
        path: '/api/search',
        method: 'GET',
        description: 'Search for a baby name and get its meaning, origin, and other details',
        parameters: {
          name: {
            type: 'string',
            required: true,
            description: 'The baby name to search for'
          }
        },
        example: '/api/search?name=Emma'
      }
    },
    usage: {
      example: 'GET /api/search?name=Emma',
      response: {
        success: true,
        data: {
          name: 'Emma',
          url: 'https://babynamemeaningz.com/girl/emma.html',
          gender: 'Girl',
          origin: 'Persian',
          religion: 'Christian',
          meaning: 'Signifies universal',
          howToWrite: 'إما',
          syllables: '2',
          luckyNumber: '5',
          luckyColor: 'Blue',
          luckyDay: 'Friday',
          luckyMetal: 'Silver',
          luckyStone: 'Sapphire',
          similarNames: ['Emmalyn', 'Emmie', 'Emme']
        }
      }
    }
  });
}
