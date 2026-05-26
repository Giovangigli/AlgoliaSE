const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const listPath = path.join(ROOT, 'dataset', 'restaurants_list.json');
const infoPath = path.join(ROOT, 'dataset', 'restaurants_info.csv');
const outDir = path.join(ROOT, 'output');
const outPath = path.join(outDir, 'restaurants.json');

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ';' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }

  values.push(value.trim());
  return values;
}

function readInfoByObjectId() {
  const raw = fs.readFileSync(infoPath, 'utf8').trim();
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift());
  const byId = new Map();

  for (const line of lines) {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));

    byId.set(String(row.objectID), {
      food_type: row.food_type || 'Restaurant',
      stars_count: Number.parseFloat(row.stars_count) || 0,
      reviews_count: Number.parseInt(row.reviews_count, 10) || 0,
      neighborhood: row.neighborhood || '',
      phone_number: row.phone_number || '',
      price_range: row.price_range || '',
      dining_style: row.dining_style || ''
    });
  }

  return byId;
}

function normalizePaymentOptions(options = []) {
  return options
    .map((option) => {
      if (option === 'AMEX') return 'American Express';
      if (option === 'Diners Club' || option === 'Carte Blanche') return 'Discover';
      return option;
    })
    .filter((option) => ['American Express', 'Visa', 'Discover', 'MasterCard'].includes(option));
}

function getPriceLevel(priceRange, price) {
  if (price) return Number(price);
  if (!priceRange) return 0;
  if (priceRange.includes('$30 and under')) return 1;
  if (priceRange.includes('$31 to $50')) return 2;
  return 3;
}

function buildExperienceTags(restaurant) {
  const tags = [];
  const food = String(restaurant.food_type || '').toLowerCase();
  const style = String(restaurant.dining_style || '').toLowerCase();
  const price = String(restaurant.price_range || '');
  const rating = Number(restaurant.stars_count || 0);
  const reviews = Number(restaurant.reviews_count || 0);

  if (price.includes('$31 to $50') || price.includes('$50') || style.includes('fine')) {
    tags.push('date night', 'romantic', 'special occasion');
  }

  if (
    food.includes('wine') ||
    style.includes('wine') ||
    food.includes('bar') ||
    style.includes('bar')
  ) {
    tags.push('wine bar', 'drinks');
  }

  if (rating >= 4.5 && reviews >= 75) {
    tags.push('top rated', 'popular');
  }

  if (rating >= 4.4 && reviews > 0 && reviews <= 90) {
    tags.push('hidden gem');
  }

  if (price.includes('$30 and under')) {
    tags.push('casual', 'cheap eats');
  }

  if (
    food.includes('breakfast') ||
    food.includes('brunch') ||
    style.includes('brunch')
  ) {
    tags.push('brunch');
  }

  return [...new Set(tags)];
}

function main() {
  const restaurants = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  const infoById = readInfoByObjectId();

  const enriched = restaurants.map((restaurant) => {
    const info = infoById.get(String(restaurant.objectID)) || {};
    const stars = Number(info.stars_count || 0);
    const reviews = Number(info.reviews_count || 0);
    const priceLevel = getPriceLevel(info.price_range, restaurant.price);

    const record = {
      ...restaurant,
      ...info,
      objectID: String(restaurant.objectID),
      payment_options: normalizePaymentOptions(restaurant.payment_options),
      price_level: priceLevel,
      is_top_rated: stars >= 4.5 && reviews >= 75,
      is_hidden_gem: stars >= 4.4 && reviews > 0 && reviews <= 90,
      discovery_score: Math.round((stars * 20) + Math.min(reviews, 500) / 10)
    };

    record.experience_tags = buildExperienceTags(record);
    return record;
  });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(enriched, null, 2));

  const tagged = enriched.filter((record) => record.experience_tags.length).length;
  console.log(`Prepared ${enriched.length} restaurant records at ${outPath}`);
  console.log(`Added experience tags to ${tagged} records`);
}

main();
