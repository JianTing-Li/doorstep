// Local Python API Integration (Proxy to SerpApi)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Simulate GPS Loading & Fetch Data
    fetchGoogleEvents();

    // 2. Setup Modal Close Listeners
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('event-modal').addEventListener('click', (e) => {
        if (e.target.id === 'event-modal') closeModal();
    });
});

async function fetchGoogleEvents() {
    const overlay = document.getElementById('gps-loading');
    
    try {
        // Ping our local Python server which securely handles the API key
        const response = await fetch('/api/events');
        
        if (!response.ok) {
            console.error("Backend error. Did you add your SerpApi key to server.py?");
            renderNotes([]);
            hideLoading(overlay);
            return;
        }

        const data = await response.json();
        // SerpApi puts events in the 'events_results' array
        renderNotes(data.events_results || []);
    } catch (error) {
        console.error("Error fetching events:", error);
        renderNotes([]);
    } finally {
        hideLoading(overlay);
    }
}

function hideLoading(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.classList.add('hidden'), 300);
}

// Random pastel colors for the post-its
const PASTEL_COLORS = ["#ffcbf2", "#fcf6bd", "#d0f4de", "#a9def9", "#e4c1f9"];
const PIN_COLORS = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502"];
const ICONS = ["🎵", "🎫", "🎭", "🎪", "🎤", "🌻", "💻"];

function renderNotes(events) {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = `<div style="color: white; font-size: 2rem; font-family: 'Caveat', cursive;">No events found (or API key is missing).</div>`;
        return;
    }

    events.forEach((event, index) => {
        // Random styling
        const rotation = Math.random() * 8 - 4;
        const color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
        const pinColor = PIN_COLORS[Math.floor(Math.random() * PIN_COLORS.length)];
        const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
        
        // Format Date (SerpApi provides structured date blocks)
        const dateString = event.date?.start_date || event.date?.when || 'TBD';
        
        // Venue extraction
        const venueName = event.venue?.name || 'Local Venue';

        // Unique ID fallback
        const eventId = event.event_id || `evt_${index}`;

        // Store full event data globally for the modal
        window[`event_${eventId}`] = {
            title: event.title,
            date: dateString,
            desc: event.description || venueName,
            source: 'Google Events',
            link: event.link,
            color, pinColor, icon
        };

        const noteHTML = `
            <div class="post-it" 
                 style="background-color: ${color}; transform: rotate(${rotation}deg);"
                 onclick="openModal('${eventId}')">
                <div class="pin" style="background-color: ${pinColor};"></div>
                <div class="note-icon">${icon}</div>
                <div class="note-title" style="font-size: 1.1rem; line-height: 1.1;">${event.title}</div>
                <div class="note-date" style="font-size: 1rem; margin-top: 5px;">${dateString}</div>
                <div class="note-source">${venueName}</div>
            </div>
        `;
        container.innerHTML += noteHTML;
    });
}

function openModal(eventId) {
    const event = window[`event_${eventId}`];
    if (!event) return;

    // Populate modal content
    const modalContent = document.getElementById('modal-note-content');
    modalContent.innerHTML = `
        <div class="post-it" style="background-color: ${event.color};">
            <div class="pin" style="background-color: ${event.pinColor};"></div>
            <div class="note-icon">${event.icon}</div>
            <div class="note-title">${event.title}</div>
            <div class="note-date">${event.date}</div>
            <span class="note-desc">${event.desc}</span>
            <div class="note-source">${event.source}</div>
        </div>
    `;

    document.getElementById('modal-link').href = event.link;

    // Show modal
    const modal = document.getElementById('event-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('event-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
