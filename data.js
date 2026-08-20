// Data loaded locally from the project directory
let DB_LISTINGS = [];
let DB_PROVIDERS = [];
let DB_SERVICE_TYPES = [];

async function initData() {
    const fetchJson = async (file) => {
        const url = `./mock-data/${file}`;
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
