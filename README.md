# Baby Name API

A web scraping API that fetches baby name information. This API can be deployed to Vercel and returns data in JSON format.

## Features

- 🎨 **Beautiful Frontend**: Interactive search interface with glassmorphism design
- 🔍 **Powerful API**: Search for baby names programmatically
- 📊 **Detailed Information**:
  - Name meaning
  - Origin
  - Religion
  - Gender
  - Lucky numbers, colors, days, metals, and stones
  - Similar names
  - How to write the name (in other scripts)
- 🚀 **Ready to deploy**: Pre-configured for Vercel
- 📦 **Clean JSON**: API returns structured data

## Usage

### Live Demo
- **Web Interface**: [https://baby-name-api.vercel.app](https://baby-name-api.vercel.app) (or check your Vercel dashboard for the exact domain)
- **GitHub Repo**: [https://github.com/talatpk/baby-name-api](https://github.com/talatpk/baby-name-api)

### Web Interface
Visit the root URL to use the interactive search.

### API Endpoints

#### GET /api/docs
Returns API documentation and usage information.

#### GET /api/search?name={name}
Search for a baby name and get its details.

**Parameters:**
- `name` (required): The baby name to search for

**Example Request:**
```bash
curl https://your-domain.vercel.app/api/search?name=Emma
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "name": "Emma",
    "url": "https://babynamemeaningz.com/girl/emma.html",
    "gender": "Girl",
    "origin": "Persian",
    "religion": "Christian",
    "meaning": "Signifies universal",
    "howToWrite": "إما",
    "syllables": "2",
    "luckyNumber": "5",
    "luckyColor": "Blue",
    "luckyDay": "Friday",
    "luckyMetal": "Silver",
    "luckyStone": "Sapphire",
    "similarNames": ["Emmalyn", "Emmie", "Emme", "Emmalynn"]
  }
}
```

**Error Response:**
```json
{
  "error": "No results found for this name"
}
```

## Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

3. **Test the API:**
```bash
# Visit http://localhost:3000/ for documentation
# Visit http://localhost:3000/api/search?name=Emma to test
```

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd baby-name-api
vercel
```

3. **Follow the prompts:**
   - Login to your Vercel account
   - Select or create a project
   - Deploy!

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/baby-name-api.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy!

### Option 3: Deploy with One Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/baby-name-api)

## Usage Examples

### JavaScript (Fetch API)
```javascript
async function searchBabyName(name) {
  const response = await fetch(`https://your-domain.vercel.app/api/search?name=${name}`);
  const data = await response.json();
  return data;
}

searchBabyName('Emma').then(data => console.log(data));
```

### Python
```python
import requests

def search_baby_name(name):
    url = f"https://your-domain.vercel.app/api/search?name={name}"
    response = requests.get(url)
    return response.json()

result = search_baby_name('Emma')
print(result)
```

### cURL
```bash
curl "https://your-domain.vercel.app/api/search?name=Emma"
```

## Project Structure

```
baby-name-api/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.js      # Main search endpoint
│   └── route.js              # Documentation endpoint
├── package.json
├── vercel.json
└── README.md
```

## Technologies Used

- **Next.js 16**: Modern React framework with API routes
- **Axios**: HTTP client for making requests
- **Cheerio**: Fast HTML parser and web scraper
- **Vercel**: Serverless deployment platform

## Notes

- This API scrapes data from babynamemeaningz.com
- Rate limiting may apply based on the source website
- For production use, consider implementing caching
- The scraper may need updates if the source website structure changes

## License

MIT

## Author

Created for scraping baby name information from babynamemeaningz.com
