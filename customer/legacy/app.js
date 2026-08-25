// Doorstep App State & Logic (Product B - Customer App)
// Features: Multi-Persona Switching, Provider Direct Messaging, Trust & Safety Reporting, Escrow Checkout & Lifecycle

let state = {
    currentCustomerId: 'cust_00001',
    activeProvider: null, // { listing, provider }
    activeChatProvider: null,
    activeChatListing: null,
    activeReportTarget: null, // { type, targetId, title, listing_id, provider_id, booking_id }
    currentView: 'dashboard',
    currentViewParams: {},
    booking: {
        listing: null,
        provider: null,
        timeSlot: null,
        address: '1420 NW Lovejoy St, Portland, OR',
        hours: 1,
        total: 0
    },
    bookingsList: [],
    messages: {}, // { [provider_id]: [ { id, sender: 'customer'|'provider', text, timestamp } ] }
    reportsList: [], // [ { report_id, reporter_customer_id, listing_id, provider_id, booking_id, safety_flag_type, report_details, evidence_url, created_at, status } ]
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
    reviewRating: 5,
    chatbot: {
        isOpen: false,
        messages: [],
        activeFilters: {
            service_types: [],
            max_price: null,
            neighborhood: null,
            urgency: null
        },
        expandedListingId: null,
        isTyping: false
    }
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

// --- 1. LOCALSTORAGE & PERSONA MANAGEMENT ---
function getCurrentCustomer() {
    return (typeof DB_CUSTOMERS !== 'undefined' ? DB_CUSTOMERS : []).find(c => c.customer_id === state.currentCustomerId) || {
        customer_id: 'cust_00001',
        name: 'Maya Lin',
        email: 'maya.lin1@example.invalid',
        phone_number: '9175551000',
        address: '1420 NW Lovejoy St, Apt 3B, Portland, OR',
        avatar_color: 'from-blue-500 to-indigo-600'
    };
}

function initCustomerState(customerId) {
    const savedBookings = localStorage.getItem(`doorstep_bookings_${customerId}`);
    const savedMessages = localStorage.getItem(`doorstep_messages_${customerId}`);
    const savedReports = localStorage.getItem(`doorstep_reports_${customerId}`);

    if (savedBookings) {
        try { state.bookingsList = JSON.parse(savedBookings); } catch (e) { state.bookingsList = []; }
    } else {
        // Seed default bookings for demo persona
        if (customerId === 'cust_00001') {
            state.bookingsList = [
                {
                    id: 'BK-49201',
                    listing_id: 'lst_001',
                    provider_id: 'prv_001',
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
            ];
        } else if (customerId === 'cust_00002') {
            state.bookingsList = [
                {
                    id: 'BK-31082',
                    listing_id: 'lst_010',
                    provider_id: 'prv_005',
                    title: 'IKEA Furniture Assembly & Mounting',
                    provider_name: 'Tomasz Bak',
                    timeSlot: new Date(Date.now() - 86400000 * 3).toISOString(),
                    address: '825 SE Hawthorne Blvd, Portland, OR',
                    total: 86.25,
                    status: 'completed',
                    escrowStatus: 'released',
                    rating: 5,
                    review: 'Super quick with assembling the PAX wardrobe!'
                }
            ];
        } else {
            state.bookingsList = [];
        }
    }

    if (savedMessages) {
        try { state.messages = JSON.parse(savedMessages); } catch (e) { state.messages = {}; }
    } else {
        state.messages = {};
        if (customerId === 'cust_00001') {
            state.messages['prv_001'] = [
                { id: 'm1', sender: 'provider', text: 'Hi Maya! I saw your booking for Friday. Do you have any specific pet instructions for my visit?', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
                { id: 'm2', sender: 'customer', text: 'Hi Marisol! Yes, our cat will be in the bedroom during cleaning. Thanks for asking!', timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
                { id: 'm3', sender: 'provider', text: 'Sounds wonderful! Looking forward to Friday.', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() }
            ];
        }
    }

    if (savedReports) {
        try { state.reportsList = JSON.parse(savedReports); } catch (e) { state.reportsList = []; }
    } else {
        if (customerId === 'cust_00004') {
            state.reportsList = [
                {
                    report_id: 'report_00001',
                    reporter_customer_id: 'cust_00004',
                    listing_id: 'lst_004',
                    provider_id: 'prv_004',
                    booking_id: 'BK-10492',
                    safety_flag_type: 'payment_request_off_platform',
                    report_details: 'Provider asked for cash payment outside Doorstep escrow after accepting.',
                    evidence_url: '',
                    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
                    status: 'in_review'
                }
            ];
        } else {
            state.reportsList = [];
        }
    }

    saveCurrentCustomerState();
    updatePersonaHeader();
}

function saveCurrentCustomerState() {
    const custId = state.currentCustomerId;
    localStorage.setItem(`doorstep_bookings_${custId}`, JSON.stringify(state.bookingsList));
    localStorage.setItem(`doorstep_messages_${custId}`, JSON.stringify(state.messages));
    localStorage.setItem(`doorstep_reports_${custId}`, JSON.stringify(state.reportsList));
    localStorage.setItem('doorstep_active_persona', custId);
}

function updatePersonaHeader() {
    const customer = getCurrentCustomer();
    const avatarEl = document.getElementById('nav-persona-avatar');
    const nameEl = document.getElementById('nav-persona-name');
    if (avatarEl) {
        avatarEl.textContent = customer.name.charAt(0);
        avatarEl.className = `w-5 h-5 rounded-full bg-gradient-to-tr ${customer.avatar_color || 'from-blue-500 to-indigo-600'} text-white flex items-center justify-center font-extrabold text-[10px]`;
    }
    if (nameEl) {
        const firstName = customer.name.split(' ')[0];
        nameEl.textContent = firstName;
    }
}

function openPersonaModal() {
    const modal = document.getElementById('persona-modal');
    const container = document.getElementById('persona-list-container');
    if (!modal || !container) return;

    const customers = typeof DB_CUSTOMERS !== 'undefined' ? DB_CUSTOMERS : [];
    container.innerHTML = customers.map(c => {
        const isSelected = c.customer_id === state.currentCustomerId;
        const initial = c.name.charAt(0);
        return `
            <div onclick="switchCustomerPersona('${c.customer_id}')" class="p-3 rounded-2xl border ${isSelected ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white hover:bg-slate-50'} cursor-pointer transition flex items-center justify-between btn-pop">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr ${c.avatar_color || 'from-blue-500 to-indigo-600'} text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        ${initial}
                    </div>
                    <div>
                        <div class="font-extrabold text-slate-900 text-xs flex items-center space-x-1.5">
                            <span>${c.name}</span>
                            ${isSelected ? '<span class="text-[10px] font-bold text-blue-600 bg-blue-100/80 px-1.5 py-0.2 rounded-md">Active</span>' : ''}
                        </div>
                        <div class="text-[11px] text-slate-500 truncate max-w-[170px]">${c.address}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${c.customer_id}</div>
                    </div>
                </div>
                <div>
                    ${isSelected ? '<i class="fa-solid fa-circle-check text-blue-600 text-base"></i>' : '<i class="fa-solid fa-chevron-right text-slate-300 text-xs"></i>'}
                </div>
            </div>
        `;
    }).join('');

    modal.classList.remove('hidden');
}

function closePersonaModal() {
    const modal = document.getElementById('persona-modal');
    if (modal) modal.classList.add('hidden');
}

function switchCustomerPersona(customerId) {
    state.currentCustomerId = customerId;
    initCustomerState(customerId);
    closePersonaModal();
    const customer = getCurrentCustomer();
    showToast(`Switched to Persona: ${customer.name}`, 'fa-user-check');
    navigate(state.currentView, state.currentViewParams);
}

// --- 2. ROUTING & NAVIGATION ---
function navigate(view, params = {}) {
    const container = document.getElementById('app-container');
    if (!container) return;

    state.currentView = view;
    state.currentViewParams = params;

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

// --- 3. DASHBOARD VIEW ---
function getDashboardHTML() {
    const activeListings = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).filter(l => l.listing_status === 'active');
    const featuredListings = activeListings.slice(0, 3);
    const customer = getCurrentCustomer();

    return `
        <div class="p-5 space-y-6">
            <!-- Hero Greeting -->
            <div>
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full inline-block">Verified Local Pros</span>
                    <span class="text-[11px] text-slate-400 font-medium">Hello, <strong class="text-slate-700">${customer.name.split(' ')[0]}</strong></span>
                </div>
                <h1 class="text-2xl font-extrabold text-slate-900 leading-tight">Find trusted help for your home</h1>
                <p class="text-xs text-slate-500 mt-1">Book background-checked independent neighbors in Portland, OR.</p>
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

            <!-- AI Concierge Matching Banner (JT Product C Integration) -->
            <div onclick="toggleChatbot()" class="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-4 text-white shadow-xl shadow-blue-950/20 cursor-pointer card-hover border border-blue-800/40 flex items-center justify-between btn-pop relative overflow-hidden group">
                <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition"></div>
                <div class="flex items-center space-x-3.5 relative z-10">
                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-yellow-300 text-base shadow-md border border-white/20">
                        <i class="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <div>
                        <div class="flex items-center space-x-1.5">
                            <span class="font-extrabold text-[10px] uppercase tracking-wider text-blue-300">Doorstep AI Matcher</span>
                            <span class="bg-emerald-400/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded">Instant</span>
                        </div>
                        <div class="font-bold text-xs text-white leading-tight mt-0.5">Describe your task in plain English</div>
                        <div class="text-[10px] text-slate-300 mt-0.5">"Leaking pipe under sink" • "Clean 2BR apartment"</div>
                    </div>
                </div>
                <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white text-xs group-hover:bg-blue-600 transition shadow-xs relative z-10">
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            </div>

            <!-- Popular Categories Grid -->
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

            <!-- Featured Providers -->
            <div>
                <div class="flex justify-between items-center mb-3">
                    <h2 class="font-bold text-sm text-slate-900 tracking-tight">Top-Rated Providers</h2>
                    <span onclick="navigate('feed', {category: 'All'})" class="text-xs font-bold text-blue-600 cursor-pointer hover:underline">See Feed</span>
                </div>
                <div class="space-y-3">
                    ${featuredListings.map(listing => {
                        const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === listing.provider_id) || {};
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
                                <div class="text-right flex flex-col items-end space-y-1">
                                    <span class="text-xs font-extrabold text-emerald-600">$${listing.price}${priceUnit}</span>
                                    <button onclick="event.stopPropagation(); openProviderChat('${provider.provider_id}', '${listing.listing_id}')" class="text-[11px] text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-lg" title="Chat with provider">
                                        <i class="fa-solid fa-message mr-1"></i>Chat
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="h-10"></div>
        </div>
    `;
}

function executeDashboardSearch(query) {
    const trimmed = (query || '').trim();
    if (!trimmed) return;

    const words = trimmed.split(/\s+/);
    const hasNLTerms = /\b(my|need|help|under|today|tomorrow|weekend|apartment|house|leaking|drips|broken|fix|assemble|mount|fan|install|clean|movers|truck)\b/i.test(trimmed);

    if (words.length >= 3 || hasNLTerms) {
        toggleChatbot(true);
        sendQuickPrompt(trimmed);
    } else {
        navigate('feed', { search: trimmed, category: 'All' });
    }
}

function clearSearchAndRefresh() {
    state.filters.searchQuery = '';
    navigate('dashboard');
}

// --- 4. FEED / SEARCH RESULTS VIEW ---
function getFeedHTML() {
    let listings = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).filter(l => l.listing_status === 'active');

    // 1. Filter by Category
    if (state.filters.category && state.filters.category !== 'All') {
        const allowedTypes = categoryMap[state.filters.category] || [];
        listings = listings.filter(l => l.service_type.some(t => allowedTypes.includes(t)));
    }

    // 2. Filter by Search Query
    if (state.filters.searchQuery) {
        const q = state.filters.searchQuery.toLowerCase();
        listings = listings.filter(l => {
            const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === l.provider_id) || {};
            return (l.title || '').toLowerCase().includes(q) ||
                   (l.listing_description || '').toLowerCase().includes(q) ||
                   (provider.name || '').toLowerCase().includes(q) ||
                   (provider.bio || '').toLowerCase().includes(q) ||
                   (l.provider_location || '').toLowerCase().includes(q);
        });
    }

    // 3. Filter by Max Price
    if (state.filters.maxPrice) {
        listings = listings.filter(l => (l.price || 0) <= state.filters.maxPrice);
    }

    // 4. Filter by Min Rating
    if (state.filters.minRating > 0) {
        listings = listings.filter(l => (l.rating || 5.0) >= state.filters.minRating);
    }

    // 5. Sort By
    if (state.filters.sortBy === 'rating-desc') {
        listings.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (state.filters.sortBy === 'price-asc') {
        listings.sort((a, b) => a.price - b.price);
    } else if (state.filters.sortBy === 'price-desc') {
        listings.sort((a, b) => b.price - a.price);
    } else if (state.filters.sortBy === 'reviews-desc') {
        listings.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
    }

    const categories = ['All', 'Cleaning', 'Handyman', 'Moving', 'Yard & Outdoor'];

    let cardsHTML = '';
    if (listings.length === 0) {
        cardsHTML = `
            <div class="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 my-4 shadow-sm">
                <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <h3 class="font-bold text-slate-800 text-sm mb-1">No matching providers found</h3>
                <p class="text-xs text-slate-500 max-w-xs mx-auto mb-4">Try adjusting your filters or price slider to see more available options.</p>
                <button onclick="resetFilters()" class="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition btn-pop">
                    Reset All Filters
                </button>
            </div>
        `;
    } else {
        cardsHTML = listings.map(l => {
            const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === l.provider_id) || {};
            const rating = l.rating ? l.rating.toFixed(1) : '5.0';
            const priceUnit = l.price_unit === 'hourly' ? '/hr' : ' flat';
            const initial = provider.name ? provider.name.charAt(0) : 'P';

            return `
                <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-3.5 card-hover transition relative">
                    <div class="flex justify-between items-start mb-2.5">
                        <div class="flex items-center space-x-3 cursor-pointer" onclick="navigate('profile', {id: '${l.listing_id}'})">
                            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                                ${initial}
                            </div>
                            <div>
                                <div class="flex items-center space-x-1">
                                    <h3 class="font-bold text-slate-900 text-sm hover:text-blue-600 transition">${provider.name}</h3>
                                    <i class="fa-solid fa-circle-check text-blue-500 text-xs" title="Verified Provider"></i>
                                </div>
                                <span class="text-[11px] text-slate-400">${l.provider_location}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-base font-extrabold text-emerald-600">$${l.price}</span>
                            <span class="text-[11px] text-slate-400 font-normal">${priceUnit}</span>
                        </div>
                    </div>

                    <div class="cursor-pointer" onclick="navigate('profile', {id: '${l.listing_id}'})">
                        <h4 class="font-bold text-slate-800 text-xs mb-1">${l.title}</h4>
                        <p class="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">${l.listing_description}</p>
                    </div>

                    <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <div class="flex items-center space-x-3 text-slate-500">
                            <span class="text-amber-500 font-bold flex items-center">
                                <i class="fa-solid fa-star text-[10px] mr-1"></i> ${rating}
                                <span class="text-slate-400 font-normal ml-1">(${l.review_count || 0})</span>
                            </span>
                            <span class="text-slate-300">•</span>
                            <span class="text-[11px] text-slate-500"><i class="fa-solid fa-shield-halved text-blue-500 mr-1"></i>Escrow</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="openProviderChat('${provider.provider_id}', '${l.listing_id}')" class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition btn-pop" title="Message Provider">
                                <i class="fa-solid fa-message text-xs"></i>
                            </button>
                            <button onclick="navigate('profile', {id: '${l.listing_id}'})" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-sm btn-pop text-xs">
                                Book
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    return `
        <!-- Sticky Feed Header -->
        <div class="glass-header px-4 py-3 border-b border-slate-200 sticky top-0 z-10 space-y-2.5">
            <div class="flex items-center space-x-2">
                <button onclick="navigate('dashboard')" class="text-slate-500 hover:text-slate-900 p-1 btn-pop">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <div class="relative flex-1">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                    <input type="text" id="feed-search-input" placeholder="Search services..." 
                        class="w-full pl-8 pr-8 py-2 bg-slate-100 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value="${state.filters.searchQuery}"
                        oninput="handleFeedSearch(this.value)">
                    ${state.filters.searchQuery ? `
                        <button onclick="clearFeedSearch()" class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600">
                            <i class="fa-solid fa-xmark text-xs"></i>
                        </button>
                    ` : ''}
                </div>
                <button onclick="openFilterModal()" class="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition btn-pop" title="Filter & Sort">
                    <i class="fa-solid fa-sliders text-xs"></i>
                    ${state.filters.minRating > 0 || state.filters.maxPrice < 200 || state.filters.sortBy !== 'recommended' ? `
                        <span class="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                    ` : ''}
                </button>
            </div>

            <!-- Horizontal Category Chips -->
            <div class="flex space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                ${categories.map(c => {
                    const isSelected = state.filters.category === c;
                    return `
                        <button onclick="setCategoryFilter('${c}')" class="whitespace-nowrap px-3 py-1.5 rounded-full font-semibold transition btn-pop ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                            ${c}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- Feed List Container -->
        <div class="p-4 flex-1 overflow-y-auto bg-slate-50">
            ${cardsHTML}
            <div class="h-12"></div>
        </div>
    `;
}

function handleFeedSearch(val) {
    state.filters.searchQuery = val;
    navigate('feed');
}

function clearFeedSearch() {
    state.filters.searchQuery = '';
    navigate('feed');
}

function setCategoryFilter(cat) {
    state.filters.category = cat;
    navigate('feed');
}

// --- 5. PROVIDER PROFILE VIEW ---
function getProfileHTML(listingId) {
    const p = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).find(l => l.listing_id === listingId) || (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS[0] : {});
    const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(prv => prv.provider_id === p.provider_id) || {};
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
                    <span class="text-[10px] text-slate-400">${p.review_count || 0} reviews</span>
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

            <!-- Provider Direct Chat & Safety Action Row -->
            <div class="grid grid-cols-2 gap-2 mb-4">
                <button onclick="openProviderChat('${provider.provider_id}', '${p.listing_id}')" class="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2.5 px-3 rounded-xl transition btn-pop text-xs flex items-center justify-center space-x-2 border border-blue-200">
                    <i class="fa-solid fa-message text-xs"></i>
                    <span>Message Provider</span>
                </button>
                <button onclick="openReportModal('listing', '${p.listing_id}', '${p.listing_id}', null, '${provider.provider_id}')" class="bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold py-2.5 px-3 rounded-xl transition btn-pop text-xs flex items-center justify-center space-x-2 border border-slate-200">
                    <i class="fa-solid fa-shield-cat text-xs"></i>
                    <span>Safety Report</span>
                </button>
            </div>

            <!-- Bio & Service Description -->
            <div class="space-y-3 mb-5 text-xs text-slate-600">
                <div>
                    <h3 class="font-bold text-slate-900 mb-1 text-[11px] uppercase tracking-wider">Service Scope</h3>
                    <p class="leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">${p.listing_description}</p>
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 mb-1 text-[11px] uppercase tracking-wider">About Provider</h3>
                    <p class="leading-relaxed text-slate-500 italic">"${provider.bio || 'Experienced local home service provider.'}"</p>
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

function selectTime(dateStr) {
    state.booking.timeSlot = dateStr;
    const slots = document.querySelectorAll('.time-slot');
    slots.forEach(slot => {
        if (slot.getAttribute('data-date') === dateStr) {
            slot.classList.add('border-blue-600', 'bg-blue-50', 'ring-2', 'ring-blue-500/30');
            slot.classList.remove('border-slate-200', 'bg-white');
        } else {
            slot.classList.remove('border-blue-600', 'bg-blue-50', 'ring-2', 'ring-blue-500/30');
            slot.classList.add('border-slate-200', 'bg-white');
        }
    });
}

function goToCheckout() {
    if (!state.booking.timeSlot) {
        showToast('Please pick a time slot before continuing', 'fa-calendar-exclamation');
        return;
    }
    navigate('checkout');
}

// --- 6. QUICK BOOK SCHEDULING VIEW ---
function getScheduleHTML(listingId) {
    const p = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).find(l => l.listing_id === listingId) || (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS[0] : {});
    const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(prv => prv.provider_id === p.provider_id) || {};
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
            <button onclick="navigate('profile', {id: '${p.listing_id}'})" class="text-slate-500 hover:text-slate-900 p-1 btn-pop">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="font-extrabold text-sm text-slate-900">Schedule Service</h2>
            <div class="w-6"></div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
            <div>
                <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3 mb-5">
                    <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-inner">
                        ${provider.name ? provider.name.charAt(0) : 'P'}
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-xs">${provider.name}</h4>
                        <p class="text-[11px] text-slate-500 line-clamp-1">${p.title}</p>
                    </div>
                </div>

                <h3 class="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">Available Appointment Slots</h3>
                <div class="space-y-2">
                    ${availHTML}
                </div>
            </div>

            <div class="pt-4">
                <button onclick="goToCheckout()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition btn-pop">
                    Proceed to Escrow Checkout
                </button>
            </div>
        </div>
    `;
}

// --- 7. ESCROW CHECKOUT VIEW ---
function getCheckoutHTML() {
    const listing = state.activeProvider?.listing || (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS[0] : {});
    const provider = state.activeProvider?.provider || {};
    const customer = getCurrentCustomer();

    const price = listing.price || 50;
    const isHourly = listing.price_unit === 'hourly';
    const hours = state.booking.hours || 1;
    const subtotal = isHourly ? price * hours : price;
    const platformFee = subtotal * 0.15; // 15% marketplace fee
    const total = subtotal + platformFee;
    state.booking.total = total;

    const timeStr = state.booking.timeSlot ? new Date(state.booking.timeSlot).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }) : 'Pending Slot';

    return `
        <div class="glass-header px-4 py-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
            <button onclick="navigate('profile', {id: '${listing.listing_id}'})" class="text-slate-500 hover:text-slate-900 p-1 btn-pop">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="font-extrabold text-sm text-slate-900">Escrow Checkout</h2>
            <div class="w-6"></div>
        </div>

        <div class="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
            <!-- Job Summary Card -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div class="flex items-center space-x-3 pb-3 border-b border-slate-100">
                    <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm shadow-inner">
                        ${provider.name ? provider.name.charAt(0) : 'P'}
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-900 text-xs">${provider.name}</h4>
                        <p class="text-[11px] text-slate-500">${listing.title}</p>
                    </div>
                </div>

                <div class="flex justify-between items-center text-slate-600">
                    <span><i class="fa-solid fa-calendar mr-1.5 text-blue-500"></i> Date & Time</span>
                    <span class="font-bold text-slate-800">${timeStr}</span>
                </div>

                ${isHourly ? `
                    <div class="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-100">
                        <span><i class="fa-solid fa-clock mr-1.5 text-blue-500"></i> Estimated Duration</span>
                        <div class="flex items-center space-x-2">
                            <button onclick="adjustHours(-1)" class="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 btn-pop">-</button>
                            <span class="font-extrabold text-slate-800">${hours} hr</span>
                            <button onclick="adjustHours(1)" class="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 btn-pop">+</button>
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Service Address Input -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <label class="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">Service Location</label>
                <div class="relative">
                    <i class="fa-solid fa-location-dot absolute left-3 top-3 text-slate-400"></i>
                    <input type="text" id="job-address" value="${customer.address || state.booking.address}" class="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800">
                </div>
            </div>

            <!-- Escrow Trust Notice -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-3.5 rounded-2xl flex items-start space-x-3">
                <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-md">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                    <h4 class="font-extrabold text-blue-950 text-xs mb-0.5">Doorstep Escrow Guarantee</h4>
                    <p class="text-[11px] text-blue-800 leading-relaxed">
                        Funds are held securely by Doorstep and only released to the provider <strong>after you verify job completion</strong>.
                    </p>
                </div>
            </div>

            <!-- Price Breakdown -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div class="flex justify-between text-slate-500">
                    <span>Base Service ${isHourly ? `($${price}/hr × ${hours}h)` : 'Rate'}</span>
                    <span class="font-semibold text-slate-800">$${subtotal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                    <span>Doorstep Trust & Escrow Fee (15%)</span>
                    <span class="font-semibold text-slate-800">$${platformFee.toFixed(2)}</span>
                </div>
                <div class="border-t border-slate-100 pt-2 flex justify-between items-center text-sm font-extrabold">
                    <span class="text-slate-900">Total Held in Escrow</span>
                    <span class="text-emerald-600 text-base">$${total.toFixed(2)}</span>
                </div>
            </div>

            <!-- Authorize Payment CTA -->
            <div class="pt-2">
                <button onclick="processPayment()" id="pay-btn" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition btn-pop flex items-center justify-center space-x-2 text-sm">
                    <i class="fa-solid fa-lock text-xs"></i>
                    <span>Authorize $${total.toFixed(2)} in Escrow</span>
                </button>
            </div>
        </div>
    `;
}

function adjustHours(delta) {
    const newHours = (state.booking.hours || 1) + delta;
    if (newHours >= 1 && newHours <= 8) {
        state.booking.hours = newHours;
        navigate('checkout');
    }
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
        const newBooking = {
            id: 'BK-' + Math.floor(10000 + Math.random() * 90000),
            listing_id: state.activeProvider?.listing?.listing_id || 'lst_001',
            provider_id: state.activeProvider?.provider?.provider_id || 'prv_001',
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
        window.Doorstep?.recordBooking?.(newBooking);
        saveCurrentCustomerState();
        navigate('confirmation');
        showToast('Escrow Payment Authorized!', 'fa-shield-halved');
    }, 1100);
}

// --- 8. CONFIRMATION VIEW ---
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

// --- 9. MY BOOKINGS, REVIEWS & SAFETY AUDIT VIEW ---
function getMyBookingsHTML() {
    const upcoming = state.bookingsList.filter(b => b.status === 'upcoming');
    const completed = state.bookingsList.filter(b => b.status === 'completed');
    const reports = state.reportsList || [];
    const customer = getCurrentCustomer();

    return `
        <div class="glass-header px-4 py-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
            <button onclick="navigate('dashboard')" class="text-slate-500 hover:text-slate-900 p-1 btn-pop">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div class="text-center">
                <h2 class="font-extrabold text-sm text-slate-900">My Bookings & Activity</h2>
                <span class="text-[10px] text-slate-400">Account: ${customer.name}</span>
            </div>
            <button onclick="openPersonaModal()" class="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition btn-pop">
                Switch
            </button>
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

                        <!-- Action Bar for Upcoming Booking -->
                        <div class="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                            <button onclick="openProviderChat('${b.provider_id || 'prv_001'}', '${b.listing_id || 'lst_001'}')" class="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-2 rounded-xl transition btn-pop text-center">
                                <i class="fa-solid fa-message mr-1"></i>Chat
                            </button>
                            <button onclick="openReportModal('booking', '${b.id}', '${b.listing_id}', '${b.id}', '${b.provider_id}')" class="bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold py-2 rounded-xl transition btn-pop text-center">
                                <i class="fa-solid fa-shield-cat mr-1"></i>Report
                            </button>
                            <button onclick="triggerJobCompletion('${b.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition shadow-sm btn-pop text-center">
                                <i class="fa-solid fa-check mr-1"></i>Complete
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

            <!-- Trust & Safety Reports Section (Product B ➔ Product D Bridge) -->
            <div>
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-xs uppercase tracking-wider text-rose-700 flex items-center">
                        <i class="fa-solid fa-shield-cat mr-2 text-rose-500"></i> Trust & Safety Cases (${reports.length})
                    </h3>
                </div>

                ${reports.length === 0 ? `
                    <div class="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                        No active safety reports filed for this account.
                    </div>
                ` : reports.map(rep => `
                    <div class="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm mb-3">
                        <div class="flex justify-between items-start mb-1.5">
                            <div>
                                <span class="font-mono text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">${rep.report_id}</span>
                                <h4 class="font-bold text-slate-900 text-xs mt-1 capitalize">${(rep.safety_flag_type || '').replace(/_/g, ' ')}</h4>
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                ${rep.status || 'Under Review'}
                            </span>
                        </div>
                        <p class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">${rep.report_details}</p>
                        <div class="text-[10px] text-slate-400 mt-2 flex justify-between items-center">
                            <span>Filed: ${new Date(rep.created_at).toLocaleDateString()}</span>
                            <span class="text-rose-600 font-medium">Assigned to Product D Moderation</span>
                        </div>
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
    saveCurrentCustomerState();
    showToast('Job completed! Escrow released to provider.', 'fa-circle-check');
    openReviewModal(bookingId);
}

// --- 10. DIRECT CUSTOMER ↔ PROVIDER CHAT ENGINE ---
function openProviderChat(providerId, listingId) {
    const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === providerId) || {
        provider_id: providerId,
        name: 'Provider Pro'
    };
    const listing = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).find(l => l.listing_id === listingId) || (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS[0] : {});

    state.activeChatProvider = provider;
    state.activeChatListing = listing;

    const modal = document.getElementById('provider-chat-modal');
    const avatarEl = document.getElementById('provider-chat-avatar');
    const nameEl = document.getElementById('provider-chat-name');
    const statusEl = document.getElementById('provider-chat-status');
    const bookBtn = document.getElementById('provider-chat-book-btn');

    if (avatarEl) avatarEl.textContent = provider.name.charAt(0);
    if (nameEl) nameEl.textContent = provider.name;
    if (statusEl) statusEl.textContent = `Active • ${listing.title || 'Verified Provider'}`;
    if (bookBtn) {
        bookBtn.onclick = () => {
            closeProviderChat();
            navigate('schedule', { id: listing.listing_id });
        };
    }

    renderProviderChatFeed(providerId);

    if (modal) modal.classList.remove('hidden');
}

function closeProviderChat() {
    const modal = document.getElementById('provider-chat-modal');
    if (modal) modal.classList.add('hidden');
}

function renderProviderChatFeed(providerId) {
    const feed = document.getElementById('provider-chat-feed');
    if (!feed) return;

    const thread = state.messages[providerId] || [
        {
            id: 'init_msg',
            sender: 'provider',
            text: `Hi there! I'm ${state.activeChatProvider?.name || 'your provider'}. Feel free to message me with any questions about my services!`,
            timestamp: new Date().toISOString()
        }
    ];

    feed.innerHTML = thread.map(m => {
        const isCustomer = m.sender === 'customer';
        const timeStr = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isCustomer) {
            return `
                <div class="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-sm text-xs leading-relaxed">
                    <p>${m.text}</p>
                    <div class="text-[9px] text-blue-200 text-right mt-1">${timeStr} ✓</div>
                </div>
            `;
        } else {
            return `
                <div class="bg-white border border-slate-200/80 p-3 rounded-2xl rounded-tl-none self-start max-w-[85%] shadow-sm text-xs text-slate-800 leading-relaxed">
                    <p>${m.text}</p>
                    <div class="text-[9px] text-slate-400 mt-1">${timeStr}</div>
                </div>
            `;
        }
    }).join('');

    feed.scrollTop = feed.scrollHeight;
}

function sendProviderQuickMsg(text) {
    const input = document.getElementById('provider-chat-input');
    if (input) input.value = text;
    sendProviderChatMessage();
}

function sendProviderChatMessage() {
    const input = document.getElementById('provider-chat-input');
    const msg = (input ? input.value : '').trim();
    if (!msg || !state.activeChatProvider) return;

    const providerId = state.activeChatProvider.provider_id;
    if (!state.messages[providerId]) state.messages[providerId] = [];

    const newMsg = {
        id: 'msg_' + Date.now(),
        sender: 'customer',
        text: msg,
        timestamp: new Date().toISOString()
    };

    state.messages[providerId].push(newMsg);
    saveCurrentCustomerState();
    input.value = '';
    renderProviderChatFeed(providerId);

    // Show Provider Typing Indicator
    const typingIndicator = document.getElementById('provider-typing-indicator');
    const typingLabel = document.getElementById('typing-provider-label');
    if (typingIndicator) {
        if (typingLabel) typingLabel.textContent = `${state.activeChatProvider.name} is typing...`;
        typingIndicator.classList.remove('hidden');
    }

    // Realistic Simulated Provider Response Engine
    setTimeout(() => {
        if (typingIndicator) typingIndicator.classList.add('hidden');

        const lowerMsg = msg.toLowerCase();
        let reply = "Thanks for your message! Yes, I have open slots available this week. Feel free to book directly through my schedule!";

        if (lowerMsg.includes('saturday') || lowerMsg.includes('weekend') || lowerMsg.includes('availab')) {
            reply = `Yes, I am available this weekend! You can pick any of the green time slots on my booking page.`;
        } else if (lowerMsg.includes('estimate') || lowerMsg.includes('quote') || lowerMsg.includes('cost') || lowerMsg.includes('price')) {
            reply = `My standard rate is $${state.activeChatListing?.price || 50} ${state.activeChatListing?.price_unit === 'hourly' ? 'per hour' : 'flat'}. Everything is protected through Doorstep Escrow!`;
        } else if (lowerMsg.includes('tool') || lowerMsg.includes('suppl') || lowerMsg.includes('equipment')) {
            reply = `I bring all necessary tools, supplies, and protective equipment for the job unless you have special preferences.`;
        } else if (lowerMsg.includes('clean')) {
            reply = `I bring non-toxic, eco-friendly supplies and microfiber mops for thorough cleaning. Looking forward to helping!`;
        }

        const replyMsg = {
            id: 'msg_reply_' + Date.now(),
            sender: 'provider',
            text: reply,
            timestamp: new Date().toISOString()
        };

        state.messages[providerId].push(replyMsg);
        saveCurrentCustomerState();
        renderProviderChatFeed(providerId);
    }, 950);
}

// --- 11. TRUST & SAFETY INCIDENT REPORTING ENGINE (Product B ➔ Product D Bridge) ---
function openReportModal(targetType, targetId, listingId, bookingId, providerId) {
    const listing = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).find(l => l.listing_id === listingId) || {};
    const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === (providerId || listing.provider_id)) || {};
    const customer = getCurrentCustomer();

    state.activeReportTarget = {
        targetType: targetType || 'listing',
        targetId: targetId,
        listing_id: listingId || 'lst_001',
        provider_id: provider.provider_id || 'prv_001',
        booking_id: bookingId || null
    };

    const titleEl = document.getElementById('report-target-title');
    const metaEl = document.getElementById('report-target-meta');
    const detailsInput = document.getElementById('report-details-input');
    const evidenceInput = document.getElementById('report-evidence-input');

    if (titleEl) titleEl.textContent = `${provider.name || 'Provider'} • ${listing.title || 'Home Service'}`;
    if (metaEl) metaEl.textContent = `Listing ID: ${listing.listing_id || 'lst_001'} • Reporter: ${customer.name}`;
    if (detailsInput) detailsInput.value = '';
    if (evidenceInput) evidenceInput.value = '';

    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.add('hidden');
}

function submitSafetyReport() {
    const detailsInput = document.getElementById('report-details-input');
    const evidenceInput = document.getElementById('report-evidence-input');
    const selectedRadio = document.querySelector('input[name="safety_flag"]:checked');

    const details = (detailsInput ? detailsInput.value : '').trim();
    const evidence = (evidenceInput ? evidenceInput.value : '').trim();
    const flagType = selectedRadio ? selectedRadio.value : 'payment_request_off_platform';

    if (!details) {
        showToast('Please provide details about the incident', 'fa-triangle-exclamation');
        return;
    }

    const reportObj = {
        report_id: 'report_' + Math.floor(10000 + Math.random() * 90000),
        reporter_customer_id: state.currentCustomerId,
        listing_id: state.activeReportTarget?.listing_id || 'lst_001',
        provider_id: state.activeReportTarget?.provider_id || 'prv_001',
        booking_id: state.activeReportTarget?.booking_id || null,
        safety_flag_type: flagType,
        report_details: details,
        evidence_url: evidence,
        created_at: new Date().toISOString(),
        status: 'in_review'
    };

    if (!state.reportsList) state.reportsList = [];
    state.reportsList.unshift(reportObj);
    saveCurrentCustomerState();

    closeReportModal();
    showToast('Report filed with Trust & Safety (Product D)', 'fa-shield-cat');

    if (state.currentView === 'my-bookings') {
        navigate('my-bookings');
    }
}

// --- 12. FILTER & SORT MODAL CONTROLLER ---
function openFilterModal() {
    const modal = document.getElementById('filter-modal');
    if (!modal) return;

    state.tempFilters = { ...state.filters };

    // Render category chips in filter drawer
    const container = document.getElementById('filter-category-chips');
    if (container) {
        const cats = ['All', 'Cleaning', 'Handyman', 'Moving', 'Yard & Outdoor'];
        container.innerHTML = cats.map(cat => {
            const isSelected = state.tempFilters.category === cat;
            return `
                <button onclick="selectTempCategory('${cat}')" class="category-filter-chip px-3.5 py-2 rounded-xl text-xs font-bold transition btn-pop ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" data-category="${cat}">
                    ${cat}
                </button>
            `;
        }).join('');
    }

    const slider = document.getElementById('filter-price-slider');
    if (slider) slider.value = state.tempFilters.maxPrice;
    updatePriceSliderDisplay(state.tempFilters.maxPrice);

    selectMinRating(state.tempFilters.minRating);

    const sortSelect = document.getElementById('filter-sort-select');
    if (sortSelect) sortSelect.value = state.tempFilters.sortBy;

    modal.classList.remove('hidden');
}

function closeFilterModal() {
    const modal = document.getElementById('filter-modal');
    if (modal) modal.classList.add('hidden');
}

function selectTempCategory(cat) {
    state.tempFilters.category = cat;
    const chips = document.querySelectorAll('.category-filter-chip');
    chips.forEach(chip => {
        if (chip.getAttribute('data-category') === cat) {
            chip.classList.add('bg-blue-600', 'text-white', 'shadow-md');
            chip.classList.remove('bg-slate-100', 'text-slate-700');
        } else {
            chip.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
            chip.classList.add('bg-slate-100', 'text-slate-700');
        }
    });
}

function updatePriceSliderDisplay(val) {
    const label = document.getElementById('filter-price-val');
    if (label) label.textContent = `$${val}`;
    state.tempFilters.maxPrice = parseInt(val, 10);
}

function selectMinRating(rating) {
    state.tempFilters.minRating = parseFloat(rating);
    const chips = document.querySelectorAll('.rating-chip');
    chips.forEach(chip => {
        if (parseFloat(chip.getAttribute('data-rating')) === state.tempFilters.minRating) {
            chip.classList.add('border-blue-600', 'bg-blue-50', 'text-blue-700', 'font-bold');
            chip.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
        } else {
            chip.classList.remove('border-blue-600', 'bg-blue-50', 'text-blue-700', 'font-bold');
            chip.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
        }
    });
}

function applyFiltersAndClose() {
    const sortSelect = document.getElementById('filter-sort-select');
    if (sortSelect) state.tempFilters.sortBy = sortSelect.value;

    state.filters = { ...state.tempFilters };
    closeFilterModal();
    navigate('feed');
    showToast('Filters applied successfully', 'fa-sliders');
}

function resetFilters() {
    state.filters = {
        category: 'All',
        searchQuery: '',
        maxPrice: 200,
        minRating: 0,
        sortBy: 'recommended'
    };
    state.tempFilters = { ...state.filters };
    closeFilterModal();
    navigate('feed');
    showToast('Filters reset to default', 'fa-rotate-left');
}

// --- 13. RATING & REVIEW MODAL CONTROLLER ---
function openReviewModal(bookingId) {
    state.currentReviewBookingId = bookingId;
    state.reviewRating = 5;
    setReviewStar(5);

    const b = state.bookingsList.find(item => item.id === bookingId);
    if (b) {
        const titleEl = document.getElementById('review-modal-title');
        const subEl = document.getElementById('review-modal-subtitle');
        if (titleEl) titleEl.textContent = `Rate ${b.provider_name}`;
        if (subEl) subEl.textContent = b.title;
    }

    const reviewInput = document.getElementById('review-text');
    if (reviewInput) reviewInput.value = '';

    const modal = document.getElementById('review-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) modal.classList.add('hidden');
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
    const reviewInput = document.getElementById('review-text');
    const text = (reviewInput ? reviewInput.value : '').trim();

    if (b) {
        b.rating = state.reviewRating;
        b.review = text || 'Excellent service and great communication!';
    }

    saveCurrentCustomerState();
    closeReviewModal();
    showToast('Review submitted & Escrow finalized! ★★★★★', 'fa-star');
    navigate('my-bookings');
}

// --- 14. LEAFLET MAP CONTROLLER ---
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

    const activeListings = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).filter(l => l.listing_status === 'active');

    activeListings.forEach(listing => {
        const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(prv => prv.provider_id === listing.provider_id);
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

    setTimeout(() => {
        if (mapInstance) mapInstance.invalidateSize();
    }, 200);
}

// --- 15. GROUNDED AI ASSISTANT / CHATBOT CONTROLLER (JT Product C Integration) ---
function toggleChatbot(forceOpen = null) {
    const modal = document.getElementById('chatbot-modal');
    if (!modal) return;
    
    if (forceOpen === true) {
        modal.classList.remove('hidden');
    } else if (forceOpen === false) {
        modal.classList.add('hidden');
    } else {
        modal.classList.toggle('hidden');
    }

    state.chatbot.isOpen = !modal.classList.contains('hidden');

    if (state.chatbot.isOpen) {
        if (state.chatbot.messages.length === 0) {
            initChatbotGreeting();
        }
        renderChatbot();
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) input.focus();
        }, 150);
    }
}

function initChatbotGreeting() {
    const customer = getCurrentCustomer();
    const firstName = customer.name ? customer.name.split(' ')[0] : 'there';
    
    state.chatbot.messages = [
        {
            id: 'msg_welcome',
            from: 'bot',
            type: 'text',
            text: `Hi ${firstName}! 👋 Describe any household task in plain English and I will interpret the job, match verified Portland pros, and help you reserve a slot on the spot.`
        }
    ];
}

function clearChatbotHistory() {
    state.chatbot.messages = [];
    state.chatbot.activeFilters = {
        service_types: [],
        max_price: null,
        neighborhood: null,
        urgency: null
    };
    state.chatbot.expandedListingId = null;
    initChatbotGreeting();
    renderChatbot();
    showToast('Chat history reset', 'fa-rotate-left');
}

function sendQuickPrompt(promptText) {
    const input = document.getElementById('chat-input');
    if (input) {
        input.value = promptText;
        sendChatMessage();
    }
}

function renderChatFilterPills() {
    const pillsContainer = document.getElementById('chat-filter-pills');
    if (!pillsContainer) return;

    const filters = state.chatbot.activeFilters;
    const chips = [];
    const labelByCode = {
        cleaning_standard: 'Standard Clean',
        cleaning_deep: 'Deep Clean',
        handyman_general: 'Handyman',
        plumbing: 'Plumbing',
        electrical: 'Electrical',
        moving_help: 'Moving Help',
        junk_removal: 'Junk Removal',
        yard_outdoor: 'Yard & Outdoor'
    };

    (filters.service_types || []).forEach(code => {
        chips.push({ key: 'service_types', value: code, label: labelByCode[code] || code, icon: 'fa-tag' });
    });

    if (filters.max_price != null) {
        chips.push({ key: 'max_price', value: null, label: `Under $${filters.max_price}`, icon: 'fa-dollar-sign' });
    }

    if (filters.neighborhood) {
        chips.push({ key: 'neighborhood', value: null, label: filters.neighborhood, icon: 'fa-location-dot' });
    }

    if (filters.urgency) {
        const urgencyLabels = { urgent: 'Urgent (ASAP)', today: 'Today', tomorrow: 'Tomorrow', this_week: 'This Week' };
        chips.push({ key: 'urgency', value: null, label: urgencyLabels[filters.urgency] || filters.urgency, icon: 'fa-clock' });
    }

    if (chips.length === 0) {
        pillsContainer.classList.add('hidden');
        pillsContainer.innerHTML = '';
        return;
    }

    pillsContainer.classList.remove('hidden');
    pillsContainer.innerHTML = `
        <span class="text-[10px] font-bold uppercase text-blue-900 mr-1 flex items-center">
            <i class="fa-solid fa-sliders text-blue-600 mr-1"></i> Active Filters:
        </span>
        ${chips.map(chip => `
            <span class="inline-flex items-center space-x-1 bg-white border border-blue-200 text-blue-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                <i class="fa-solid ${chip.icon} text-[9px] text-blue-500"></i>
                <span>${chip.label}</span>
                <button onclick="removeChatFilter('${chip.key}', '${chip.value || ''}')" class="text-blue-400 hover:text-blue-700 ml-1 text-xs font-extrabold focus:outline-none" title="Remove filter">
                    &times;
                </button>
            </span>
        `).join('')}
        <button onclick="applyChatFiltersToFeed()" class="ml-auto text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-300 px-2 py-0.5 rounded-lg shadow-xs hover:bg-blue-50 transition">
            View in Search & Map &rarr;
        </button>
    `;
}

function removeChatFilter(key, value) {
    if (key === 'service_types') {
        state.chatbot.activeFilters.service_types = (state.chatbot.activeFilters.service_types || []).filter(c => c !== value);
    } else {
        state.chatbot.activeFilters[key] = null;
    }

    // Re-run matching with updated filters
    const activeListings = ChatbotEngine.getActiveListings();
    const ranked = ChatbotEngine.matchListings(state.chatbot.activeFilters, activeListings, { query: '' });
    const enriched = ChatbotEngine.enrichResults(ranked, state.chatbot.activeFilters, '');

    state.chatbot.messages.push({
        id: `msg_${Date.now()}`,
        from: 'bot',
        type: 'results',
        text: `Updated filters. Found ${ranked.length} match${ranked.length === 1 ? '' : 'es'}:`,
        results: enriched
    });

    renderChatbot();
}

function renderChatbot() {
    renderChatFilterPills();
    const history = document.getElementById('chat-history');
    if (!history) return;

    const labelByCode = {
        cleaning_standard: 'Home Cleaning',
        cleaning_deep: 'Deep Cleaning',
        handyman_general: 'Handyman & Assembly',
        plumbing: 'Plumbing Repairs',
        electrical: 'Electrical & Fixtures',
        moving_help: 'Moving & Heavy Lifting',
        junk_removal: 'Junk Removal',
        yard_outdoor: 'Yard & Outdoor Cleanup'
    };

    let html = '';

    state.chatbot.messages.forEach(msg => {
        if (msg.from === 'user') {
            html += `
                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-md text-xs leading-relaxed">
                    <p class="font-medium">${msg.text}</p>
                </div>
            `;
        } else if (msg.from === 'bot') {
            if (msg.type === 'text') {
                html += `
                    <div class="bg-white border border-slate-200/80 p-3.5 rounded-2xl rounded-tl-none self-start max-w-[88%] shadow-sm text-xs text-slate-800 leading-relaxed">
                        <p>${msg.text}</p>
                    </div>
                `;
            } else if (msg.type === 'request_summary') {
                const req = msg.request || {};
                const serviceLabels = (req.service_types || []).map(c => labelByCode[c] || c).join(' + ') || 'General Service';
                const urgencyLabels = { urgent: 'Urgent (Today / Tomorrow)', today: 'Today', tomorrow: 'Tomorrow', this_week: 'This Week' };

                html += `
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50/70 border border-blue-200/80 p-3.5 rounded-2xl rounded-tl-none self-start max-w-[92%] shadow-sm text-xs text-slate-800">
                        <div class="flex items-center space-x-1.5 text-blue-700 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                            <i class="fa-solid fa-clipboard-check"></i>
                            <span>Interpreted Service Request</span>
                        </div>
                        <p class="font-semibold text-slate-900 italic text-xs mb-2">“${req.rawQuery}”</p>
                        
                        <div class="grid grid-cols-2 gap-2 text-[11px] bg-white/80 p-2.5 rounded-xl border border-blue-100">
                            <div>
                                <span class="text-slate-400 font-medium block text-[9px] uppercase">Service Type</span>
                                <span class="font-bold text-slate-800">${serviceLabels}</span>
                            </div>
                            ${req.neighborhood ? `
                                <div>
                                    <span class="text-slate-400 font-medium block text-[9px] uppercase">Location Area</span>
                                    <span class="font-bold text-slate-800">${req.neighborhood}</span>
                                </div>
                            ` : ''}
                            ${req.urgency ? `
                                <div>
                                    <span class="text-slate-400 font-medium block text-[9px] uppercase">Timing / Urgency</span>
                                    <span class="font-bold text-slate-800">${urgencyLabels[req.urgency] || req.urgency}</span>
                                </div>
                            ` : ''}
                            ${req.max_price ? `
                                <div>
                                    <span class="text-slate-400 font-medium block text-[9px] uppercase">Target Budget</span>
                                    <span class="font-bold text-emerald-600">Under $${req.max_price}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else if (msg.type === 'results') {
                const results = msg.results || [];
                html += `
                    <div class="self-start max-w-[95%] space-y-2.5 w-full">
                        <div class="bg-white border border-slate-200/80 p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-800 font-medium">
                            ${msg.text}
                        </div>
                        
                        <div class="space-y-2.5">
                            ${results.map(l => {
                                const isExpanded = state.chatbot.expandedListingId === l.listing_id;
                                const provider = l.provider || {};
                                const rating = l.rating ? l.rating.toFixed(1) : '5.0';
                                const priceUnit = l.price_unit === 'hourly' ? '/hr' : ' flat';
                                const availLabel = ChatbotEngine.availabilityLabel(l);
                                const slots = (l.availability || []).filter(s => s.slice(0, 10) >= ChatbotEngine.MOCK_META.reference_date).slice(0, 4);

                                return `
                                    <div class="bg-white border ${isExpanded ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/90'} rounded-2xl p-3.5 shadow-sm transition card-hover">
                                        <div class="flex justify-between items-start cursor-pointer" onclick="toggleChatListingDetails('${l.listing_id}')">
                                            <div class="flex-1 pr-2">
                                                <div class="flex items-center space-x-1.5">
                                                    <span class="font-extrabold text-slate-900 text-xs">${provider.name || 'Doorstep Pro'}</span>
                                                    <i class="fa-solid fa-circle-check text-blue-500 text-[10px]"></i>
                                                </div>
                                                <div class="text-[11px] font-bold text-blue-600 mt-0.5 line-clamp-1">${l.title}</div>
                                                <div class="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                                                    <span class="text-amber-500 font-bold"><i class="fa-solid fa-star text-[9px]"></i> ${rating} (${l.review_count || 0})</span>
                                                    <span>•</span>
                                                    <span class="text-emerald-600 font-bold">${availLabel}</span>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <span class="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">$${l.price}${priceUnit}</span>
                                                <div class="text-[10px] text-slate-400 mt-1">
                                                    <i class="fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Match Reason Tag -->
                                        <div class="mt-2 text-[10px] bg-slate-100/80 text-slate-600 px-2.5 py-1 rounded-lg flex items-center space-x-1">
                                            <i class="fa-solid fa-circle-nodes text-blue-500 text-[9px]"></i>
                                            <span class="font-medium">${l.reason || 'Matches your request'}</span>
                                        </div>

                                        <!-- Expanded Details & Slot Picker -->
                                        ${isExpanded ? `
                                            <div class="mt-3 pt-3 border-t border-slate-100 space-y-3 slide-up">
                                                <p class="text-[11px] text-slate-600 leading-relaxed">${l.listing_description}</p>
                                                
                                                <div class="bg-blue-50/60 p-2.5 rounded-xl text-[10px] text-slate-700 flex justify-between items-center">
                                                    <span>Base: <strong>${l.provider_location}</strong></span>
                                                    <span>Radius: <strong>${l.service_radius_miles} mi</strong></span>
                                                    <span>Duration: <strong>~${l.duration_estimate_minutes || 60}m</strong></span>
                                                </div>

                                                <!-- Slot Selector -->
                                                <div>
                                                    <label class="block text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                                                        Select Preferred Appointment Slot:
                                                    </label>
                                                    <div class="grid grid-cols-2 gap-1.5">
                                                        ${slots.length > 0 ? slots.map(slotStr => {
                                                            const { day, time } = ChatbotEngine.formatSlotParts(slotStr);
                                                            return `
                                                                <button onclick="bookChatSlot('${l.listing_id}', '${slotStr}', ${l.price})" class="p-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-600 hover:text-white text-slate-800 text-left transition group shadow-xs btn-pop">
                                                                    <div class="text-[10px] font-bold group-hover:text-white">${day}</div>
                                                                    <div class="text-[9px] text-blue-600 group-hover:text-blue-100 font-semibold">${time}</div>
                                                                </button>
                                                            `;
                                                        }).join('') : `
                                                            <div class="col-span-2 text-[10px] text-slate-400 italic">No instant slots open. Contact provider directly.</div>
                                                        `}
                                                    </div>
                                                </div>

                                                <!-- Action Buttons -->
                                                <div class="grid grid-cols-2 gap-2 pt-1">
                                                    <button onclick="toggleChatbot(false); navigate('profile', {id: '${l.listing_id}'})" class="bg-white border border-slate-200 hover:border-blue-500 text-slate-700 font-bold py-2 rounded-xl text-center transition text-xs btn-pop">
                                                        <i class="fa-solid fa-user-tie mr-1"></i> Full Profile
                                                    </button>
                                                    <button onclick="toggleChatbot(false); navigate('schedule', {id: '${l.listing_id}'})" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-center transition text-xs shadow-md shadow-blue-500/20 btn-pop">
                                                        <i class="fa-solid fa-calendar-check mr-1"></i> Escrow Book
                                                    </button>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            } else if (msg.type === 'booking_confirmation') {
                const bkg = msg.booking || {};
                html += `
                    <div class="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl rounded-tl-none self-start max-w-[92%] shadow-lg text-xs slide-up">
                        <div class="flex items-center space-x-1.5 font-extrabold text-[11px] uppercase tracking-wider text-emerald-100 mb-1">
                            <i class="fa-solid fa-circle-check text-white"></i>
                            <span>Appointment Reserved!</span>
                        </div>
                        <div class="font-extrabold text-sm text-white">${bkg.title}</div>
                        <div class="text-xs text-emerald-100 font-semibold">With ${bkg.provider_name}</div>
                        
                        <div class="bg-white/15 backdrop-blur-md rounded-xl p-2.5 my-2.5 space-y-1 text-[11px] text-white">
                            <div>🗓️ <strong>${ChatbotEngine.formatSlot(bkg.timeSlot)}</strong></div>
                            <div>📍 ${bkg.address}</div>
                            <div>💳 <strong>$${bkg.total.toFixed(2)}</strong> (Held safely in Doorstep Escrow)</div>
                        </div>

                        <div class="flex space-x-2 pt-1">
                            <button onclick="toggleChatbot(false); navigate('my-bookings')" class="flex-1 bg-white text-emerald-800 hover:bg-emerald-50 font-bold py-1.5 rounded-lg text-center transition text-xs shadow-xs">
                                View in Bookings
                            </button>
                            <button onclick="cancelChatBooking('${bkg.id}')" class="text-emerald-100 hover:text-white px-2 py-1.5 text-[10px] font-semibold underline">
                                Cancel
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    });

    if (state.chatbot.isTyping) {
        html += `
            <div class="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none self-start shadow-sm flex items-center space-x-1 text-slate-400">
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
        `;
    }

    history.innerHTML = html;
    history.scrollTop = history.scrollHeight;
}

function toggleChatListingDetails(listingId) {
    state.chatbot.expandedListingId = (state.chatbot.expandedListingId === listingId) ? null : listingId;
    renderChatbot();
}

function bookChatSlot(listingId, slotStr, price) {
    const listing = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).find(l => l.listing_id === listingId);
    if (!listing) return;
    const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === listing.provider_id) || {};
    const customer = getCurrentCustomer();

    const bookingId = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking = {
        id: bookingId,
        listing_id: listing.listing_id,
        provider_id: listing.provider_id,
        title: listing.title,
        provider_name: provider.name || 'Doorstep Pro',
        timeSlot: slotStr,
        address: customer.address || '1420 NW Lovejoy St, Portland, OR',
        total: price || listing.price,
        status: 'upcoming',
        escrowStatus: 'held',
        rating: null,
        review: null
    };

    state.bookingsList.unshift(newBooking);
    window.Doorstep?.recordBooking?.(newBooking);
    saveBookingsToStorage();
    updateNavBadge();

    state.chatbot.messages.push({
        id: `msg_bkg_${Date.now()}`,
        from: 'bot',
        type: 'booking_confirmation',
        booking: newBooking
    });

    state.chatbot.expandedListingId = null;
    renderChatbot();
    showToast(`Booked with ${provider.name}! Escrow active.`, 'fa-circle-check');
}

function cancelChatBooking(bookingId) {
    const b = state.bookingsList.find(item => item.id === bookingId);
    if (b) {
        b.status = 'cancelled';
        b.escrowStatus = 'refunded';
        saveBookingsToStorage();
        updateNavBadge();
    }

    state.chatbot.messages.push({
        id: `msg_cancel_${Date.now()}`,
        from: 'bot',
        type: 'text',
        text: `Booking ${bookingId} has been cancelled and any held funds have been released back to your payment method.`
    });

    renderChatbot();
    showToast(`Booking ${bookingId} cancelled`, 'fa-rotate-left');
}

function applyChatFiltersToFeed() {
    const activeFilters = state.chatbot.activeFilters;
    state.filters.searchQuery = '';
    
    if (activeFilters.service_types && activeFilters.service_types.length > 0) {
        const code = activeFilters.service_types[0];
        for (const [catName, codes] of Object.entries(categoryMap)) {
            if (codes.includes(code)) {
                state.filters.category = catName;
                break;
            }
        }
    } else {
        state.filters.category = 'All';
    }

    if (activeFilters.max_price) {
        state.filters.maxPrice = activeFilters.max_price;
    }

    toggleChatbot(false);
    navigate('feed', { category: state.filters.category });
    showToast('Marketplace search synced with AI filters!', 'fa-sliders');
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = (input ? input.value : '').trim();
    if (!msg) return;

    state.chatbot.messages.push({
        id: `msg_user_${Date.now()}`,
        from: 'user',
        type: 'text',
        text: msg
    });

    input.value = '';
    state.chatbot.isTyping = true;
    renderChatbot();

    setTimeout(() => {
        state.chatbot.isTyping = false;
        const localIntent = ChatbotEngine.detectLocalIntent(msg);

        if (localIntent === 'greeting') {
            state.chatbot.messages.push({
                id: `msg_${Date.now()}`,
                from: 'bot',
                type: 'text',
                text: "Hello! What kind of home service or repair can I match for you today?"
            });
            renderChatbot();
            return;
        }

        if (localIntent === 'help') {
            state.chatbot.messages.push({
                id: `msg_${Date.now()}`,
                from: 'bot',
                type: 'text',
                text: "Tell me what needs fixing, cleaning, or moving around the house. I'll identify the required trades, check distance from your neighborhood, verify budget limits, and find open schedule slots."
            });
            renderChatbot();
            return;
        }

        if (localIntent === 'list_bookings') {
            const activeBookings = state.bookingsList.filter(b => b.status === 'upcoming');
            if (activeBookings.length === 0) {
                state.chatbot.messages.push({
                    id: `msg_${Date.now()}`,
                    from: 'bot',
                    type: 'text',
                    text: "You don't have any upcoming bookings right now. Tell me what job you need done to find a pro!"
                });
            } else {
                const summary = activeBookings.map(b => `• ${b.title} (${b.provider_name}) on ${ChatbotEngine.formatSlot(b.timeSlot)}`).join('\n');
                state.chatbot.messages.push({
                    id: `msg_${Date.now()}`,
                    from: 'bot',
                    type: 'text',
                    text: `You have ${activeBookings.length} upcoming booking${activeBookings.length === 1 ? '' : 's'}:\n${summary}`
                });
            }
            renderChatbot();
            return;
        }

        if (localIntent === 'unsupported_service') {
            state.chatbot.messages.push({
                id: `msg_${Date.now()}`,
                from: 'bot',
                type: 'text',
                text: "Doorstep focuses on home cleaning, handyman tasks, plumbing, electrical, moving help, junk removal, and yard maintenance. We don't currently support roofing or pest control."
            });
            renderChatbot();
            return;
        }

        // Job query intake
        const parsed = ChatbotEngine.parseJob(msg);
        parsed.rawQuery = msg;

        // Merge filters
        const mergedFilters = {
            service_types: parsed.service_types.length > 0 ? parsed.service_types : state.chatbot.activeFilters.service_types,
            max_price: parsed.max_price != null ? parsed.max_price : state.chatbot.activeFilters.max_price,
            neighborhood: parsed.neighborhood != null ? parsed.neighborhood : state.chatbot.activeFilters.neighborhood,
            urgency: parsed.urgency != null ? parsed.urgency : state.chatbot.activeFilters.urgency,
        };
        state.chatbot.activeFilters = mergedFilters;

        // Request Summary
        state.chatbot.messages.push({
            id: `msg_summary_${Date.now()}`,
            from: 'bot',
            type: 'request_summary',
            request: { ...mergedFilters, rawQuery: msg }
        });

        // Match & Rank Listings
        const activeListings = ChatbotEngine.getActiveListings();
        const ranked = ChatbotEngine.matchListings(mergedFilters, activeListings, { query: msg });
        const enriched = ChatbotEngine.enrichResults(ranked, mergedFilters, msg);

        if (enriched.length === 0) {
            state.chatbot.messages.push({
                id: `msg_results_${Date.now()}`,
                from: 'bot',
                type: 'text',
                text: mergedFilters.neighborhood
                    ? `No providers currently serve ${mergedFilters.neighborhood} under those constraints. Try clearing the neighborhood filter above.`
                    : "No exact matches found. Try broadening your budget or describing the job with a few more details."
            });
        } else {
            state.chatbot.messages.push({
                id: `msg_results_${Date.now()}`,
                from: 'bot',
                type: 'results',
                text: `Found ${ranked.length} match${ranked.length === 1 ? '' : 'es'}. Here are the top providers ranked for your job:`,
                results: enriched
            });
        }

        renderChatbot();
    }, 450);
}

// --- 16. TOAST NOTIFICATION HELPER ---
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
    }, 3200);
}

// --- 17. APP BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', async () => {
    // Chat enter key listeners
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }

    const providerChatInput = document.getElementById('provider-chat-input');
    if (providerChatInput) {
        providerChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendProviderChatMessage();
        });
    }

    try {
        await initData();
        const savedPersona = localStorage.getItem('doorstep_active_persona') || 'cust_00001';
        state.currentCustomerId = savedPersona;
        initCustomerState(savedPersona);
        navigate('dashboard');
    } catch (err) {
        console.error("Initialization error:", err);
        navigate('dashboard');
    }
});
