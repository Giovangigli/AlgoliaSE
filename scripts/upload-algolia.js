require('dotenv').config();

const fs = require('fs');
const path = require('path');
const algoliasearch = require('algoliasearch');

const appId = process.env.ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME || 'restaurants';

if (!appId || !adminKey) {
  throw new Error('Missing ALGOLIA_APP_ID or ALGOLIA_ADMIN_API_KEY. Copy .env.example to .env and fill it locally.');
}

const recordsPath = path.join(__dirname, '..', 'output', 'restaurants.json');

if (!fs.existsSync(recordsPath)) {
  throw new Error('Missing output/restaurants.json. Run npm run prepare-data first.');
}

async function main() {
  const client = algoliasearch(appId, adminKey);
  const index = client.initIndex(indexName);
  const records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));

  await index.setSettings({
    searchableAttributes: [
      'name',
      'food_type',
      'experience_tags',
      'dining_style',
      'neighborhood',
      'city',
      'area'
    ],
    attributesForFaceting: [
      'searchable(food_type)',
      'searchable(experience_tags)',
      'payment_options',
      'price_range',
      'dining_style',
      'city',
      'is_top_rated',
      'is_hidden_gem'
    ],
    customRanking: [
      'desc(stars_count)',
      'desc(reviews_count)',
      'asc(price_level)'
    ],
    attributesToHighlight: [
      'name',
      'food_type',
      'experience_tags',
      'dining_style',
      'neighborhood',
      'city'
    ],
    typoTolerance: true
  });

  await index.replaceAllObjects(records, { safe: true });

  console.log(`Uploaded ${records.length} records to ${indexName}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
