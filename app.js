// Doorstep App State & Logic
let state = {
    activeProvider: null, // { listing, provider }
    booking: {
        listing: null,
        provider: null,
        timeSlot: null,
        address: '1420 NW Lovejoy St, Portland, OR',
        hours: 1,
        total: 0
    },
    bookingsList: [
        {
            id: 'BK-49201',
            listing_id: 'lst_001',
            title: 'Weekly & Bi-Weekly Apartment Cleaning',
            provider_name: 'Marisol Vega',
            timeSlot: new Date(Date.now() + 86400000 * 2).toISOString(),
            address: '1420 NW Lovejoy St, Apt 3B, Portland, OR',
            total: 51.75,
            status: 'upcoming',
            escrowStatus: 'held',
            rating: null,
            review: null
        }
    ],
    filters: {
        category: 'All',
        searchQuery: '',
        maxPrice: 200,
        minRating: 0,
        sortBy: 'recommended'
    },
    tempFilters: {
        category: 'All',
        searchQuery: '',
        maxPrice: 200,
        minRating: 0,
        sortBy: 'recommended'
    },
    currentReviewBookingId: null,
    reviewRating: 5
};

const categoryMap = {
    'Cleaning': ['cleaning_standard', 'cleaning_deep'],
    'Handyman': ['handyman_general', 'plumbing', 'electrical'],
    'Moving': ['moving_help', 'junk_removal'],
    'Yard & Outdoor': ['yard_outdoor']
};

const categoryIcons = {
    'Cleaning': { icon: 'fa-broom', color: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-50' },
    'Handyman': { icon: 'fa-hammer', color: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50' },
    'Moving': { icon: 'fa-box', color: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' },
    'Yard & Outdoor': { icon: 'fa-seedling', color: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-50' }
};

let mapInstance = null;

// --- ROUTING / NAVIGATION ---
function navigate(view, params = {}) {
    const container = document.getElementById('app-container');
    if (!container) return;

    if (params.category !== undefined) {
        state.filters.category = params.category;
    }
    if (params.search !== undefined) {
        state.filters.searchQuery = params.search;
    }

    let html = '';
    if (view === 'dashboard') html = getDashboardHTML();
    else if (view === 'feed') html = getFeedHTML();
    else if (view === 'profile') html = getProfileHTML(params.id);
    else if (view === 'schedule') html = getScheduleHTML(params.id);
    else if (view === 'checkout') html = getCheckoutHTML();
    else if (view === 'confirmation') html = getConfirmationHTML();
    else if (view === 'my-bookings') html = getMyBookingsHTML();

    container.innerHTML = `<div class="fade-in h-full flex flex-col">${html}</div>`;
    updateNavBadge();

    if (view === 'dashboard') {
        setTimeout(() => {
            initMap();
        }, 100);
    }
}

function updateNavBadge() {
    const badge = document.getElementById('nav-booking-badge');
    if (!badge) return;
    const upcomingCount = state.bookingsList.filter(b => b.status === 'upcoming').length;
    if (upcomingCount > 0) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// --- 1. DASHBOARD VIEW ---
function getDashboardHTML() {
    const activeListings = DB_LISTINGS.filter(l => l.listing_status === 'active');
    const featuredListings = activeListings.slice(0, 3);

    return `
        <div class="p-5 space-y-6">
            <!-- Hero Greeting & Search -->
            <div>
                <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full inline-block mb-2">Verified Local Pros</span>
                <h1 class="text-2xl font-extrabold text-slate-900 leading-tight">Find trusted help for your home</h1>
                <p class="text-xs text-slate-500 mt-1">Book licensed & background-checked neighbors in Portland.</p>
            </div>
            
            <!-- Real-Time Search Bar -->
            <div class="relative shadow-sm">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400"></i>
                <input type="text" id="dashboard-search" placeholder="Search e.g. clean, IKEA assembly, plumbing..." 
                    class="w-full pl-11 pr-10 py-3 bg-white rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition"
                    onkeydown="if(event.key==='Enter') executeDashboardSearch(this.value)"
                    value="${state.filters.searchQuery}">
                ${state.filters.searchQuery ? `
                    <button onclick="clearSearchAndRefresh()" class="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                ` : `
                    <button onclick="executeDashboardSearch(document.getElementById('dashboard-search').value)" class="absolute right-2.5 top-2 bg-blue-600 text-white w-7 h-7 rounded-xl flex items-center justify-center hover:bg-blue-700 transition btn-pop">
                        <i class="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                `}
            </div>

            <!-- Category Grid -->
            <div>
                <div class="flex justify-between items-center mb-3">
                    <h2 class="font-bold text-sm text-slate-900 tracking-tight">Popular Categories</h2>
                    <span onclick="navigate('feed', {category: 'All', search: ''})" class="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View All (${activeListings.length})</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    ${Object.entries(categoryMap).map(([cat, codes]) => {
                        const style = categoryIcons[cat] || { icon: 'fa-wrench', color: 'bg-blue-500', light: 'bg-blue-50' };
                        const count = activeListings.filter(l => l.service_type.some(c => codes.includes(c))).length;
                        return `
                            <div onclick="navigate('feed', {category: '${cat}', search: ''})" class="glass-card p-4 rounded-2xl cursor-pointer card-hover border border-slate-200/80 btn-pop flex items-center space-x-3">
                                <div class="w-11 h-11 ${style.color} text-white rounded-xl flex items-center justify-center shadow-md text-base">
                                    <i class="fa-solid ${style.icon}"></i>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800 text-sm">${cat}</div>
                                    <div class="text-[11px] text-slate-400 font-medium">${count} Pros Available</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Live Interactive Map -->
            <div>
                <div class="flex justify-between items-center mb-2.5">
                    <div class="flex items-center space-x-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h2 class="font-bold text-sm text-slate-900 tracking-tight">Nearby Service Map</h2>
                    </div>
                    <span class="text-[11px] text-slate-400">Portland, OR Metro</span>
                </div>
                <div class="rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div id="map" class="h-56 w-full z-0"></div>
                </div>
            </div>

            <!-- Featured Providers Carousel -->
            <div>
                <div class="flex justify-between items-center mb-3">
                    <h2 class="font-bold text-sm text-slate-900 tracking-tight">Top-Rated Providers</h2>
                    <span onclick="navigate('feed', {category: 'All'})" class="text-xs font-bold text-blue-600 cursor-pointer hover:underline">See Feed</span>
                </div>
                <div class="space-y-3">
                    ${featuredListings.map(listing => {
                        const provider = DB_PROVIDERS.find(p => p.provider_id === listing.provider_id) || {};
                        const rating = listing.rating ? listing.rating.toFixed(1) : '5.0';
                        const priceUnit = listing.price_unit === 'hourly' ? '/hr' : ' flat';
                        return `
                            <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between card-hover cursor-pointer" onclick="navigate('profile', {id: '${listing.listing_id}'})">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-inner">
                                        ${provider.name ? provider.name.charAt(0) : 'P'}
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-slate-800 text-xs">${provider.name}</h4>
                                        <p class="text-[11px] text-slate-500 line-clamp-1">${listing.title}</p>
                                        <div class="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                            <span class="text-amber-500 font-bold"><i class="fa-solid fa-star text-[9px]"></i> ${rating}</span>
                                            <span>•</span>
                                            <span>${listing.provider_location}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="text-xs font-extrabold text-emerald-600">$${listing.price}</span>
                                    <span class="text-[10px] text-slate-400 block">${priceUnit}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Bottom spacing -->
            <div class="h-10"></div>
        </div>
    `;
}

function executeDashboardSearch(query) {
    state.filters.searchQuery = (query || '').trim();
    state.filters.category = 'All';
    navigate('feed');
}

function clearSearchAndRefresh() {
    state.filters.searchQuery = '';
    navigate('dashboard');
}

// --- 2. FEED VIEW WITH FILTERS & QUICK BOOK ---
function getFilteredListings() {
    let list = DB_LISTINGS.filter(l => l.listing_status === 'active');

    // 1. Category Filter
    if (state.filters.category && state.filters.category !== 'All') {
        const codes = categoryMap[state.filters.category] || [];
        list = list.filter(l => l.service_type.some(c => codes.includes(c)));
    }

    // 2. Search Query Filter
    if (state.filters.searchQuery) {
        const q = state.filters.searchQuery.toLowerCase();
        list = list.filter(l => {
            const provider = DB_PROVIDERS.find(p => p.provider_id === l.provider_id);
            const provName = provider ? provider.name.toLowerCase() : '';
            const provBio = provider ? provider.bio.toLowerCase() : '';
            const title = (l.title || '').toLowerCase();
            const desc = (l.listing_description || '').toLowerCase();
            const loc = (l.provider_location || '').toLowerCase();

            return title.includes(q) || desc.includes(q) || provName.includes(q) || provBio.includes(q) || loc.includes(q);
        });
    }

    // 3. Max Price Filter
    if (state.filters.maxPrice) {
        list = list.filter(l => l.price <= state.filters.maxPrice);
    }

    // 4. Min Rating Filter
    if (state.filters.minRating > 0) {
        list = list.filter(l => (l.rating || 0) >= state.filters.minRating);
    }

    // 5. Sorting
    if (state.filters.sortBy === 'price-asc') {
        list.sort((a, b) => a.price - b.price);
    } else if (state.filters.sortBy === 'price-desc') {
        list.sort((a, b) => b.price - a.price);
    } else if (state.filters.sortBy === 'rating-desc') {
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (state.filters.sortBy === 'reviews-desc') {
        list.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }

    return list;
}

function getFeedHTML() {
    const pros = getFilteredListings();
    const activeFiltersCount = (state.filters.category !== 'All' ? 1 : 0) + 
                               (state.filters.searchQuery ? 1 : 0) + 
                               (state.filters.maxPrice < 200 ? 1 : 0) + 
                               (state.filters.minRating > 0 ? 1 : 0) +
                               (state.filters.sortBy !== 'recommended' ? 1 : 0);

    let cardsHTML = '';
    if (pros.length === 0) {
        cardsHTML = `
            <div class="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 my-6 shadow-sm">
                <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-3">
                    <i class="fa-solid fa-search"></i>
                </div>
                <h3 class="font-bold text-slate-800 text-base mb-1">No matching providers found</h3>
                <p class="text-xs text-slate-500 mb-5 max-w-xs mx-auto">Try adjusting your category, increasing max price, or clearing filters.</p>
                <button onclick="resetFilters(); navigate('feed')" class="bg-blue-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md shadow-blue-500/20 btn-pop">
                    Reset All Filters
                </button>
            </div>
        `;
    } else {
        cardsHTML = pros.map(p => {
            const provider = DB_PROVIDERS.find(prv => prv.provider_id === p.provider_id) || {};
            const rating = p.rating ? p.rating.toFixed(1) : '5.0';
            const priceUnit = p.price_unit === 'hourly' ? '/hr' : ' flat';
            const initial = provider.name ? provider.name.charAt(0) : 'P';

            return `
            <div class="bg-white p-4 mb-3.5 rounded-2xl shadow-sm border border-slate-200/80 card-hover">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                            ${initial}
                        </div>
                        <div>
                            <div class="flex items-center space-x-1.5">
                                <h3 class="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onclick="navigate('profile', {id: '${p.listing_id}'})">${provider.name}</h3>
                                <i class="fa-solid fa-circle-check text-blue-500 text-[11px]" title="Verified Provider"></i>
                            </div>
                            <p class="text-[11px] text-slate-500 line-clamp-1">${p.title}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-extrabold text-emerald-600 text-sm">$${p.price}<span class="text-[10px] text-slate-400 font-normal">${priceUnit}</span></div>
                    </div>
                </div>

                <p class="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed pl-1">${p.listing_description}</p>

                <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div class="flex items-center space-x-3">
                        <span class="flex items-center text-amber-500 font-bold text-[11px]">
                            <i class="fa-solid fa-star text-[10px] mr-1"></i> ${rating} 
                            <span class="text-slate-400 font-normal ml-1">(${p.review_count})</span>
                        </span>
                        <span class="text-[11px] text-slate-400 flex items-center">
                            <i class="fa-solid fa-location-dot mr-1 text-slate-400 text-[10px]"></i> ${p.provider_location}
                        </span>
                    </div>
                    
                    <!-- Fix 1: Quick Book safely routes to time slot selection directly -->
                    <div class="flex items-center space-x-2">
                        <button onclick="navigate('profile', {id: '${p.listing_id}'})" class="text-[11px] font-bold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition btn-pop">
                            Profile
                        </button>
                        <button onclick="navigate('schedule', {id: '${p.listing_id}'})" class="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm shadow-blue-500/20 transition btn-pop">
                            Quick Book
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    return `
        <!-- Sticky Feed Header -->
        <div class="glass-header px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div class="flex items-center space-x-3">
                <button onclick="navigate('dashboard')" class="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition btn-pop">
                    <i class="fa-solid fa-arrow-left text-sm"></i>
                </button>
                <div>
                    <h2 class="font-extrabold text-sm text-slate-900 leading-tight">
                        ${state.filters.searchQuery ? `"${state.filters.searchQuery}"` : (state.filters.category === 'All' ? 'All Providers' : state.filters.category)}
                    </h2>
                    <span class="text-[10px] text-slate-400 font-semibold">${pros.length} available pros</span>
                </div>
            </div>
            
            <!-- Filter Drawer Trigger Button -->
            <button onclick="openFilterModal()" class="flex items-center space-x-1.5 text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm transition btn-pop">
                <i class="fa-solid fa-sliders text-blue-600"></i>
                <span>Filter</span>
                ${activeFiltersCount > 0 ? `
                    <span class="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center ml-0.5">${activeFiltersCount}</span>
                ` : ''}
            </button>
        </div>

        <!-- Active Filter Pills Bar -->
        ${(state.filters.category !== 'All' || state.filters.searchQuery || state.filters.maxPrice < 200 || state.filters.minRating > 0) ? `
            <div class="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center space-x-2 overflow-x-auto text-[11px]">
                <span class="text-slate-400 font-semibold uppercase text-[9px] whitespace-nowrap">Active:</span>
                ${state.filters.category !== 'All' ? `
                    <span class="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-full flex items-center whitespace-nowrap">
                        ${state.filters.category} <i class="fa-solid fa-xmark ml-1.5 cursor-pointer text-slate-400 hover:text-red-500" onclick="state.filters.category='All'; navigate('feed')"></i>
                    </span>
                ` : ''}
                ${state.filters.searchQuery ? `
                    <span class="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-full flex items-center whitespace-nowrap">
                        "${state.filters.searchQuery}" <i class="fa-solid fa-xmark ml-1.5 cursor-pointer text-slate-400 hover:text-red-500" onclick="state.filters.searchQuery=''; navigate('feed')"></i>
                    </span>
                ` : ''}
                ${state.filters.maxPrice < 200 ? `
                    <span class="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-full flex items-center whitespace-nowrap">
                        Under $${state.filters.maxPrice} <i class="fa-solid fa-xmark ml-1.5 cursor-pointer text-slate-400 hover:text-red-500" onclick="state.filters.maxPrice=200; navigate('feed')"></i>
                    </span>
                ` : ''}
                ${state.filters.minRating > 0 ? `
                    <span class="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-0.5 rounded-full flex items-center whitespace-nowrap">
                        ${state.filters.minRating}+ ⭐ <i class="fa-solid fa-xmark ml-1.5 cursor-pointer text-slate-400 hover:text-red-500" onclick="state.filters.minRating=0; navigate('feed')"></i>
                    </span>
                ` : ''}
            </div>
        ` : ''}

        <!-- Feed List -->
        <div class="p-4 flex-1 overflow-y-auto bg-slate-50">
            ${cardsHTML}
            <div class="h-12"></div>
        </div>
    `;
}

// --- 3. PROVIDER PROFILE VIEW ---
function getProfileHTML(listingId) {
    const p = DB_LISTINGS.find(l => l.listing_id === listingId) || DB_LISTINGS[0];
    const provider = DB_PROVIDERS.find(prv => prv.provider_id === p.provider_id) || {};
    state.activeProvider = { listing: p, provider: provider };

    const rating = p.rating ? p.rating.toFixed(1) : '5.0';
    const priceUnit = p.price_unit === 'hourly' ? '/hr' : ' flat';
    const initial = provider.name ? provider.name.charAt(0) : 'P';

    const availSlots = p.availability && p.availability.length > 0 ? p.availability : [
        new Date(Date.now() + 86400000).toISOString(),
        new Date(Date.now() + 86400000 * 2).toISOString(),
        new Date(Date.now() + 86400000 * 3).toISOString()
    ];

    let availHTML = availSlots.map(date => {
        const d = new Date(date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = d.getDate();
        const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return `
            <div onclick="selectTime('${date}')" class="border border-slate-200 bg-white rounded-2xl p-2.5 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition time-slot btn-pop shadow-sm" data-date="${date}">
                <div class="text-[10px] text-slate-400 font-bold uppercase">${dayName}</div>
                <div class="font-extrabold text-sm text-slate-800 my-0.5">${dayNum}</div>
                <div class="text-[10px] text-blue-600 font-semibold">${timeStr}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="relative h-44 bg-gradient-to-tr from-blue-700 via-indigo-700 to-slate-900 flex items-center justify-center">
            <button onclick="navigate('feed')" class="absolute top-4 left-4 glass-header text-slate-700 w-8 h-8 rounded-full flex items-center justify-center shadow-md btn-pop z-10">
                <i class="fa-solid fa-arrow-left text-xs"></i>
            </button>
            <div class="text-white/20 text-7xl font-extrabold select-none">DOORSTEP</div>
        </div>

        <div class="p-5 bg-white -mt-8 rounded-t-3xl relative z-10 flex-1 flex flex-col shadow-lg">
            <!-- Profile Header -->
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center space-x-3">
                    <div class="w-14 h-14 -mt-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg border-2 border-white">
                        ${initial}
                    </div>
                    <div>
                        <div class="flex items-center space-x-1.5">
                            <h1 class="text-lg font-extrabold text-slate-900">${provider.name}</h1>
                            <i class="fa-solid fa-circle-check text-blue-500 text-xs" title="Verified Badge"></i>
                        </div>
                        <p class="text-xs text-blue-600 font-semibold">${p.title}</p>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-extrabold text-lg text-emerald-600">$${p.price}<span class="text-xs font-normal text-slate-400">${priceUnit}</span></div>
                </div>
            </div>
            
            <!-- Quick Stats Bar -->
            <div class="grid grid-cols-3 gap-2 py-3 my-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs">
                <div>
                    <span class="text-amber-500 font-extrabold block"><i class="fa-solid fa-star text-[10px]"></i> ${rating}</span>
                    <span class="text-[10px] text-slate-400">${p.review_count} reviews</span>
                </div>
                <div class="border-x border-slate-200">
                    <span class="font-extrabold text-slate-700 block">${p.provider_location}</span>
                    <span class="text-[10px] text-slate-400">Portland Area</span>
                </div>
                <div>
                    <span class="text-blue-600 font-extrabold block"><i class="fa-solid fa-shield-halved text-[10px]"></i> Escrow</span>
                    <span class="text-[10px] text-slate-400">Protected</span>
                </div>
            </div>

            <!-- Bio & Service Description -->
            <div class="space-y-3 mb-5 text-xs text-slate-600">
                <div>
                    <h3 class="font-bold text-slate-900 mb-1 text-[11px] uppercase tracking-wider">Service Scope</h3>
                    <p class="leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">${p.listing_description}</p>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 mb-1 text-[11px] uppercase tracking-wider">About Provider</h3>
                    <p class="leading-relaxed text-slate-500 italic">"${provider.bio}"</p>
                </div>
            </div>

            <!-- Time Slots -->
            <h3 class="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider">Select Available Time Slot</h3>
            <div class="grid grid-cols-3 gap-2 mb-6" id="availability-grid">
                ${availHTML}
            </div>

            <!-- Sticky Bottom Action -->
            <div class="mt-auto pt-2">
                <button onclick="goToCheckout()" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition btn-pop flex items-center justify-center space-x-2">
                    <span>Continue to Checkout</span>
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                </button>
            </div>
        </div>
    `;
}

// --- 4. QUICK BOOK SCHEDULING VIEW (Fix 1 in Workflow) ---
function getScheduleHTML(listingId) {
    const p = DB_LISTINGS.find(l => l.listing_id === listingId) || DB_LISTINGS[0];
    const provider = DB_PROVIDERS.find(prv => prv.provider_id === p.provider_id) || {};
    state.activeProvider = { listing: p, provider: provider };

    const availSlots = p.availability && p.availability.length > 0 ? p.availability : [
        new Date(Date.now() + 86400000).toISOString(),
        new Date(Date.now() + 86400000 * 2).toISOString(),
        new Date(Date.now() + 86400000 * 3).toISOString()
    ];

    let availHTML = availSlots.map(date => {
        const d = new Date(date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return `
            <div onclick="selectTime('${date}')" class="border border-slate-200 bg-white rounded-2xl p-3.5 mb-2.5 cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 transition time-slot btn-pop shadow-sm flex items-center justify-between" data-date="${date}">
                <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                        <i class="fa-solid fa-calendar-day"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 text-xs">${dayName}</div>
                        <div class="text-[11px] text-blue-600 font-semibold">${timeStr}</div>
                    </div>
                </div>
                <div class="text-xs text-slate-400">
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="glass-header px-4 py-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
            <button onclick="navigate('feed')" class="text-slate-500 hover:text-slate-900 p-1 rounded-lg btn-pop">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="font-extrabold text-sm text-slate-900">Select Booking Time</h2>
            <div class="w-6"></div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
                <!-- Provider Summary Card -->
                <div class="bg-blue-50/80 border border-blue-100 p-4 rounded-2xl mb-5 flex items-center space-x-3">
                    <div class="w-11 h-11 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                        ${provider.name ? provider.name.charAt(0) : 'P'}
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-900 text-sm">${provider.name}</h3>
                        <p class="text-xs text-blue-700 font-medium">${p.title}</p>
                        <div class="text-[11px] text-slate-500 mt-0.5">$${p.price} ${p.price_unit === 'hourly' ? '/ hr' : 'flat rate'}</div>
                    </div>
                </div>

                <h3 class="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">Available Slots for this Job</h3>
                <div id="availability-grid">
                    ${availHTML}
                </div>
            </div>

            <div class="mt-6 pt-4 border-t border-slate-200">
                <button onclick="goToCheckout()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition btn-pop flex items-center justify-center space-x-2">
                    <span>Continue to Address & Payment</span>
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                </button>
            </div>
        </div>
    `;
}

function selectTime(date) {
    document.querySelectorAll('.time-slot').forEach(el => {
        el.classList.remove('border-blue-500', 'bg-blue-50', 'ring-2', 'ring-blue-200');
    });
    const selected = document.querySelector(`.time-slot[data-date="${date}"]`);
    if (selected) {
        selected.classList.add('border-blue-500', 'bg-blue-50', 'ring-2', 'ring-blue-200');
        state.booking.timeSlot = date;
    }
}

function goToCheckout() {
    if (!state.booking.timeSlot) {
        showToast('Please select an available time slot first!', 'fa-circle-exclamation');
        return;
    }
    navigate('checkout');
}

// --- 5. CHECKOUT & ESCROW AUTHORIZATION VIEW ---
function getCheckoutHTML() {
    const p = state.activeProvider?.listing || DB_LISTINGS[0];
    const provider = state.activeProvider?.provider || DB_PROVIDERS[0];
    
    const commission = parseFloat((p.price * 0.15).toFixed(2));
    state.booking.total = p.price + commission; 

    return `
        <div class="glass-header px-4 py-3.5 border-b border-slate-200 flex items-center sticky top-0 z-10">
            <button onclick="navigate('profile', {id: '${p.listing_id}'})" class="text-slate-500 hover:text-slate-900 mr-3 btn-pop">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="font-extrabold text-sm text-slate-900">Secure Escrow Checkout</h2>
        </div>

        <div class="p-5 flex-1 overflow-y-auto space-y-4">
            <!-- Order Summary Card -->
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
                <div class="flex items-center space-x-3 mb-3 pb-3 border-b border-slate-100">
                    <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg">
                        <i class="fa-solid fa-calendar-check"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-900 text-xs">${p.title}</h3>
                        <p class="text-[11px] text-blue-600 font-semibold">${new Date(state.booking.timeSlot || Date.now()).toLocaleString('en-US', {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</p>
                    </div>
                </div>

                <div class="space-y-2 text-xs text-slate-600">
                    <div class="flex justify-between">
                        <span>Provider Rate (${provider.name})</span>
                        <span class="font-bold text-slate-800">$${p.price.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Doorstep Protection & Escrow (15%)</span>
                        <span class="font-bold text-slate-800">$${commission.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between font-extrabold text-sm text-slate-900 border-t border-slate-100 pt-2.5 mt-2.5">
                        <span>Total Authorization</span>
                        <span class="text-emerald-600">$${state.booking.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Job Address (Fix 4: Sequencing) -->
            <div>
                <label class="font-bold text-slate-700 text-xs uppercase tracking-wider block mb-1.5">Job Location Address</label>
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center space-x-2.5">
                    <i class="fa-solid fa-location-dot text-rose-500"></i>
                    <input type="text" id="job-address" class="flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none" value="${state.booking.address}" placeholder="Enter service address...">
                </div>
            </div>

            <!-- Payment Method Selection -->
            <div>
                <label class="font-bold text-slate-700 text-xs uppercase tracking-wider block mb-1.5">Payment Method</label>
                <div class="bg-white rounded-2xl border border-blue-500 ring-2 ring-blue-100 p-3.5 flex items-center justify-between shadow-sm">
                    <div class="flex items-center space-x-3">
                        <div class="w-9 h-6 bg-slate-900 text-white rounded flex items-center justify-center text-xs font-bold">
                            VISA
                        </div>
                        <div>
                            <div class="font-bold text-xs text-slate-800">•••• 4242</div>
                            <div class="text-[10px] text-slate-400">Expires 08/28</div>
                        </div>
                    </div>
                    <i class="fa-solid fa-circle-check text-blue-600 text-base"></i>
                </div>
            </div>

            <!-- Escrow Badge -->
            <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-start space-x-2.5">
                <i class="fa-solid fa-shield-halved text-emerald-600 text-sm mt-0.5"></i>
                <div class="text-[11px] text-emerald-800 leading-relaxed">
                    <strong class="font-bold">Zero-Risk Escrow Guarantee:</strong> Your funds are held safely until you confirm that the service has been satisfactorily completed.
                </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-2">
                <button onclick="processPayment()" id="pay-btn" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-2xl shadow-xl transition btn-pop flex items-center justify-center space-x-2">
                    <i class="fa-solid fa-lock text-xs text-emerald-400"></i>
                    <span>Authorize $${state.booking.total.toFixed(2)} in Escrow</span>
                </button>
            </div>
        </div>
    `;
}

function processPayment() {
    const btn = document.getElementById('pay-btn');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-xs"></i><span>Securing Escrow Funds...</span>';
        btn.classList.add('opacity-80', 'pointer-events-none');
    }

    const addressInput = document.getElementById('job-address');
    if (addressInput) {
        state.booking.address = addressInput.value.trim() || state.booking.address;
    }

    setTimeout(() => {
        // Save new booking to state
        const newBooking = {
            id: 'BK-' + Math.floor(10000 + Math.random() * 90000),
            listing_id: state.activeProvider?.listing?.listing_id || 'lst_001',
            title: state.activeProvider?.listing?.title || 'Home Service',
            provider_name: state.activeProvider?.provider?.name || 'Local Pro',
            timeSlot: state.booking.timeSlot || new Date().toISOString(),
            address: state.booking.address,
            total: state.booking.total,
            status: 'upcoming',
            escrowStatus: 'held',
            rating: null,
            review: null
        };

        state.bookingsList.unshift(newBooking);
        navigate('confirmation');
        showToast('Escrow Payment Authorized!', 'fa-shield-halved');
    }, 1200);
}

// --- 6. CONFIRMATION VIEW ---
function getConfirmationHTML() {
    const latest = state.bookingsList[0] || {};
    return `
        <div class="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center fade-in">
            <div class="w-18 h-18 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-emerald-500/10">
                <i class="fa-solid fa-check"></i>
            </div>
            
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-1">Escrow Authorized</span>
            <h1 class="text-2xl font-extrabold text-slate-900 mb-1">Booking Confirmed!</h1>
            <p class="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
                We notified <strong>${latest.provider_name}</strong>. Funds will remain safely in escrow until the job is completed.
            </p>
            
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 w-full mb-6 text-left space-y-2 text-xs">
                <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">Booking Reference</span>
                    <span class="font-mono font-bold text-slate-800">${latest.id}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-200">
                    <span class="text-slate-500">Scheduled Date</span>
                    <span class="font-bold text-slate-800">${new Date(latest.timeSlot).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'})}</span>
                </div>
                <div class="flex justify-between py-1">
                    <span class="text-slate-500">Escrow Total</span>
                    <span class="font-extrabold text-emerald-600">$${(latest.total || 0).toFixed(2)}</span>
                </div>
            </div>

            <div class="w-full space-y-2">
                <button onclick="navigate('my-bookings')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition btn-pop">
                    View in My Bookings
                </button>
                <button onclick="navigate('dashboard')" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition btn-pop text-xs">
                    Return to Home
                </button>
            </div>
        </div>
    `;
}

// --- 7. "MY BOOKINGS" & POST-SERVICE REVIEW VIEW (Phase 4 in Workflow) ---
function getMyBookingsHTML() {
    const upcoming = state.bookingsList.filter(b => b.status === 'upcoming');
    const completed = state.bookingsList.filter(b => b.status === 'completed');

    return `
        <div class="glass-header px-4 py-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
            <button onclick="navigate('dashboard')" class="text-slate-500 hover:text-slate-900 p-1 btn-pop">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="font-extrabold text-sm text-slate-900">My Bookings & Receipts</h2>
            <div class="w-6"></div>
        </div>

        <div class="p-4 flex-1 overflow-y-auto space-y-6">
            <!-- Active / Upcoming Section -->
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center">
                        <span class="w-2 h-2 rounded-full bg-blue-600 mr-2"></span> Upcoming Jobs (${upcoming.length})
                    </h3>
                </div>

                ${upcoming.length === 0 ? `
                    <div class="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                        No upcoming bookings currently.
                    </div>
                ` : upcoming.map(b => `
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-3">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">${b.id}</span>
                                <h4 class="font-bold text-slate-900 text-sm mt-1">${b.provider_name}</h4>
                                <p class="text-xs text-slate-500">${b.title}</p>
                            </div>
                            <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-xl">
                                $${b.total.toFixed(2)} Escrow
                            </span>
                        </div>

                        <div class="text-[11px] text-slate-500 space-y-1 my-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div><i class="fa-solid fa-clock mr-1.5 text-slate-400"></i> ${new Date(b.timeSlot).toLocaleString('en-US', {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</div>
                            <div><i class="fa-solid fa-location-dot mr-1.5 text-slate-400"></i> ${b.address}</div>
                        </div>

                        <!-- Post-service completion simulation button -->
                        <div class="pt-2 border-t border-slate-100 flex space-x-2">
                            <button onclick="triggerJobCompletion('${b.id}')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow-sm btn-pop flex items-center justify-center space-x-1.5">
                                <i class="fa-solid fa-check text-xs"></i>
                                <span>Mark Job Completed</span>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Past Completed Section -->
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center">
                        <i class="fa-solid fa-clock-rotate-left mr-2 text-slate-400"></i> Completed History (${completed.length})
                    </h3>
                </div>

                ${completed.length === 0 ? `
                    <div class="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                        No completed jobs yet.
                    </div>
                ` : completed.map(b => `
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-3 opacity-90">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">${b.id}</span>
                                <h4 class="font-bold text-slate-800 text-sm mt-1">${b.provider_name}</h4>
                                <p class="text-xs text-slate-500">${b.title}</p>
                            </div>
                            <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xl">
                                Paid $${b.total.toFixed(2)}
                            </span>
                        </div>

                        ${b.rating ? `
                            <div class="bg-amber-50/70 border border-amber-100 p-2.5 rounded-xl my-2 text-xs">
                                <div class="flex items-center text-amber-500 text-xs mb-1">
                                    ${'★'.repeat(b.rating)}${'☆'.repeat(5 - b.rating)}
                                    <span class="text-[10px] text-slate-500 ml-1.5 font-bold">Your Review</span>
                                </div>
                                <p class="text-slate-600 italic text-[11px]">"${b.review || 'Great service!'}"</p>
                            </div>
                        ` : `
                            <button onclick="openReviewModal('${b.id}')" class="w-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl mt-2 transition btn-pop">
                                ★ Leave Rating & Review
                            </button>
                        `}
                    </div>
                `).join('')}
            </div>

            <div class="h-10"></div>
        </div>
    `;
}

function triggerJobCompletion(bookingId) {
    const b = state.bookingsList.find(item => item.id === bookingId);
    if (!b) return;

    b.status = 'completed';
    b.escrowStatus = 'released';
    showToast('Job marked completed! Escrow released to provider.', 'fa-circle-check');
    
    // Prompt Rating & Review Modal
    openReviewModal(bookingId);
}

// --- 8. FILTER MODAL CONTROLLER ---
function openFilterModal() {
    const modal = document.getElementById('filter-modal');
    if (!modal) return;

    // Clone current filters into temp
    state.tempFilters = { ...state.filters };

    // Render category chips
    const categories = ['All', 'Cleaning', 'Handyman', 'Moving', 'Yard & Outdoor'];
    const container = document.getElementById('filter-category-chips');
    container.innerHTML = categories.map(cat => `
        <button type="button" onclick="selectFilterCategory('${cat}')" 
            class="filter-cat-chip px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition ${state.tempFilters.category === cat ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400'}"
            data-cat="${cat}">
            ${cat}
        </button>
    `).join('');

    // Set price slider
    const slider = document.getElementById('filter-price-slider');
    if (slider) slider.value = state.tempFilters.maxPrice;
    updatePriceSliderDisplay(state.tempFilters.maxPrice);

    // Set rating
    selectMinRating(state.tempFilters.minRating);

    // Set sort
    const sortSelect = document.getElementById('filter-sort-select');
    if (sortSelect) sortSelect.value = state.tempFilters.sortBy;

    modal.classList.remove('hidden');
}

function closeFilterModal() {
    const modal = document.getElementById('filter-modal');
    if (modal) modal.classList.add('hidden');
}

function selectFilterCategory(cat) {
    state.tempFilters.category = cat;
    document.querySelectorAll('.filter-cat-chip').forEach(el => {
        if (el.getAttribute('data-cat') === cat) {
            el.className = 'filter-cat-chip px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition bg-blue-600 text-white border-blue-600 shadow-sm';
        } else {
            el.className = 'filter-cat-chip px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400';
        }
    });
}

function updatePriceSliderDisplay(val) {
    const display = document.getElementById('filter-price-val');
    if (display) display.textContent = `$${val}`;
    state.tempFilters.maxPrice = parseInt(val, 10);
}

function selectMinRating(rating) {
    state.tempFilters.minRating = rating;
    document.querySelectorAll('.rating-chip').forEach(el => {
        const chipRating = parseFloat(el.getAttribute('data-rating'));
        if (chipRating === rating) {
            el.classList.add('bg-blue-600', 'text-white', 'border-blue-600', 'shadow-sm');
            el.classList.remove('border-slate-200');
        } else {
            el.classList.remove('bg-blue-600', 'text-white', 'border-blue-600', 'shadow-sm');
            el.classList.add('border-slate-200');
        }
    });
}

function applyFiltersAndClose() {
    const sortSelect = document.getElementById('filter-sort-select');
    if (sortSelect) {
        state.tempFilters.sortBy = sortSelect.value;
    }

    state.filters = { ...state.tempFilters };
    closeFilterModal();
    navigate('feed');
    showToast('Filters applied!', 'fa-sliders');
}

function resetFilters() {
    state.filters = {
        category: 'All',
        searchQuery: '',
        maxPrice: 200,
        minRating: 0,
        sortBy: 'recommended'
    };
    closeFilterModal();
    navigate('feed');
    showToast('Filters reset to default', 'fa-rotate-left');
}

// --- 9. RATING & REVIEW MODAL CONTROLLER ---
function openReviewModal(bookingId) {
    state.currentReviewBookingId = bookingId;
    state.reviewRating = 5;
    setReviewStar(5);

    const b = state.bookingsList.find(item => item.id === bookingId);
    if (b) {
        document.getElementById('review-modal-title').textContent = `Rate ${b.provider_name}`;
        document.getElementById('review-modal-subtitle').textContent = b.title;
    }

    document.getElementById('review-text').value = '';
    document.getElementById('review-modal').classList.remove('hidden');
}

function closeReviewModal() {
    document.getElementById('review-modal').classList.add('hidden');
    navigate('my-bookings');
}

function setReviewStar(star) {
    state.reviewRating = star;
    const icons = document.querySelectorAll('#review-stars-container i');
    icons.forEach((icon, idx) => {
        if (idx < star) {
            icon.classList.add('text-amber-400');
            icon.classList.remove('text-slate-300');
        } else {
            icon.classList.remove('text-amber-400');
            icon.classList.add('text-slate-300');
        }
    });
}

function submitReview() {
    const b = state.bookingsList.find(item => item.id === state.currentReviewBookingId);
    const text = document.getElementById('review-text').value.trim();

    if (b) {
        b.rating = state.reviewRating;
        b.review = text || 'Excellent service and great communication!';
    }

    closeReviewModal();
    showToast('Review submitted & Escrow completed! ★★★★★', 'fa-star');
    navigate('my-bookings');
}

// --- 10. LEAFLET MAP CONTROLLER ---
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    // Centered over Portland Metro Area
    mapInstance = L.map('map', { zoomControl: false }).setView([45.5250, -122.6650], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance);

    const activeListings = DB_LISTINGS.filter(l => l.listing_status === 'active');

    activeListings.forEach(listing => {
        const provider = DB_PROVIDERS.find(prv => prv.provider_id === listing.provider_id);
        if (!provider || !provider.latitude || !provider.longitude) return;

        const rating = listing.rating ? listing.rating.toFixed(1) : '5.0';
        const priceUnit = listing.price_unit === 'hourly' ? '/hr' : ' flat';

        const popupHTML = `
            <div class="p-1 font-sans text-xs" style="min-width: 150px;">
                <div class="font-extrabold text-slate-900 text-xs">${provider.name}</div>
                <div class="text-[11px] text-blue-600 font-semibold mb-1 line-clamp-1">${listing.title}</div>
                <div class="flex justify-between items-center mb-2 text-[11px]">
                    <span class="text-amber-500 font-bold"><i class="fa-solid fa-star"></i> ${rating}</span>
                    <span class="text-emerald-600 font-extrabold">$${listing.price}${priceUnit}</span>
                </div>
                <button onclick="navigate('profile', {id: '${listing.listing_id}'})" class="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-xl transition text-[11px]">
                    View Profile
                </button>
            </div>
        `;

        L.marker([provider.latitude, provider.longitude])
            .addTo(mapInstance)
            .bindPopup(popupHTML);
    });

    // Invalidate size to ensure clean render
    setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
    }, 200);
}

// --- 11. GROUNDED GEMINI CHATBOT LOGIC ---
function toggleChatbot() {
    const modal = document.getElementById('chatbot-modal');
    if (modal) modal.classList.toggle('hidden');
}

function sendQuickPrompt(promptText) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = promptText;
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = (input ? input.value : '').trim();
    if (!msg) return;

    const history = document.getElementById('chat-history');
    
    // User message bubble
    history.innerHTML += `
        <div class="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-sm text-xs leading-relaxed">
            <p>${msg}</p>
        </div>
    `;
    input.value = '';
    history.scrollTop = history.scrollHeight;

    // Grounded Matching Engine
    setTimeout(() => {
        const lowerMsg = msg.toLowerCase();
        let match = null;
        
        const activeListings = DB_LISTINGS.filter(l => l.listing_status === 'active');
        const keywords = lowerMsg.split(/\s+/).filter(w => w.length > 2);

        // 1. Dynamic Search Scan
        match = activeListings.find(l => {
            const provider = DB_PROVIDERS.find(p => p.provider_id === l.provider_id);
            const titleLower = (l.title || '').toLowerCase();
            const descLower = (l.listing_description || '').toLowerCase();
            const bioLower = provider ? (provider.bio || '').toLowerCase() : '';
            return keywords.some(k => titleLower.includes(k) || descLower.includes(k) || bioLower.includes(k));
        });

        // 2. Fallback category matching
        if (!match) {
            if (lowerMsg.includes('clean') || lowerMsg.includes('maid') || lowerMsg.includes('wash') || lowerMsg.includes('dust')) {
                match = activeListings.find(l => l.service_type.some(c => categoryMap['Cleaning'].includes(c)));
            } else if (lowerMsg.includes('plumb') || lowerMsg.includes('sink') || lowerMsg.includes('pipe') || lowerMsg.includes('faucet') || lowerMsg.includes('drain')) {
                match = activeListings.find(l => l.service_type.includes('plumbing'));
            } else if (lowerMsg.includes('electric') || lowerMsg.includes('fan') || lowerMsg.includes('light') || lowerMsg.includes('outlet')) {
                match = activeListings.find(l => l.service_type.includes('electrical'));
            } else if (lowerMsg.includes('assemble') || lowerMsg.includes('ikea') || lowerMsg.includes('mount') || lowerMsg.includes('handyman') || lowerMsg.includes('furniture')) {
                match = activeListings.find(l => l.service_type.includes('handyman_general'));
            } else if (lowerMsg.includes('move') || lowerMsg.includes('truck') || lowerMsg.includes('haul') || lowerMsg.includes('junk') || lowerMsg.includes('box')) {
                match = activeListings.find(l => l.service_type.some(c => categoryMap['Moving'].includes(c)));
            } else if (lowerMsg.includes('yard') || lowerMsg.includes('lawn') || lowerMsg.includes('mow') || lowerMsg.includes('leaf') || lowerMsg.includes('garden')) {
                match = activeListings.find(l => l.service_type.includes('yard_outdoor'));
            }
        }

        if (match) {
            const provider = DB_PROVIDERS.find(prv => prv.provider_id === match.provider_id) || {};
            const rating = match.rating ? match.rating.toFixed(1) : '5.0';
            const priceUnit = match.price_unit === 'hourly' ? '/hr' : ' flat';

            history.innerHTML += `
                <div class="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none self-start max-w-[90%] shadow-sm text-xs text-slate-800">
                    <p class="mb-2 text-slate-600">I found a top verified provider who specializes in this:</p>
                    <div class="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-extrabold text-slate-900 text-xs">${provider.name}</div>
                                <div class="text-[11px] text-blue-600 font-medium">${match.title}</div>
                            </div>
                            <span class="text-xs font-bold text-emerald-600">$${match.price}${priceUnit}</span>
                        </div>
                        <div class="flex items-center text-[10px] text-slate-500 space-x-2">
                            <span class="text-amber-500 font-bold"><i class="fa-solid fa-star text-[9px]"></i> ${rating}</span>
                            <span>•</span>
                            <span>${match.provider_location}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2 pt-1">
                            <button onclick="toggleChatbot(); navigate('profile', {id: '${match.listing_id}'})" class="bg-white border border-slate-200 hover:border-blue-500 text-slate-700 font-bold py-1.5 px-2 rounded-lg text-center transition">
                                Profile
                            </button>
                            <button onclick="toggleChatbot(); navigate('schedule', {id: '${match.listing_id}'})" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2 rounded-lg text-center transition shadow-sm">
                                Quick Book
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            history.innerHTML += `
                <div class="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none self-start max-w-[85%] shadow-sm text-xs text-slate-700 leading-relaxed">
                    <p class="font-semibold text-slate-800 mb-1">I couldn't find an exact match</p>
                    <p>Try searching for cleaning, IKEA furniture assembly, plumbing repairs, moving help, electrical installations, or yard maintenance.</p>
                </div>
            `;
        }
        history.scrollTop = history.scrollHeight;
    }, 700);
}

// --- 12. TOAST NOTIFICATION HELPER ---
function showToast(message, iconClass = 'fa-circle-check') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toastIcon.className = `fa-solid ${iconClass} text-emerald-400`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// --- 13. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // Chat enter key support
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    try {
        await initData();
        navigate('dashboard');
    } catch (err) {
        console.error("Initialization error:", err);
        navigate('dashboard');
    }
});
