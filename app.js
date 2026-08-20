// Global State
let state = {
    activeProvider: null,
    booking: {
        timeSlot: null,
        address: null,
        total: 0
    }
};

const categoryMap = {
    'Cleaning': ['cleaning_standard', 'cleaning_deep'],
    'Handyman': ['handyman_general', 'plumbing', 'electrical'],
    'Moving': ['moving_help', 'junk_removal']
};

// --- VIEW NAVIGATION ---
function navigate(view, params = {}) {
    const container = document.getElementById('app-container');
    let html = '';

    if (view === 'dashboard') html = getDashboardHTML();
    else if (view === 'feed') html = getFeedHTML(params.category);
    else if (view === 'profile') html = getProfileHTML(params.id);
    else if (view === 'checkout') html = getCheckoutHTML();
    else if (view === 'confirmation') html = getConfirmationHTML();
    
    container.innerHTML = `<div class="fade-in h-full flex flex-col bg-gray-50">${html}</div>`;

    if (view === 'dashboard') {
        setTimeout(() => {
            initMap();
        }, 50);
    }
}

// --- 1. DASHBOARD VIEW ---
function getDashboardHTML() {
    return `
        <div class="p-6">
            <h1 class="text-2xl font-bold mb-2">What do you need help with?</h1>
            <p class="text-gray-500 mb-6 text-sm">Find trusted locals for any home task.</p>
            
            <div class="relative mb-8 shadow-sm">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-gray-400"></i>
                <input type="text" placeholder="Search for cleaning, moving..." class="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 border focus:ring-2 focus:ring-blue-500 outline-none">
            </div>

            <h2 class="font-semibold mb-4">Categories</h2>
            <div class="grid grid-cols-2 gap-4">
                <div onclick="navigate('feed', {category: 'Cleaning'})" class="bg-blue-50 p-4 rounded-2xl cursor-pointer card-hover border border-blue-100 btn-pop">
                    <div class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mb-3 shadow-md"><i class="fa-solid fa-broom"></i></div>
                    <div class="font-bold text-gray-800">Cleaning</div>
                </div>
                <div onclick="navigate('feed', {category: 'Handyman'})" class="bg-orange-50 p-4 rounded-2xl cursor-pointer card-hover border border-orange-100 btn-pop">
                    <div class="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mb-3 shadow-md"><i class="fa-solid fa-hammer"></i></div>
                    <div class="font-bold text-gray-800">Handyman</div>
                </div>
                <div onclick="navigate('feed', {category: 'Moving'})" class="bg-green-50 p-4 rounded-2xl cursor-pointer card-hover border border-green-100 btn-pop">
                    <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mb-3 shadow-md"><i class="fa-solid fa-box"></i></div>
                    <div class="font-bold text-gray-800">Moving</div>
                </div>
            </div>
            
            <h2 class="font-semibold mt-8 mb-4">Map View (Nearby Pros)</h2>
            <div id="map" class="h-64 rounded-xl shadow-sm z-0 border border-gray-200"></div>
        </div>
    `;
}

// --- 2. FEED VIEW ---
function getFeedHTML(category) {
    const activeListings = DB_LISTINGS.filter(l => l.listing_status === 'active');
    
    let pros;
    if (category === 'All') {
        pros = activeListings;
    } else {
        const codes = categoryMap[category] || [];
        pros = activeListings.filter(l => l.service_type.some(c => codes.includes(c)));
    }
    
    let cardsHTML = pros.map(p => {
        const provider = DB_PROVIDERS.find(prv => prv.provider_id === p.provider_id);
        const serviceLabel = DB_SERVICE_TYPES.find(st => st.code === p.service_type[0])?.label || "Service";
        const distance = p.service_radius_miles + " mi limit";
        const rating = p.rating ? p.rating.toFixed(1) : 'New';
        const priceUnit = p.price_unit === 'hourly' ? '/hr' : ' flat';
        
        return `
        <div onclick="navigate('profile', {id: '${p.listing_id}'})" class="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer card-hover btn-pop">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg">${provider.name}</h3>
                    <p class="text-sm text-gray-500">${p.title}</p>
                </div>
                <div class="text-right">
                    <div class="font-bold text-green-600">$${p.price}<span class="text-xs text-gray-400 font-normal">${priceUnit}</span></div>
                </div>
            </div>
            <div class="flex items-center text-sm text-gray-600 space-x-4">
                <div><i class="fa-solid fa-star text-yellow-400"></i> ${rating} (${p.review_count})</div>
                <div><i class="fa-solid fa-location-dot text-red-400"></i> ${p.provider_location}</div>
            </div>
        </div>
        `;
    }).join('');

    return `
        <div class="glass px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <button onclick="navigate('dashboard')" class="text-gray-500 hover:text-black btn-pop"><i class="fa-solid fa-arrow-left"></i></button>
            <h2 class="font-bold text-lg">${category} Providers</h2>
            <button class="text-blue-600 text-sm font-semibold btn-pop"><i class="fa-solid fa-sliders"></i> Filter</button>
        </div>
        <div class="p-4 flex-1 overflow-y-auto bg-gray-50">
            ${cardsHTML}
        </div>
    `;
}

// --- 3. PROFILE VIEW ---
function getProfileHTML(listingId) {
    const p = DB_LISTINGS.find(l => l.listing_id === listingId);
    const provider = DB_PROVIDERS.find(prv => prv.provider_id === p.provider_id);
    state.activeProvider = { listing: p, provider: provider };

    let availHTML = p.availability.map(date => `
        <div onclick="selectTime('${date}')" class="border rounded-lg p-2 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition time-slot btn-pop" data-date="${date}">
            <div class="text-xs text-gray-500 font-semibold">${new Date(date).toLocaleDateString('en-US', {weekday:'short'})}</div>
            <div class="font-bold text-sm">${new Date(date).getDate()}</div>
            <div class="text-xs text-blue-600 mt-1">${new Date(date).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}</div>
        </div>
    `).join('');

    const rating = p.rating ? p.rating.toFixed(1) : 'New';
    const priceUnit = p.price_unit === 'hourly' ? '/hr' : ' flat';

    // Figure out generic category to go back to
    let backCategory = 'All';
    for (const [cat, codes] of Object.entries(categoryMap)) {
        if (p.service_type.some(c => codes.includes(c))) {
            backCategory = cat;
            break;
        }
    }

    return `
        <div class="relative h-48 bg-gray-200">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" class="w-full h-full object-cover opacity-80">
            <button onclick="navigate('feed', {category: '${backCategory}'})" class="absolute top-4 left-4 glass w-8 h-8 rounded-full flex items-center justify-center shadow btn-pop"><i class="fa-solid fa-arrow-left"></i></button>
        </div>
        <div class="p-6 bg-white -mt-6 rounded-t-3xl relative z-10 flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-1">
                <h1 class="text-2xl font-bold">${provider.name}</h1>
                <div class="font-bold text-xl text-green-600">$${p.price}<span class="text-sm font-normal text-gray-500">${priceUnit}</span></div>
            </div>
            <p class="text-blue-600 font-medium text-sm mb-4">${p.title}</p>
            
            <div class="flex space-x-6 text-sm text-gray-600 mb-6 border-b pb-6">
                <div><i class="fa-solid fa-star text-yellow-400 text-lg mb-1 block"></i> <span class="font-bold">${rating}</span> (${p.review_count})</div>
                <div><i class="fa-solid fa-location-dot text-red-400 text-lg mb-1 block"></i> ${p.provider_location}</div>
                <div><i class="fa-solid fa-shield-check text-green-500 text-lg mb-1 block"></i> Verified</div>
            </div>

            <h3 class="font-bold mb-2">About the Service</h3>
            <p class="text-gray-600 text-sm mb-6 leading-relaxed">${p.listing_description}</p>
            
            <h3 class="font-bold mb-2">Provider Bio</h3>
            <p class="text-gray-600 text-sm mb-6 leading-relaxed">${provider.bio}</p>

            <h3 class="font-bold mb-3">Select Availability</h3>
            <div class="grid grid-cols-3 gap-2 mb-8" id="availability-grid">
                ${availHTML}
            </div>

            <div class="mt-auto pt-4">
                <button onclick="goToCheckout()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition btn-pop">Book Now</button>
            </div>
        </div>
    `;
}

function selectTime(date) {
    document.querySelectorAll('.time-slot').forEach(el => {
        el.classList.remove('border-blue-500', 'bg-blue-50', 'ring-2', 'ring-blue-200');
    });
    const selected = document.querySelector(`.time-slot[data-date="${date}"]`);
    if(selected) {
        selected.classList.add('border-blue-500', 'bg-blue-50', 'ring-2', 'ring-blue-200');
        state.booking.timeSlot = date;
    }
}

function goToCheckout() {
    if (!state.booking.timeSlot) return alert("Please select a time slot first!");
    navigate('checkout');
}

// --- 4 & 5. CHECKOUT VIEW ---
function getCheckoutHTML() {
    const p = state.activeProvider.listing;
    const provider = state.activeProvider.provider;
    
    // Assume minimum 1 unit (1 job or 1 hour). A real app would let them choose hours.
    const commission = parseFloat((p.price * 0.15).toFixed(2));
    state.booking.total = p.price + commission; 
    
    return `
        <div class="glass px-4 py-3 border-b flex items-center sticky top-0 z-10 shadow-sm">
            <button onclick="navigate('profile', {id: '${p.listing_id}'})" class="text-gray-500 hover:text-black mr-4 btn-pop"><i class="fa-solid fa-arrow-left"></i></button>
            <h2 class="font-bold text-lg">Secure Checkout</h2>
        </div>
        <div class="p-6 bg-gray-50 flex-1 overflow-y-auto">
            <!-- Summary Card -->
            <div class="bg-white p-4 rounded-xl shadow-sm border mb-6">
                <div class="flex items-center space-x-4 mb-4 pb-4 border-b">
                    <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl"><i class="fa-solid fa-calendar-check"></i></div>
                    <div>
                        <h3 class="font-bold">${p.title}</h3>
                        <p class="text-sm text-gray-500">${new Date(state.booking.timeSlot).toLocaleString('en-US', {weekday:'long', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</p>
                    </div>
                </div>
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Provider Rate (${p.price_unit})</span>
                    <span class="font-medium">$${p.price.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-sm mb-4">
                    <span class="text-gray-600">Platform Commission (15%)</span>
                    <span class="font-medium">$${commission.toFixed(2)}</span>
                </div>
                <div class="flex justify-between font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>$${state.booking.total.toFixed(2)}</span>
                </div>
            </div>

            <!-- Address Input -->
            <h3 class="font-bold mb-3 text-sm uppercase text-gray-500 tracking-wider">Job Address</h3>
            <div class="bg-white rounded-xl shadow-sm border mb-6 p-1">
                <input type="text" id="job-address" placeholder="123 Main St, Apt 4B" class="w-full px-4 py-3 outline-none rounded-lg" value="123 Main St, Portland, OR">
            </div>

            <!-- Payment -->
            <h3 class="font-bold mb-3 text-sm uppercase text-gray-500 tracking-wider">Payment Method</h3>
            <div class="bg-white rounded-xl shadow-sm border mb-8 p-4 flex items-center justify-between border-blue-500 ring-1 ring-blue-500">
                <div class="flex items-center">
                    <i class="fa-brands fa-cc-visa text-2xl text-blue-800 mr-3"></i>
                    <span class="font-medium">•••• 4242</span>
                </div>
                <i class="fa-solid fa-circle-check text-blue-500 text-lg"></i>
            </div>

            <button onclick="processPayment()" class="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg transition hover:bg-gray-800 flex items-center justify-center btn-pop">
                <i class="fa-solid fa-lock mr-2"></i> Authorize Payment
            </button>
            <p class="text-center text-xs text-gray-500 mt-4"><i class="fa-solid fa-shield-halved text-green-500"></i> Funds held in secure Escrow until job completion.</p>
        </div>
    `;
}

function processPayment() {
    // Simulate transaction delay
    const btn = document.querySelector('button[onclick="processPayment()"]');
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing Escrow...';
    btn.classList.add('opacity-75');
    
    setTimeout(() => {
        navigate('confirmation');
    }, 1500);
}

// --- 6. CONFIRMATION VIEW ---
function getConfirmationHTML() {
    const providerName = state.activeProvider?.provider?.name || 'Your Provider';
    return `
        <div class="flex-1 bg-green-50 flex flex-col items-center justify-center p-6 text-center">
            <div class="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg animate-bounce">
                <i class="fa-solid fa-check"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
            <p class="text-gray-600 mb-8 max-w-xs">Your payment has been securely authorized. ${providerName} has been notified.</p>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-green-100 w-full mb-8 text-left">
                <div class="text-sm text-gray-500 mb-1">Booking ID</div>
                <div class="font-mono font-bold text-gray-800 mb-4">BK-${Math.floor(Math.random()*100000)}</div>
                
                <div class="text-sm text-gray-500 mb-1">When</div>
                <div class="font-bold text-gray-800">${new Date(state.booking.timeSlot).toLocaleString('en-US', {weekday:'long', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</div>
            </div>

            <button onclick="navigate('dashboard')" class="w-full border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-xl shadow-sm transition btn-pop">Back to Home</button>
        </div>
    `;
}

// --- CHATBOT LOGIC (GEMINI SIMULATION) ---
function toggleChatbot() {
    const modal = document.getElementById('chatbot-modal');
    modal.classList.toggle('hidden');
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    const history = document.getElementById('chat-history');
    
    // Append User Message
    history.innerHTML += `
        <div class="bg-blue-600 text-white p-3 rounded-lg rounded-tr-none self-end max-w-[80%] shadow-sm">
            <p class="text-sm">${msg}</p>
        </div>
    `;
    input.value = '';

    // Scroll bottom
    history.scrollTop = history.scrollHeight;

    // Simulate Gemini API processing & Data Grounding
    setTimeout(() => {
        const lowerMsg = msg.toLowerCase();
        let match = null;
        
        const activeListings = DB_LISTINGS.filter(l => l.listing_status === 'active');

        // 1. Dynamic Search Grounding: Try to find a listing where the title or description matches keywords in the user's message
        const keywords = lowerMsg.split(/\s+/).filter(w => w.length > 2); // filter out short words
        match = activeListings.find(l => {
            const titleLower = l.title.toLowerCase();
            const descLower = l.listing_description.toLowerCase();
            return keywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword));
        });

        // 2. Fallback Rule-based Matching: Categorical fallback if no direct text match was found
        if (!match) {
            if (lowerMsg.includes('clean') || lowerMsg.includes('maid') || lowerMsg.includes('wash')) {
                match = activeListings.find(l => l.service_type.some(c => categoryMap['Cleaning'].includes(c)));
            } else if (lowerMsg.includes('plumb') || lowerMsg.includes('sink') || lowerMsg.includes('fix') || lowerMsg.includes('handyman') || lowerMsg.includes('assemble') || lowerMsg.includes('furniture') || lowerMsg.includes('cabinet')) {
                match = activeListings.find(l => l.service_type.some(c => categoryMap['Handyman'].includes(c)));
            } else if (lowerMsg.includes('move') || lowerMsg.includes('box') || lowerMsg.includes('haul')) {
                match = activeListings.find(l => l.service_type.some(c => categoryMap['Moving'].includes(c)));
            }
        }

        if (match) {
            const provider = DB_PROVIDERS.find(prv => prv.provider_id === match.provider_id);
            history.innerHTML += `
                <div class="bg-white border p-3 rounded-lg rounded-tl-none self-start max-w-[90%] shadow-sm">
                    <p class="text-sm mb-2">Based on our database, here is the best match for your request:</p>
                    <div class="border rounded-md p-2 bg-gray-50">
                        <div class="font-bold text-sm">${provider.name}</div>
                        <div class="text-xs text-gray-500 mb-2">${match.title} • $${match.price}/${match.price_unit === 'hourly' ? 'hr' : 'flat'}</div>
                        <button onclick="toggleChatbot(); navigate('profile', {id: '${match.listing_id}'})" class="text-xs bg-blue-100 text-blue-700 font-bold py-1 px-3 rounded w-full hover:bg-blue-200">View Profile</button>
                    </div>
                </div>
            `;
        } else {
            // Data Grounding failure state
            history.innerHTML += `
                <div class="bg-white border p-3 rounded-lg rounded-tl-none self-start max-w-[80%] shadow-sm">
                    <p class="text-sm">I'm sorry, I cannot fulfill that request. We currently do not have any providers in our database offering that specific service.</p>
                </div>
            `;
        }
        history.scrollTop = history.scrollHeight;
    }, 1000);
}

// Allow Enter key in chat
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendChatMessage();
    });
    // Init app
    try {
        await initData();
        navigate('dashboard');
    } catch (err) {
        document.getElementById('app-container').innerHTML = `<div class="p-8 text-red-500 font-bold">Failed to load data from remote branch: ${err.message}</div>`;
    }
});

// --- MAP RENDERING (LEAFLET) ---
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Center map over Portland (epicenter of mock data coordinates)
    const map = L.map('map').setView([45.5152, -122.6784], 11);

    // Add standard OpenStreetMap layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Plot pins for all active listings
    const activeListings = DB_LISTINGS.filter(l => l.listing_status === 'active');

    activeListings.forEach(listing => {
        const provider = DB_PROVIDERS.find(prv => prv.provider_id === listing.provider_id);
        if (!provider || !provider.latitude || !provider.longitude) return;

        const rating = listing.rating ? listing.rating.toFixed(1) : 'New';
        const priceUnit = listing.price_unit === 'hourly' ? '/hr' : ' flat';

        const popupHTML = `
            <div class="p-1 font-sans text-xs" style="min-width: 140px;">
                <h4 class="font-bold text-gray-800 text-sm">${provider.name}</h4>
                <p class="text-blue-600 font-medium mb-1">${listing.title}</p>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-yellow-500 font-semibold"><i class="fa-solid fa-star"></i> ${rating}</span>
                    <span class="text-green-600 font-bold">$${listing.price}${priceUnit}</span>
                </div>
                <button onclick="navigate('profile', {id: '${listing.listing_id}'})" class="w-full text-center bg-blue-600 text-white font-bold py-1 px-2 rounded hover:bg-blue-700 transition">
                    View Profile
                </button>
            </div>
        `;

        L.marker([provider.latitude, provider.longitude])
            .addTo(map)
            .bindPopup(popupHTML);
    });
}
