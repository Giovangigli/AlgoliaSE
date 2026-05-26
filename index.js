

const APP_ID = 'PYR170J174';
const SEARCH_API_KEY = '6a5c8d1640aa86a80b6821bfaa1b6f7b';
const INDEX_NAME = 'restaurants';

const DEFAULT_LOCATION = {
  lat: 37.7749,
  lng: -122.4194,
  label: 'San Francisco fallback'
};

const CUISINE_IMAGES = [
  {
    match: ['italian', 'pizza', 'pasta'],
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['sushi', 'japanese'],
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['french'],
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['seafood', 'fish'],
    url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['steak', 'steakhouse', 'grill'],
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['mexican', 'latin', 'spanish'],
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['indian'],
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['chinese', 'asian', 'thai', 'vietnamese'],
    url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['breakfast', 'brunch', 'cafe'],
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80'
  },
  {
    match: ['bar', 'wine', 'pub'],
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'
  }
];

const DEFAULT_RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

const client = algoliasearch(APP_ID, SEARCH_API_KEY);
const helper = algoliasearchHelper(client, INDEX_NAME, {
  hitsPerPage: 12,
  disjunctiveFacets: ['food_type', 'experience_tags'],
  aroundRadius: 'all',
  getRankingInfo: true
});

const state = {
  mode: 'nearby',
  location: DEFAULT_LOCATION,
  hasBrowserLocation: false
};

const els = {
  input: document.querySelector('#search-input'),
  results: document.querySelector('#results'),
  facets: document.querySelector('#cuisine-facets'),
  meta: document.querySelector('#results-meta'),
  title: document.querySelector('#results-title'),
  geoStatus: document.querySelector('#geo-status'),
  clearFilters: document.querySelector('#clear-filters')
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function formatDistance(hit) {
  const meters = hit?._rankingInfo?.geoDistance;
  if (typeof meters !== 'number') return null;
  return meters < 1000
    ? `${Math.round(meters)}m away`
    : `${(meters / 1000).toFixed(1)}km away`;
}

function getModeLabel(mode) {
  return {
    nearby: 'Restaurants near you',
    topRated: 'Top rated restaurants',
    hiddenGems: 'Hidden gems nearby'
  }[mode] || 'Restaurants near you';
}

function explainHit(hit) {
  const reasons = [];
  const distance = formatDistance(hit);

  if (distance) reasons.push(distance);
  if (hit.food_type) reasons.push(`Matches ${hit.food_type}`);
  if (Array.isArray(hit.experience_tags) && hit.experience_tags.length) {
    reasons.push(`Intent signals: ${hit.experience_tags.slice(0, 2).join(', ')}`);
  }
  if (hit.stars_count) {
    reasons.push(`${hit.stars_count} stars from ${hit.reviews_count || 0} reviews`);
  }

  if (state.mode === 'hiddenGems') {
    reasons.push('High rating with lower review volume');
  } else if (state.mode === 'topRated') {
    reasons.push('Prioritized by rating confidence');
  } else {
    reasons.push('Prioritized by proximity and relevance');
  }

  return reasons.slice(0, 4);
}

function normalizeHits(hits = []) {
  const copy = [...hits];

  if (state.mode === 'topRated') {
    return copy.sort((a, b) =>
      (b.stars_count || 0) - (a.stars_count || 0) ||
      (b.reviews_count || 0) - (a.reviews_count || 0)
    );
  }

  if (state.mode === 'hiddenGems') {
    return copy.sort((a, b) =>
      Number(Boolean(b.is_hidden_gem)) - Number(Boolean(a.is_hidden_gem)) ||
      (b.stars_count || 0) - (a.stars_count || 0) ||
      (a.reviews_count || 0) - (b.reviews_count || 0)
    );
  }

  return copy;
}

function getImageUrl(hit) {
  const existingUrl = hit.image_url || hit.image || hit.picture_url;

  if (existingUrl && existingUrl.startsWith('https://')) {
    return existingUrl;
  }

  const cuisine = String(hit.food_type || '').toLowerCase();
  const diningStyle = String(hit.dining_style || '').toLowerCase();
  const searchableText = `${cuisine} ${diningStyle}`;

  const match = CUISINE_IMAGES.find((item) =>
    item.match.some((keyword) => searchableText.includes(keyword))
  );

  return match?.url || DEFAULT_RESTAURANT_IMAGE;
}

function renderResults(results) {
  const hits = normalizeHits(Array.isArray(results?.hits) ? results.hits : []);

  els.title.textContent = getModeLabel(state.mode);
  els.meta.textContent = `${results?.nbHits?.toLocaleString?.() || 0} restaurants · ${results?.processingTimeMS || 0}ms · ${state.hasBrowserLocation ? 'browser location' : state.location.label}`;

  if (!hits.length) {
    els.results.innerHTML = `
      <div class="empty-state">
        No restaurants found. Try “sushi”, “date night”, “wine bar”, “italian”, or remove a filter.
      </div>
    `;
    return;
  }

  els.results.innerHTML = hits.map((hit) => {
    const explanations = explainHit(hit)
      .map((reason) => `<li>${escapeHtml(reason)}</li>`)
      .join('');

    const imageUrl = getImageUrl(hit);
    const image = imageUrl
      ? `
        <img
          src="${escapeHtml(imageUrl)}"
          alt="${escapeHtml(hit.name || 'Restaurant')}"
          loading="lazy"
          onerror="this.parentElement.classList.add('card__image--empty'); this.remove();"
        />
      `
      : '';

    const highlightedName = hit?._highlightResult?.name?.value || escapeHtml(hit.name || 'Restaurant');
    const tags = Array.isArray(hit.experience_tags) && hit.experience_tags.length
      ? `<div class="tag-row">${hit.experience_tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>`
      : '';

    return `
      <article class="card">
        <div class="card__image ${imageUrl ? '' : 'card__image--empty'}">
          ${image}
          <div class="card__placeholder">${escapeHtml((hit.name || 'R').slice(0, 1))}</div>
        </div>

        <div class="card__body">
          <div class="card__topline">
            <span>${escapeHtml(hit.food_type || 'Restaurant')}</span>
            <span>${escapeHtml(hit.price_range || '')}</span>
          </div>

          <h3>${highlightedName}</h3>

          <p class="card__details">
            ${escapeHtml(hit.neighborhood || hit.city || '')}
            ·
            ${escapeHtml(hit.dining_style || 'Dining')}
          </p>

          ${tags}

          <div class="rating">
            ★ ${escapeHtml(hit.stars_count || 'N/A')}
            <span>(${escapeHtml(hit.reviews_count || 0)} reviews)</span>
          </div>

          <details class="why">
            <summary>Why this result?</summary>
            <ul>${explanations}</ul>
          </details>

          <a
            class="reserve"
            href="${escapeHtml(hit.reserve_url || '#')}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Reserve
          </a>
        </div>
      </article>
    `;
  }).join('');
}

function renderFacets(results) {
  const facetValues =
    results?.disjunctiveFacets?.find((facet) => facet.name === 'food_type')?.data || {};

  const selectedValues =
    helper.state.disjunctiveFacetsRefinements.food_type || [];

  const entries = Object.entries(facetValues);

  const selectedEntries = selectedValues.map((name) => [
    name,
    facetValues[name] || 0
  ]);

  const unselectedEntries = entries
    .filter(([name]) => !selectedValues.includes(name))
    .sort((a, b) => b[1] - a[1]);

  const values = [...selectedEntries, ...unselectedEntries].slice(0, 8);

  els.facets.innerHTML = values.map(([name, count]) => {
    const isRefined = selectedValues.includes(name);

    return `
      <button
        type="button"
        class="facet ${isRefined ? 'is-active' : ''}"
        data-cuisine="${escapeHtml(name)}"
        aria-pressed="${isRefined}"
      >
        <span>${escapeHtml(name)}</span>
        <span>${count}</span>
      </button>
    `;
  }).join('');
}

function applyMode(mode) {
  state.mode = mode;

  document.querySelectorAll('.mode-tab').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === mode);
  });

  helper.setQueryParameter('numericFilters', []);

  if (mode === 'topRated') {
    helper.setQueryParameter('numericFilters', [
      'stars_count>=4.5',
      'reviews_count>=75'
    ]);
  }

  if (mode === 'hiddenGems') {
    helper.setQueryParameter('numericFilters', [
      'stars_count>=4.4',
      'reviews_count<=90',
      'reviews_count>0'
    ]);
  }

  helper.search();
}

function applyQuery(query) {
  els.input.value = query;
  helper.setQuery(query).search();
}

function applyLocation(location, fromBrowser = false) {
  state.location = location;
  state.hasBrowserLocation = fromBrowser;

  els.geoStatus.textContent = fromBrowser
    ? 'Using your location'
    : `Using ${location.label}`;

  helper
    .setQueryParameter('aroundLatLng', `${location.lat}, ${location.lng}`)
    .search();
}

helper.on('result', ({ results }) => {
  renderFacets(results);
  renderResults(results);
});

helper.on('error', (error) => {
  console.error('Algolia error:', error);
  els.results.innerHTML = `
    <div class="empty-state">
      Search error: ${escapeHtml(error.message || 'Unknown error')}
    </div>
  `;
});

els.input.addEventListener('input', (event) => {
  helper.setQuery(event.currentTarget.value).search();
});

document.addEventListener('click', (event) => {
  const modeButton = event.target.closest('[data-mode]');
  if (modeButton) applyMode(modeButton.dataset.mode);

  const cuisineButton = event.target.closest('[data-cuisine]');
  if (cuisineButton) {
    helper.toggleFacetRefinement('food_type', cuisineButton.dataset.cuisine).search();
  }

  const quickButton = event.target.closest('[data-quick]');
  if (quickButton) applyMode(quickButton.dataset.quick);

  const queryButton = event.target.closest('[data-query]');
  if (queryButton) applyQuery(queryButton.dataset.query);
});

els.clearFilters.addEventListener('click', () => {
  els.input.value = '';
  state.mode = 'nearby';

  document.querySelectorAll('.mode-tab').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.mode === 'nearby');
  });

  helper
    .setQuery('')
    .clearRefinements('food_type')
    .setQueryParameter('numericFilters', [])
    .search();
});

if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      applyLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        label: 'browser location'
      }, true);
    },
    () => applyLocation(DEFAULT_LOCATION, false),
    {
      timeout: 2500,
      maximumAge: 300000
    }
  );
} else {
  applyLocation(DEFAULT_LOCATION, false);
}
