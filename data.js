// Data layer for Doorstep App Prototype
let DB_LISTINGS = [];
let DB_PROVIDERS = [];
let DB_SERVICE_TYPES = [];

const FALLBACK_SERVICE_TYPES = [
  { code: "cleaning_standard", label: "Home Cleaning", description: "Regular apartment and house cleaning: kitchens, bathrooms, dusting, floors." },
  { code: "cleaning_deep", label: "Deep Cleaning", description: "Move-in and move-out cleans, post-renovation dust-out, appliance interiors." },
  { code: "handyman_general", label: "Handyman", description: "Furniture assembly, wall mounting, drywall patching, doors and locks." },
  { code: "plumbing", label: "Plumbing", description: "Faucets, drains, leaks, toilets, and under-sink work." },
  { code: "electrical", label: "Electrical", description: "Outlets, switches, light fixtures, and ceiling fans." },
  { code: "moving_help", label: "Moving Help", description: "Loading, unloading, in-building moves, and furniture hauling." },
  { code: "junk_removal", label: "Junk Removal", description: "Furniture, boxes, and garage or basement clearouts." },
  { code: "yard_outdoor", label: "Yard & Outdoor", description: "Lawn care, leaves, gutters, and patio or deck cleanup." }
];

const FALLBACK_PROVIDERS = [
  { provider_id: "prv_001", name: "Marisol Vega", bio: "I have cleaned homes in Northeast Portland for six years. I am picky about kitchens and bathrooms and bring all my own eco-friendly supplies.", rating: 4.9, review_count: 38, location: "Alberta Arts", latitude: 45.55891, longitude: -122.64671, member_since: "2023-09-14", provider_status: "active" },
  { provider_id: "prv_002", name: "Dan Okonkwo", bio: "Former cabinet maker and full-time handyman. Specializing in IKEA assembly, heavy TV mounting, drywall repair, and plumbing fixtures.", rating: 4.8, review_count: 52, location: "Montavilla", latitude: 45.51896, longitude: -122.58447, member_since: "2024-02-03", provider_status: "active" },
  { provider_id: "prv_003", name: "Bright Path Cleaning Co.", bio: "Two-person cleaning crew covering North & NE Portland. Thorough, bonded, and insured with 5-star customer ratings.", rating: 5.0, review_count: 44, location: "Kenton", latitude: 45.58528, longitude: -122.68841, member_since: "2023-11-21", provider_status: "active" },
  { provider_id: "prv_004", name: "Elena Ramos", bio: "Residential cleaning specialist with 8 years experience. Move-in, move-out, deep cleans, and recurring weekly service.", rating: 4.9, review_count: 29, location: "Hawthorne", latitude: 45.51210, longitude: -122.62340, member_since: "2023-08-10", provider_status: "active" },
  { provider_id: "prv_005", name: "Samir Patel", bio: "Master electrician and general home repair expert. Ceiling fans, EV charger installs, smart thermostats, and panel fixes.", rating: 4.9, review_count: 67, location: "Pearl District", latitude: 45.52680, longitude: -122.68210, member_since: "2022-12-05", provider_status: "active" },
  { provider_id: "prv_006", name: "Northwest Haulers", bio: "Moving help and junk removal with a 16-foot box truck and two energetic movers. Packing, loading, and disposal.", rating: 4.7, review_count: 83, location: "Buckman", latitude: 45.51650, longitude: -122.64890, member_since: "2023-04-18", provider_status: "active" },
  { provider_id: "prv_007", name: "Green Thumb Yard Care", bio: "Lawn mowing, seasonal leaf cleanup, gutter clearing, pruning, and pressure washing across the metro area.", rating: 4.8, review_count: 41, location: "Sellwood", latitude: 45.46450, longitude: -122.64920, member_since: "2023-05-30", provider_status: "active" }
];

const FALLBACK_LISTINGS = [
  { listing_id: "lst_001", provider_id: "prv_001", title: "Weekly & Bi-Weekly Apartment Cleaning", listing_description: "Thorough cleaning of 1-2 bedroom apartments. Includes kitchen degreasing, bathroom scrubbing, vacuuming, mopping, and dusting with eco-friendly supplies.", service_type: ["cleaning_standard"], price: 45, price_unit: "hourly", duration_estimate_minutes: 180, provider_location: "Alberta Arts", latitude: 45.56061, longitude: -122.64812, service_radius_miles: 8, rating: 4.9, review_count: 38, availability: ["2026-08-21T09:00:00-07:00", "2026-08-21T13:00:00-07:00", "2026-08-22T10:00:00-07:00", "2026-08-23T14:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_002", provider_id: "prv_001", title: "Deep Move-In / Move-Out Clean", listing_description: "Comprehensive top-to-bottom scrub. Inside oven, refrigerator, baseboards, window sills, grout scrubbing, and full cabinet wipe-down.", service_type: ["cleaning_deep"], price: 150, price_unit: "flat", duration_estimate_minutes: 240, provider_location: "Alberta Arts", latitude: 45.56242, longitude: -122.65050, service_radius_miles: 10, rating: 5.0, review_count: 14, availability: ["2026-08-22T09:00:00-07:00", "2026-08-24T09:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_003", provider_id: "prv_002", title: "Furniture Assembly & TV Mounting", listing_description: "Expert assembly of IKEA, Wayfair, and Target furniture (beds, desks, dressers). Secure drywall and stud TV wall mounting with concealed wires.", service_type: ["handyman_general"], price: 55, price_unit: "hourly", duration_estimate_minutes: 120, provider_location: "Montavilla", latitude: 45.51896, longitude: -122.58447, service_radius_miles: 12, rating: 4.8, review_count: 52, availability: ["2026-08-21T11:00:00-07:00", "2026-08-22T15:00:00-07:00", "2026-08-23T10:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_004", provider_id: "prv_002", title: "Plumbing Fixture Repair & Leaks", listing_description: "Faucet swaps, dripping sink repairs, garbage disposal replacement, and running toilet fixes. Fast and reliable same-day service available.", service_type: ["plumbing"], price: 75, price_unit: "hourly", duration_estimate_minutes: 90, provider_location: "Montavilla", latitude: 45.51950, longitude: -122.58600, service_radius_miles: 10, rating: 4.9, review_count: 22, availability: ["2026-08-21T14:00:00-07:00", "2026-08-22T09:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_005", provider_id: "prv_003", title: "2-Person Sparkling Home Clean", listing_description: "Two experienced cleaners complete your whole house cleaning in half the time. Perfect for busy families and professionals.", service_type: ["cleaning_standard", "cleaning_deep"], price: 80, price_unit: "hourly", duration_estimate_minutes: 120, provider_location: "Kenton", latitude: 45.58528, longitude: -122.68841, service_radius_miles: 15, rating: 5.0, review_count: 44, availability: ["2026-08-21T09:00:00-07:00", "2026-08-22T13:00:00-07:00", "2026-08-24T10:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_006", provider_id: "prv_005", title: "Light Fixture & Ceiling Fan Installation", listing_description: "Safe installation of chandeliers, recessed lighting, ceiling fans, smart dimmers, and bathroom exhaust fans.", service_type: ["electrical", "handyman_general"], price: 70, price_unit: "hourly", duration_estimate_minutes: 90, provider_location: "Pearl District", latitude: 45.52680, longitude: -122.68210, service_radius_miles: 10, rating: 4.9, review_count: 67, availability: ["2026-08-21T10:00:00-07:00", "2026-08-23T13:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_007", provider_id: "prv_006", title: "2 Movers + Box Truck Hauling", listing_description: "Two strong movers with 16ft box truck, dollies, blankets, and straps. Apartment moves, furniture delivery pickup, and storage units.", service_type: ["moving_help"], price: 110, price_unit: "hourly", duration_estimate_minutes: 180, provider_location: "Buckman", latitude: 45.51650, longitude: -122.64890, service_radius_miles: 25, rating: 4.7, review_count: 83, availability: ["2026-08-22T08:00:00-07:00", "2026-08-23T08:00:00-07:00", "2026-08-24T12:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_008", provider_id: "prv_006", title: "Junk Removal & Garage Clearout", listing_description: "We haul away old mattresses, broken appliances, renovation debris, yard waste, and clutter with eco-friendly disposal and recycling.", service_type: ["junk_removal"], price: 95, price_unit: "flat", duration_estimate_minutes: 120, provider_location: "Buckman", latitude: 45.51700, longitude: -122.65000, service_radius_miles: 20, rating: 4.8, review_count: 36, availability: ["2026-08-21T15:00:00-07:00", "2026-08-23T11:00:00-07:00"], listing_status: "active" },
  { listing_id: "lst_009", provider_id: "prv_007", title: "Lawn Mowing & Seasonal Yard Cleanup", listing_description: "Lawn mowing, edge trimming, leaf blowing, hedge trimming, and green waste bag removal. Keep your curb appeal fresh year-round.", service_type: ["yard_outdoor"], price: 50, price_unit: "hourly", duration_estimate_minutes: 90, provider_location: "Sellwood", latitude: 45.46450, longitude: -122.64920, service_radius_miles: 12, rating: 4.8, review_count: 41, availability: ["2026-08-21T09:00:00-07:00", "2026-08-22T14:00:00-07:00"], listing_status: "active" }
];

async function initData() {
    try {
        const fetchJson = async (file) => {
            const res = await fetch(`./mock-data/${file}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        };

        const [listings, providers, serviceTypes] = await Promise.all([
            fetchJson('listings.json'),
            fetchJson('providers.json'),
            fetchJson('service-types.json')
        ]);

        DB_LISTINGS = Array.isArray(listings) && listings.length > 0 ? listings : FALLBACK_LISTINGS;
        DB_PROVIDERS = Array.isArray(providers) && providers.length > 0 ? providers : FALLBACK_PROVIDERS;
        DB_SERVICE_TYPES = Array.isArray(serviceTypes) && serviceTypes.length > 0 ? serviceTypes : FALLBACK_SERVICE_TYPES;
    } catch (e) {
        console.warn("Using local fallback dataset due to fetch error:", e);
        DB_LISTINGS = FALLBACK_LISTINGS;
        DB_PROVIDERS = FALLBACK_PROVIDERS;
        DB_SERVICE_TYPES = FALLBACK_SERVICE_TYPES;
    }
}
