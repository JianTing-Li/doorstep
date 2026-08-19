// Data fetched dynamically from the remote feature/mock-data branch
let DB_LISTINGS = [];
let DB_PROVIDERS = [];
let DB_SERVICE_TYPES = [];

async function initData() {
    const fetchJson = async (file) => {
        const url = `https://raw.githubusercontent.com/JianTing-Li/doorstep/feature/mock-data/mock-data/${file}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${file}`);
        return res.json();
    };

    [DB_LISTINGS, DB_PROVIDERS, DB_SERVICE_TYPES] = await Promise.all([
        fetchJson('listings.json'),
        fetchJson('providers.json'),
        fetchJson('service-types.json')
    ]);
}
