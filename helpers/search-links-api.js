import axios from "axios";
import {API_KEYS} from "../constants.js"

async function searchLinksFromDomain(domainObj, topic) {
  const query = `${topic} site:${domainObj.search}`;

  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        engine: 'google',
        hl: 'uk',
        api_key: API_KEYS.serpApi
      },
      timeout: 10000
    });

    const organicResults = response.data.organic_results || [];

    const filtered = organicResults.filter(r =>
      r.link && r.link.includes(domainObj.filter)
    );

    return filtered.slice(0, 1).map(result => result.link);
  } catch (error) {
    console.error(`Помилка з доменом ${domainObj.search}:`, error.message);
    return [];
  }
}

export async function searchLinks(domains, topic) {
  const allResults = await Promise.all(
    domains.map(domain => searchLinksFromDomain(domain, topic))
  );

  const flatLinks = allResults.flat();

  console.log('🔗 Знайдені посилання:', flatLinks);
  return flatLinks;
}