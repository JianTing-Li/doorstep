// Doorstep Product A - Provider Workspace Controller
let currentProviderId = 'prv_001';

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.initData === 'function') {
        await window.initData();
    }
    initProviderSelector();
    renderProviderDashboard();
});

function toggleProductsMenu() {
    const dropdown = document.getElementById('products-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

window.addEventListener('click', (e) => {
    const btn = document.getElementById('products-menu-btn');
    const dropdown = document.getElementById('products-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden') && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

function initProviderSelector() {
    const selector = document.getElementById('provider-selector');
    if (!selector) return;
    const providers = typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : [];
    selector.innerHTML = providers.map(p => 
        '<option value="' + p.provider_id + '" ' + (p.provider_id === currentProviderId ? 'selected' : '') + '>' + p.name + ' (' + p.location + ')</option>'
    ).join('');
}

function switchProvider(prvId) {
    currentProviderId = prvId;
    renderProviderDashboard();
}

function renderProviderDashboard() {
    const container = document.getElementById('workspace-content');
    if (!container) return;

    const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === currentProviderId) || { name: 'Dan Okonkwo', location: 'Alberta Arts', rating: 4.9 };
    const listings = (typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : []).filter(l => l.provider_id === currentProviderId);
    const bookings = (typeof DB_BOOKINGS !== 'undefined' ? DB_BOOKINGS : []).filter(b => b.provider_id === currentProviderId);

    const pending = bookings.filter(b => b.status === 'pending');
    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const completed = bookings.filter(b => b.status === 'completed');
    const cancelled = bookings.filter(b => b.status === 'cancelled');

    container.innerHTML = '<div class='bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden' + 
        '><div class='relative z-10 space-y-3'>' + 
        '<div class='flex items-center space-x-2'>' + 
        '<span class='text-xs font-extrabold uppercase tracking-wider text-purple-300 bg-purple-800/60 px-3 py-1 rounded-full border border-purple-400/20'>Verified Provider</span>' + 
        '<span class='text-xs text-slate-300'>и ' + provider.location + ', Portland</span></div>' + 
        '<h1 class='text-2xl sm:text-3xl font-extrabold text-white'>Welcome back, ' + provider.name + '!</h1>' + 
        '<p>Manage incoming client bookings, publish new service offerings, and track your business metrics</p></div></div>' + 
        '<div class='grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-6' + 
        '<div class='bg-white p-4 rounded-2xl border border-slate-200'><div class='text-[11px] font-bold text-amber-600'>PENDING</div><div class='text-2xl font-extrabold'>' + pending.length + '</div></div>' + 
        '<div class='bg-white p-4 rounded-2xl border border-slate-200'><div class='text-[11px] font-bold text-blue-600'>CONFIRMED</div><div class='text-2xl font-extrabold'>' + confirmed.length + '</div></div>' + 
        '<div class='bg-white p-4 rounded-2xl border border-slate-200'><div class='text-[11px] font-bold text-emerald-600'>COMPLETED</div><div class='text-2xl font-extrabold'>' + completed.length + '</div></div>' + 
        '<div class='bg-white p-4 rounded-2xl border border-slate-200'><div class='text-[11px] font-bold text-rose-600'>CANCELLED</div><div class='text-2xl font-extrabold'>' + cancelled.length + '</div></div>' + 
        '<div class='bg-white p-4 rounded-2xl border border-slate-200'><div class='text-[11px] font-bold text-purple-600'>LISTINGS</div><div class='text-2xl font-extrabold'>' + listings.length + '</div></div></div>' + 
        '<div class='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>' + 
        '<div class='bg-white p-6 rounded-3xl border border-slate-200'>' + 
        '<h2 class='font-extrabold text-lg'>Create Service Listing</h2>' + 
        '<form onsubmit='handleCreateListing(event)' class='space-y-3.5 mt-4'>' + 
        '<div><label class='block text-xs font-bold mb-1'>Title</label><input id='new-title' required class='w-full p-3 rounded-xl border border-slate-200 text-xs' placeholder='e.g. Deep Cleaning Special'></div>' + 
        '<div class='grid grid-cols-2 gap-3'><div><label class='block text-xs font-bold mb-1'>Price ($)</label><input id='new-price' type='number' required class='w-full p-3 rounded-xl border border-slate-200 text-xs' placeholder='50'></div>' + 
        '<div><label class='block text-xs font-bold mb-1'>Unit</label><select id='new-unit' class='w-full p-3 rounded-xl border border-slate-200 text-xs'><option value='hourly'>Hourly (/hr)</option><option value='flat'>Flat Rate</option></select></div></div>' + 
        '<div><label class='block text-xs font-bold mb-1'>Description</label><textarea id='new-desc' rows='1' required class='w-full p-3 rounded-xl border border-slate-200 text-xs' placeholder='Describe your service.'></textarea></div>' + 
        '<button type='submit' class='w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl dext-xs'>Publish Listing</button></form></div>' + 
        '<div class='bg-white p-6 rounded-2xl border border-slate-200'><h2 class='font-extrabold text-lg'>My Listings (' + listings.length + ')</h2>' + 
        '<div class='space-y-3 mt-4 max-h-[350px] overflow-y-auto'>' + 
        listings.map(l => '<div class='p-3 rounded-xl bg-slate-50 flex justify-between'><div><div class='font-bold'>' + l.title + '</div><div class='text-xs text-slate-500'>' + l.listing_description + '</div></div><div class='font-extrabold'>$' + l.price + '</div></div>').join('') + '</div></div></div>' + 
        '<div class='bg-white p-6 rounded-3xl border border-slate-200 mt-8'><h2 class='font-extrabold text-lg'>Incoming Bookings</h2>' + 
        '<div class='space-y-3 mt-4'>' + 
        (bookings.length === 0 ? '<div class='text-slate-400 text-xs'>No bookings found.</div>' : bookings.map(b => '<div class='p-4 rounded-2xl border border-slate-200 flex justify-between items-center'><div><div class='font-extrabold'>Booking #' + b.booking_id + ' (' + b.status + ')</div><div class='text-xs text-slate-500'>Customer: ' + (b.customer_name || b.customer_id) + '</div></div><div>' + (b.status === 'pending' ? '<button onclick="updateBooking(\'' + b.booking_id + '\', \'confirmed\')" class='bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs'>Confirm</button>' : '') + (b.status === 'confirmed' ? '<button onclick="updateBooking(\'' + b.booking_id + '\', \'completed\')" class='bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs'>Complete</button>' : '') + '</div></div>').join('')) + '</div></div>';
l}

function handleCreateListing(e) {
    e.preventDefault();
    const title = document.getElementById('new-title').value.trim();
    const price = Number(document.getElementById('new-price').value);
    const price_unit = document.getElementById('new-unit').value;
    const desc = document.getElementById('new-desc').value.trim();

    const newListing = {
        listing_id: 'lst_' + Date.now().toString().slice(-4),
        provider_id: currentProviderId,
        title,
        price,
        price_unit,
        service_type: ['handyman_general'],
        listing_description: desc,
        provider_location: 'Portland, OR',
        listing_status: 'active',
        rating: 5.0,
        review_count: 0
    };

    if (typeof DB_LISTINGS !== 'undefined') {
        DB_LISTINGS.unshift(newListing);
    }

    alert('Service Listing Published! Its live in Customer Search and Feed.');
    renderProviderDashboard();
}

function updateBooking(bookingId, newStatus) {
    if (typeof DB_BOOKINGS !== 'undefined') {
        const b = DB_BOOKINGS.find(item => item.booking_id === bookingId);
        if (b) b.status = newStatus;
    }
    renderProviderDashboard();
}
