// Doorstep Matching Chatbot Engine (Product C Integration for Product B)
// Ported from JT's Matching Chatbot Architecture

const ChatbotEngine = (() => {
    const MOCK_META = {
        reference_date: "2026-08-31",
        timezone: "America/Los_Angeles"
    };

    const MOCK_NEIGHBORHOODS = [
        { name: "Alberta Arts", latitude: 45.5592, longitude: -122.6468 },
        { name: "Beaumont-Wilshire", latitude: 45.5487, longitude: -122.6174 },
        { name: "Buckman", latitude: 45.5173, longitude: -122.6515 },
        { name: "Division-Clinton", latitude: 45.5048, longitude: -122.6318 },
        { name: "Hawthorne", latitude: 45.5121, longitude: -122.6234 },
        { name: "Hollywood", latitude: 45.5358, longitude: -122.6206 },
        { name: "Irvington", latitude: 45.5412, longitude: -122.6521 },
        { name: "Kenton", latitude: 45.5824, longitude: -122.6865 },
        { name: "Mississippi", latitude: 45.5498, longitude: -122.6756 },
        { name: "Montavilla", latitude: 45.5186, longitude: -122.5732 },
        { name: "Multnomah Village", latitude: 45.4674, longitude: -122.7142 },
        { name: "Nob Hill", latitude: 45.5298, longitude: -122.6954 },
        { name: "Northwest District", latitude: 45.5322, longitude: -122.6998 },
        { name: "Pearl District", latitude: 45.5284, longitude: -122.6812 },
        { name: "Richmond", latitude: 45.5024, longitude: -122.6162 },
        { name: "Sellwood-Moreland", latitude: 45.4645, longitude: -122.6482 },
        { name: "South Waterfront", latitude: 45.4982, longitude: -122.6712 },
        { name: "St. Johns", latitude: 45.5892, longitude: -122.7538 },
        { name: "Sunnyside", latitude: 45.5142, longitude: -122.6284 },
        { name: "Woodstock", latitude: 45.4792, longitude: -122.6082 }
    ];

    const SYNONYMS_BY_CODE = {
        cleaning_standard: ["clean", "tidy", "vacuum", "mop", "weekly", "biweekly", "recurring", "dust", "maid"],
        cleaning_deep: ["deep clean", "moving out", "move out", "deposit", "landlord", "inspection", "oven", "fridge", "dust-out"],
        handyman_general: ["handyman", "ikea", "flat-pack", "flat pack", "assemble", "mount", "mounted", "hang a tv", "shelf", "hinge", "repair", "fix", "install", "put in", "drywall", "door", "lock"],
        plumbing: ["faucet", "tap", "drip", "dripping", "leak", "leaking", "plunger", "valve", "pipe", "toilet", "drain", "sink", "clog", "shutoff"],
        electrical: ["outlet", "switch", "wiring", "circuit", "breaker", "ceiling fan", "fixture", "power", "dead circuit"],
        moving_help: ["movers", "mover", "u-haul", "uhaul", "load", "unload", "truck", "storage", "heavy lifting", "move boxes"],
        junk_removal: ["junk", "haul away", "haul-away", "clear out", "curb", "curbside", "mattress", "couch", "hauling", "debris"],
        yard_outdoor: ["yard", "lawn", "mow", "mowing", "grass", "gutter", "leaves", "moss", "pressure wash", "edge", "sidewalk", "outdoor", "cleanup", "branches"],
    };

    const STOP_WORDS = new Set(["and", "the", "or", "for", "with", "under", "apartment", "house", "help", "home", "regular", "need", "someone"]);

    function getServiceTypes() {
        return (typeof DB_SERVICE_TYPES !== 'undefined' ? DB_SERVICE_TYPES : []);
    }

    function getListings() {
        return (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []);
    }

    function getProviders() {
        return (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []);
    }

    function getNeighborhoods() {
        return (typeof DB_NEIGHBORHOODS !== 'undefined' ? DB_NEIGHBORHOODS : MOCK_NEIGHBORHOODS);
    }

    function getActiveListings() {
        const refDate = MOCK_META.reference_date;
        return getListings()
            .filter(l => l.listing_status === "active")
            .map(l => ({
                ...l,
                availability: (l.availability || []).filter(slot => slot.slice(0, 10) >= refDate)
            }));
    }

    function wordsFrom(text) {
        return text.toLowerCase().split(/[^a-z]+/).filter(w => w.length >= 4 && !STOP_WORDS.has(w));
    }

    function includesKeyword(text, keyword) {
        if (keyword.includes(" ") || keyword.includes("-")) return text.includes(keyword);
        return new RegExp(`\\b${keyword}\\b`).test(text);
    }

    function parseServiceTypes(text) {
        const types = getServiceTypes();
        const matches = [];
        for (const { code, label, description } of types) {
            const keywords = new Set(wordsFrom(`${label} ${description}`));
            for (const syn of SYNONYMS_BY_CODE[code] || []) keywords.add(syn.toLowerCase());
            if ([...keywords].some(kw => includesKeyword(text, kw))) {
                matches.push(code);
            }
        }
        return matches;
    }

    function parseMaxPrice(text) {
        const explicit = text.match(/(?:under|below|less than|max(?:imum)?|budget(?: is| of)?|up to|no more than)\s*\$?\s*(\d{1,4})/i);
        const dollar = text.match(/\$\s*(\d{1,4})/);
        const match = explicit || dollar;
        return match ? Number(match[1]) : null;
    }

    function parseNeighborhood(text) {
        const list = getNeighborhoods();
        const match = list.find(n => text.includes(n.name.toLowerCase()));
        return match ? match.name : null;
    }

    const URGENCY_BUCKETS = [
        ["urgent", /\b(asap|urgent|right away|emergency)\b/i],
        ["today", /\btoday\b/i],
        ["tomorrow", /\btomorrow\b/i],
        ["this_week", /\b(this week|this weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i],
    ];

    function parseUrgency(text) {
        const bucket = URGENCY_BUCKETS.find(([, pattern]) => pattern.test(text));
        return bucket ? bucket[0] : null;
    }

    function parseJob(text) {
        const normalized = String(text || "").toLowerCase().trim();
        return {
            service_types: parseServiceTypes(normalized),
            max_price: parseMaxPrice(normalized),
            neighborhood: parseNeighborhood(normalized),
            urgency: parseUrgency(normalized),
        };
    }

    function distanceMiles(from, to) {
        const radius = 3958.8;
        const radians = d => (d * Math.PI) / 180;
        const lat = radians(to.latitude - from.latitude);
        const lon = radians(to.longitude - from.longitude);
        const a = Math.sin(lat / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(lon / 2) ** 2;
        return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function listingDistanceFromNeighborhood(listing, neighborhoodName) {
        if (!neighborhoodName) return null;
        const neighborhood = getNeighborhoods().find(n => n.name === neighborhoodName);
        if (!neighborhood || listing.latitude == null || listing.longitude == null) return null;
        return distanceMiles(neighborhood, listing);
    }

    function servesNeighborhood(listing, neighborhoodName) {
        if (!neighborhoodName) return true;
        const distance = listingDistanceFromNeighborhood(listing, neighborhoodName);
        if (distance == null) return listing.provider_location === neighborhoodName;
        return distance <= listing.service_radius_miles;
    }

    function minimumSpend(listing) {
        return listing.price * (listing.minimum_quantity || 1);
    }

    const SEARCH_STOP_WORDS = new Set(["about", "after", "again", "also", "around", "because", "been", "before", "could", "does", "doing", "from", "have", "help", "house", "into", "just", "like", "need", "needs", "someone", "that", "their", "there", "they", "this", "those", "want", "with", "would", "your"]);

    function normalizeWord(word) {
        let n = word.toLowerCase();
        if (n.length > 5 && n.endsWith("ing")) n = n.slice(0, -3);
        else if (n.length > 4 && n.endsWith("ed")) n = n.slice(0, -2);
        else if (n.length > 4 && n.endsWith("s")) n = n.slice(0, -1);
        return n;
    }

    function searchableWords(text) {
        return String(text || "")
            .toLowerCase()
            .match(/[a-z0-9]+/g)
            ?.filter(w => w.length >= 3 && !SEARCH_STOP_WORDS.has(w))
            .map(w => ({ original: w, normalized: normalizeWord(w) })) || [];
    }

    function listingRelevance(query, listing) {
        const queryWords = searchableWords(query);
        if (queryWords.length === 0) return { score: 0, matchedTerms: [] };

        const titleWords = searchableWords(listing.title).map(w => w.normalized);
        const descWords = searchableWords(listing.listing_description).map(w => w.normalized);
        const titleSet = new Set(titleWords);
        const descSet = new Set(descWords);
        const matchedTerms = [];
        let score = 0;

        for (const [index, { original, normalized }] of queryWords.entries()) {
            const bonus = Math.max(0, 3 - index);
            if (titleSet.has(normalized)) {
                score += 5 + bonus;
                matchedTerms.push(original);
            } else if (descSet.has(normalized)) {
                score += 2 + bonus;
                matchedTerms.push(original);
            }
        }

        const normalizedQuery = queryWords.map(w => w.normalized);
        const normalizedTitle = titleWords.join(" ");
        const normalizedDesc = descWords.join(" ");
        if (normalizedQuery[0] && titleSet.has(normalizedQuery[0])) score += 3;
        for (let i = 0; i < normalizedQuery.length - 1; i++) {
            const phrase = `${normalizedQuery[i]} ${normalizedQuery[i + 1]}`;
            if (normalizedTitle.includes(phrase)) score += 8;
            else if (normalizedDesc.includes(phrase)) score += 4;
        }

        const plain = String(query).toLowerCase();
        const listingText = `${listing.title} ${listing.listing_description}`.toLowerCase();
        if (/\b(stopped working|dead|lost power|not working)\b/.test(plain) && /\b(dead circuit|trace|tracing|breaker)\b/.test(listingText)) {
            score += 12;
            matchedTerms.push("circuit problem");
        }

        return { score, matchedTerms: [...new Set(matchedTerms)] };
    }

    function addDays(date, days) {
        const at = new Date(`${date}T12:00:00Z`);
        at.setUTCDate(at.getUTCDate() + days);
        return at.toISOString().slice(0, 10);
    }

    function slotMatchesUrgency(slot, urgency, referenceDate) {
        if (!urgency || !referenceDate) return true;
        const date = slot.slice(0, 10);
        if (urgency === "today") return date === referenceDate;
        if (urgency === "tomorrow") return date === addDays(referenceDate, 1);
        if (urgency === "urgent") return date >= referenceDate && date <= addDays(referenceDate, 1);
        if (urgency === "this_week") return date >= referenceDate && date <= addDays(referenceDate, 7);
        return true;
    }

    function hasCompatibleSlot(listing, urgency, referenceDate) {
        return (listing.availability || []).some(slot => slotMatchesUrgency(slot, urgency, referenceDate));
    }

    function coverageCount(requestedTypes, listing) {
        return (requestedTypes || []).filter(code => listing.service_type.includes(code)).length;
    }

    function matchListings(parsed, listings, options = {}) {
        const requestedTypes = parsed.service_types || [];
        const { query = "", referenceDate = MOCK_META.reference_date } = options;

        const candidates = listings
            .filter(l => l.listing_status === "active")
            .filter(l => parsed.max_price == null || minimumSpend(l) <= parsed.max_price)
            .filter(l => servesNeighborhood(l, parsed.neighborhood))
            .filter(l => hasCompatibleSlot(l, parsed.urgency, referenceDate))
            .filter(l => requestedTypes.length === 0 || coverageCount(requestedTypes, l) > 0);

        return [...candidates].sort((a, b) => {
            const covDiff = coverageCount(requestedTypes, b) - coverageCount(requestedTypes, a);
            if (covDiff !== 0) return covDiff;
            const relDiff = listingRelevance(query, b).score - listingRelevance(query, a).score;
            if (relDiff !== 0) return relDiff;
            if (parsed.neighborhood) {
                const aDist = listingDistanceFromNeighborhood(a, parsed.neighborhood) ?? Number.POSITIVE_INFINITY;
                const bDist = listingDistanceFromNeighborhood(b, parsed.neighborhood) ?? Number.POSITIVE_INFINITY;
                if (aDist !== bDist) return aDist - bDist;
            }
            return (b.rating || 0) - (a.rating || 0);
        });
    }

    function enrichResults(rankedListings, filters, query = "") {
        const providersById = new Map(getProviders().map(p => [p.provider_id, p]));
        const labelByCode = Object.fromEntries(getServiceTypes().map(({ code, label }) => [code, label]));

        return rankedListings.slice(0, 5).map(listing => {
            const matchedLabels = (filters.service_types || [])
                .filter(code => listing.service_type.includes(code))
                .map(code => labelByCode[code]);
            const { matchedTerms } = listingRelevance(query, listing);
            const distance = listingDistanceFromNeighborhood(listing, filters.neighborhood);
            const relevanceReason = matchedTerms.length > 0
                ? `Matches details about ${matchedTerms.slice(0, 3).join(", ")}`
                : matchedLabels.length > 0
                    ? `Covers ${matchedLabels.join(" and ")}`
                    : "Available in Doorstep catalog";
            const locationReason = filters.neighborhood && distance != null
                ? ` · serves ${filters.neighborhood} (${distance.toFixed(1)} mi from base)`
                : "";

            return {
                ...listing,
                provider: providersById.get(listing.provider_id) || null,
                matchedLabels,
                reason: `${relevanceReason}${locationReason}`,
            };
        });
    }

    function formatSlot(slot) {
        return new Date(slot).toLocaleString("en-US", {
            timeZone: MOCK_META.timezone,
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    function formatSlotParts(slot) {
        const at = new Date(slot);
        return {
            day: at.toLocaleString("en-US", { timeZone: MOCK_META.timezone, weekday: "short", month: "short", day: "numeric" }),
            time: at.toLocaleString("en-US", { timeZone: MOCK_META.timezone, hour: "numeric", minute: "2-digit" }),
        };
    }

    function availabilityLabel(listing) {
        const slots = (listing.availability || []).filter(slot => slot.slice(0, 10) >= MOCK_META.reference_date).sort();
        if (slots.length === 0) return "No current openings";
        const first = slots[0];
        const date = first.slice(0, 10);
        const { day, time } = formatSlotParts(first);
        if (date === MOCK_META.reference_date) return `Available today · ${time}`;
        if (date === addDays(MOCK_META.reference_date, 1)) return `Available tomorrow · ${time}`;
        return `Next available ${day} · ${time}`;
    }

    function priceLabel(listing) {
        if (listing.price_unit !== "hourly") return `$${listing.price} flat`;
        const min = listing.minimum_quantity || 1;
        const commitment = min > 1 ? ` · ${min}-hr min ($${listing.price * min})` : "";
        return `$${listing.price}/hr${commitment}`;
    }

    const LOCAL_INTENTS = [
        ["greeting", /^\s*(hi|hey|hello|yo|howdy|good (morning|afternoon|evening))\s*[!.?]*\s*$/i],
        ["help", /\b(what can you do|how does this work|not sure how to use|help me)\b/i],
        ["list_bookings", /\b(my|all|the)\s+(bookings?|appointments?)\b|\bwhat have i booked\b/i],
        ["unsupported_service", /\b(paint(?:ed|ing)?|roof(?:ing)?|roofer|pest control|exterminator|childcare|babysitt(?:er|ing)|pet care|dog walk(?:er|ing))\b/i],
    ];

    function detectLocalIntent(text) {
        const found = LOCAL_INTENTS.find(([, pattern]) => pattern.test(text));
        return found ? found[0] : null;
    }

    const EXAMPLES = [
        { text: "Looking for someone to come clean my one bedroom apartment.", types: ["cleaning_standard"] },
        { text: "Kitchen tap drips constantly and the shutoff valve underneath is seized.", types: ["plumbing"] },
        { text: "Need two guys to help load a U-Haul truck on Sunday.", types: ["moving_help"] },
        { text: "Gutters are overflowing and there are leaves all over the lawn.", types: ["yard_outdoor"] },
        { text: "Need a ceiling fan installed where an old light fixture is.", types: ["handyman_general", "electrical"] },
    ];

    return {
        parseJob,
        matchListings,
        enrichResults,
        getActiveListings,
        formatSlot,
        formatSlotParts,
        availabilityLabel,
        priceLabel,
        detectLocalIntent,
        getServiceTypes,
        getProviders,
        EXAMPLES,
        MOCK_META
    };
})();

if (typeof window !== 'undefined') {
    window.ChatbotEngine = ChatbotEngine;
}
