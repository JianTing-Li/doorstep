// Global State
let state = {
    activeProvider: null,
    booking: {
        timeSlot: null,
        address: null,
        total: 0
    }
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
            <div class="h-40 rounded-xl map-bg shadow-inner border relative cursor-pointer" onclick="navigate('feed', {category: 'All'})">
                <!-- Map Pins -->
                <div class="absolute top-10 left-1/4 text-red-500 text-2xl drop-shadow-md"><i class="fa-solid fa-location-dot"></i></div>
                <div class="absolute top-20 right-1/3 text-red-500 text-2xl drop-shadow-md"><i class="fa-solid fa-location-dot"></i></div>
                <div class="absolute bottom-10 right-1/4 text-blue-600 text-3xl drop-shadow-md z-10"><i class="fa-solid fa-street-view"></i></div>
            </div>
        </div>
    `;
}

// --- 2. FEED VIEW ---
function getFeedHTML(category) {
    const pros = category === 'All' ? DB_LISTINGS : DB_LISTINGS.filter(p => p.service_type === category);
    
    let cardsHTML = pros.map(p => `
        <div onclick="navigate('profile', {id: '${p.listing_id}'})" class="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer card-hover btn-pop">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg">${p.provider_name}</h3>
                    <p class="text-sm text-gray-500">${p.service_title}</p>
                </div>
                <div class="text-right">
                    <div class="font-bold text-green-600">$${p.price}<span class="text-xs text-gray-400 font-normal">/hr</span></div>
                </div>
            </div>
            <div class="flex items-center text-sm text-gray-600 space-x-4">
                <div><i class="fa-solid fa-star text-yellow-400"></i> ${p.rating} (${p.reviews})</div>
                <div><i class="fa-solid fa-location-dot text-red-400"></i> ${p.provider_location.distance}</div>
            </div>
        </div>
    `).join('');

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
    state.activeProvider = p;

    let availHTML = p.calendar_availability.map(date => `
        <div onclick="selectTime('${date}')" class="border rounded-lg p-2 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition time-slot btn-pop" data-date="${date}">
            <div class="text-xs text-gray-500 font-semibold">${new Date(date).toLocaleDateString('en-US', {weekday:'short'})}</div>
            <div class="font-bold text-sm">${new Date(date).getDate()}</div>
        </div>
    `).join('');

    return `
        <div class="relative h-48 bg-gray-200">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" class="w-full h-full object-cover opacity-80">
            <button onclick="navigate('feed', {category: '${p.service_type}'})" class="absolute top-4 left-4 glass w-8 h-8 rounded-full flex items-center justify-center shadow btn-pop"><i class="fa-solid fa-arrow-left"></i></button>
        </div>
        <div class="p-6 bg-white -mt-6 rounded-t-3xl relative z-10 flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-1">
                <h1 class="text-2xl font-bold">${p.provider_name}</h1>
                <div class="font-bold text-xl text-green-600">$${p.price}</div>
            </div>
            <p class="text-blue-600 font-medium text-sm mb-4">${p.service_title}</p>
            
            <div class="flex space-x-6 text-sm text-gray-600 mb-6 border-b pb-6">
                <div><i class="fa-solid fa-star text-yellow-400 text-lg mb-1 block"></i> <span class="font-bold">${p.rating}</span> (${p.reviews})</div>
                <div><i class="fa-solid fa-location-dot text-red-400 text-lg mb-1 block"></i> ${p.provider_location.distance}</div>
                <div><i class="fa-solid fa-shield-check text-green-500 text-lg mb-1 block"></i> Verified</div>
            </div>

            <h3 class="font-bold mb-2">About the Service</h3>
            <p class="text-gray-600 text-sm mb-6 leading-relaxed">${p.description}</p>

            <h3 class="font-bold mb-3">Select Availability</h3>
            <div class="grid grid-cols-4 gap-2 mb-8" id="availability-grid">
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
    const p = state.activeProvider;
    state.booking.total = p.price + 15; // + commission
    
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
                        <h3 class="font-bold">${p.service_title}</h3>
                        <p class="text-sm text-gray-500">${new Date(state.booking.timeSlot).toLocaleDateString('en-US', {weekday:'long', month:'short', day:'numeric'})}</p>
                    </div>
                </div>
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Provider Rate</span>
                    <span class="font-medium">$${p.price}.00</span>
                </div>
                <div class="flex justify-between text-sm mb-4">
                    <span class="text-gray-600">Platform Commission</span>
                    <span class="font-medium">$15.00</span>
                </div>
                <div class="flex justify-between font-bold text-lg border-t pt-4">
                    <span>Total</span>
                    <span>$${state.booking.total}.00</span>
                </div>
            </div>

            <!-- Address Input -->
            <h3 class="font-bold mb-3 text-sm uppercase text-gray-500 tracking-wider">Job Address</h3>
            <div class="bg-white rounded-xl shadow-sm border mb-6 p-1">
                <input type="text" id="job-address" placeholder="123 Main St, Apt 4B" class="w-full px-4 py-3 outline-none rounded-lg" value="123 Main St, New York, NY">
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
    return `
        <div class="flex-1 bg-green-50 flex flex-col items-center justify-center p-6 text-center">
            <div class="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg animate-bounce">
                <i class="fa-solid fa-check"></i>
            </div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
            <p class="text-gray-600 mb-8 max-w-xs">Your payment has been securely authorized. ${state.activeProvider.provider_name} has been notified.</p>
            
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-green-100 w-full mb-8 text-left">
                <div class="text-sm text-gray-500 mb-1">Booking ID</div>
                <div class="font-mono font-bold text-gray-800 mb-4">BK-${Math.floor(Math.random()*100000)}</div>
                
                <div class="text-sm text-gray-500 mb-1">When</div>
                <div class="font-bold text-gray-800">${new Date(state.booking.timeSlot).toLocaleDateString('en-US', {weekday:'long', month:'short', day:'numeric'})}</div>
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

        // Grounding Rule: Only match actual JSON dummy data and ensure they are active
        if (lowerMsg.includes('clean') || lowerMsg.includes('maid')) {
            match = DB_LISTINGS.find(l => l.service_type === 'Cleaning' && l.listing_status === 'active');
        } else if (lowerMsg.includes('plumb') || lowerMsg.includes('sink') || lowerMsg.includes('fix')) {
            match = DB_LISTINGS.find(l => l.service_type === 'Handyman' && l.listing_status === 'active');
        } else if (lowerMsg.includes('move') || lowerMsg.includes('box')) {
            match = DB_LISTINGS.find(l => l.service_type === 'Moving' && l.listing_status === 'active');
        }

        if (match) {
            history.innerHTML += `
                <div class="bg-white border p-3 rounded-lg rounded-tl-none self-start max-w-[90%] shadow-sm">
                    <p class="text-sm mb-2">Based on our database, here is the best match for your request:</p>
                    <div class="border rounded-md p-2 bg-gray-50">
                        <div class="font-bold text-sm">${match.provider_name}</div>
                        <div class="text-xs text-gray-500 mb-2">${match.service_title} • $${match.price}/hr</div>
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
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendChatMessage();
    });
    // Init app
    navigate('dashboard');
});
