// Doorstep Product C - Dedicated AI Matcher & Concierge Controller
let state = {
    theme: localStorage.getItem('doorstep_chat_theme') || 'dark',
    messages: [],
    filters: { service_types: [], max_price: null, neighborhood: null, urgency: null },
    openKey: null,
    bookingKey: null,
    bookings: {},
    isTyping: false
};

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.initData === 'function') {
        await window.initData();
    }
    applyTheme(state.theme);
    renderMessages();
    renderFilterChips();

    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('input', () => {
            const btn = document.getElementById('send-btn');
            if (btn) btn.disabled = !input.value.trim();
        });
        input.focus();
    }
});

function toggleSuiteMenu() {
    const dropdown = document.getElementById('suite-dropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
}

window.addEventListener('click', (e) => {
    const btn = document.getElementById('suite-btn');
    const dropdown = document.getElementById('suite-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden') && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('doorstep_chat_theme', state.theme);
    applyTheme(state.theme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        const glyph = document.getElementById('theme-glyph');
        if (glyph) glyph.textContent = '??';
    } else {
        document.documentElement.removeAttribute('data-theme');
        const glyph = document.getElementById('theme-glyph');
        if (glyph) glyph.textContent = '??';
    }
}

function handleClearChat() {
    state.messages = [];
    state.filters = { service_types: [], max_price: null, neighborhood: null, urgency: null };
    state.openKey = null;
    state.bookingKey = null;
    state.bookings = {};
    state.isTyping = false;
    renderMessages();
    renderFilterChips();
}

function handleExampleChip(text) {
    const input = document.getElementById('chat-input');
    if (input) input.value = text;
    processUserInput(text);
}

function handleFormSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    const btn = document.getElementById('send-btn');
    if (btn) btn.disabled = true;
    processUserInput(text);
}

function processUserInput(text) {
    state.messages.push({
        id: 'msg_' + Date.now(),
        from: 'user',
        type: 'text',
        text: text
    });

    state.isTyping = true;
    renderMessages();

    setTimeout(() => {
        state.isTyping = false;
        const localIntent = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.detectLocalIntent(text) : null;

        if (localIntent === 'greeting') {
            state.messages.push({
                id: 'msg_' + Date.now(),
                from: 'bot',
                type: 'text',
                text: "Hello! Tell me what needs doing around the house and I'll find the right local pros."
            });
            renderMessages();
            return;
        }

        if (localIntent === 'help') {
            state.messages.push({
                id: 'msg_' + Date.now(),
                from: 'bot',
                type: 'text',
                text: "Tell me what needs fixing, cleaning, or moving around the house. I will extract required service trades, verify neighborhood coverage, check budget limits, and find open booking slots."
            });
            renderMessages();
            return;
        }

        if (localIntent === 'cancel_booking') {
            const bookedKeys = Object.keys(state.bookings);
            if (bookedKeys.length === 0) {
                state.messages.push({
                    id: 'msg_' + Date.now(),
                    from: 'bot',
                    type: 'text',
                    text: "There is nothing booked to cancel yet."
                });
            } else {
                const targetKey = bookedKeys[0];
                const bkg = state.bookings[targetKey];
                delete state.bookings[targetKey];
                state.messages.push({
                    id: 'msg_' + Date.now(),
                    from: 'bot',
                    type: 'text',
                    text: `Cancelled booking for ${bkg.listing.title}. Let me know if you'd like to find someone else.`
                });
            }
            renderMessages();
            return;
        }

        if (localIntent === 'compare') {
            const lastResults = [...state.messages].reverse().find(m => m.type === 'results');
            const candidates = lastResults ? lastResults.results : (typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.getActiveListings() : []);
            const answer = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.compareListings(candidates, text) : 'Here are the listings on screen.';
            state.messages.push({
                id: 'msg_' + Date.now(),
                from: 'bot',
                type: 'text',
                text: answer
            });
            renderMessages();
            return;
        }

        if (localIntent === 'more_details') {
            const lastResults = [...state.messages].reverse().find(m => m.type === 'results');
            const listing = lastResults && lastResults.results.length > 0 ? lastResults.results[0] : null;
            if (listing && typeof ChatbotEngine !== 'undefined') {
                state.messages.push({
                    id: 'msg_' + Date.now(),
                    from: 'bot',
                    type: 'text',
                    text: ChatbotEngine.detailsAnswer(listing, text)
                });
            } else {
                state.messages.push({
                    id: 'msg_' + Date.now(),
                    from: 'bot',
                    type: 'text',
                    text: "Tell me what job you're looking for first, and I'll give you full details."
                });
            }
            renderMessages();
            return;
        }

        if (localIntent === 'list_bookings') {
            const bookedList = Object.values(state.bookings);
            if (bookedList.length === 0) {
                state.messages.push({
                    id: 'msg_' + Date.now(),
                    from: 'bot',
                    type: 'text',
                    text: "You haven't booked anything yet this session."
                });
            } else {
                const summary = bookedList.map(b => `? ${b.listing.title} (${b.listing.provider?.name || 'Pro'}) on ${typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.formatSlot(b.slot) : b.slot}`).join('
');
                state.messages.push({
                    id: 'msg_' + Date.now(),
                    from: 'bot',
                    type: 'text',
                    text: `You have ${bookedList.length} booking${bookedList.length === 1 ? '' : 's'}:
${summary}`
                });
            }
            renderMessages();
            return;
        }

        if (localIntent === 'unsupported_service') {
            state.messages.push({
                id: 'msg_' + Date.now(),
                from: 'bot',
                type: 'text',
                text: "Doorstep focuses on home cleaning, handyman tasks, plumbing, electrical, moving help, junk removal, and yard maintenance in Portland. We don't currently support roofing, painting, or pest control."
            });
            renderMessages();
            return;
        }

        // Parse Job
        const parsed = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.parseJob(text) : { service_types: [], max_price: null, neighborhood: null, urgency: null };
        const merged = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.mergeFilters(state.filters, parsed) : parsed;
        state.filters = merged;

        renderFilterChips();

        // Request Summary Message
        state.messages.push({
            id: 'msg_summary_' + Date.now(),
            from: 'bot',
            type: 'request_summary',
            request: Object.assign({}, merged, { rawQuery: text })
        });

        // Match Listings
        const activeListings = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.getActiveListings() : [];
        const ranked = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.matchListings(merged, activeListings, { query: text }) : [];
        const enriched = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.enrichResults(ranked, merged, text) : ranked;

        if (enriched.length === 0) {
            state.messages.push({
                id: 'msg_res_' + Date.now(),
                from: 'bot',
                type: 'text',
                text: merged.neighborhood
                    ? `No providers currently serve ${merged.neighborhood} under those constraints. Try adjusting your filters.`
                    : "No exact matches found. Try broadening your budget or describing the job with a few more details."
            });
        } else {
            state.messages.push({
                id: 'msg_res_' + Date.now(),
                from: 'bot',
                type: 'results',
                text: `Found ${ranked.length} match${ranked.length === 1 ? '' : 'es'} for that.`,
                results: enriched
            });
        }

        renderMessages();
    }, 450);
}

function handleChooseSlot(listingId, slot) {
    const activeListings = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.getActiveListings() : [];
    const listing = activeListings.find(l => l.listing_id === listingId) || { listing_id: listingId, title: 'Service', price: 50 };
    const provider = (typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : []).find(p => p.provider_id === listing.provider_id) || { name: 'Doorstep Provider' };
    
    const key = 'bkg_' + listingId;
    const newBooking = {
        booking_id: 'BK-' + Math.floor(10000 + Math.random() * 90000),
        listing: Object.assign({}, listing, { provider: provider }),
        slot: slot,
        timestamp: new Date().toISOString()
    };

    state.bookings[key] = newBooking;
    state.bookingKey = null;

    if (typeof DB_BOOKINGS !== 'undefined') {
        DB_BOOKINGS.unshift({
            booking_id: newBooking.booking_id,
            listing_id: listing.listing_id,
            provider_id: listing.provider_id,
            customer_id: 'cust_00001',
            scheduled_slot: slot,
            status: 'confirmed',
            escrow_status: 'held'
        });
    }

    renderMessages();
}

function handleCancelBooking(key) {
    delete state.bookings[key];
    state.messages.push({
        id: 'msg_' + Date.now(),
        from: 'bot',
        type: 'text',
        text: "Cancelled request. Let me know if you'd like to find someone else."
    });
    renderMessages();
}

function toggleCard(key) {
    state.openKey = (state.openKey === key) ? null : key;
    renderMessages();
}

function toggleBookingSlots(key) {
    state.bookingKey = (state.bookingKey === key) ? null : key;
    renderMessages();
}

function removeFilter(key, code) {
    if (key === 'service_types') {
        state.filters.service_types = (state.filters.service_types || []).filter(c => c !== code);
    } else {
        state.filters[key] = null;
    }
    renderFilterChips();

    const activeListings = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.getActiveListings() : [];
    const ranked = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.matchListings(state.filters, activeListings, { query: '' }) : [];
    const enriched = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.enrichResults(ranked, state.filters, '') : ranked;

    state.messages.push({
        id: 'msg_' + Date.now(),
        from: 'bot',
        type: 'results',
        text: `Updated filters. Found ${ranked.length} match${ranked.length === 1 ? '' : 'es'}:`,
        results: enriched
    });
    renderMessages();
}

function renderFilterChips() {
    const container = document.getElementById('filter-chips');
    if (!container) return;

    const chips = [];
    (state.filters.service_types || []).forEach(code => {
        chips.push({ key: 'service_types', code: code, label: code.replace('_', ' ') });
    });
    if (state.filters.max_price != null) {
        chips.push({ key: 'max_price', code: null, label: `Under $${state.filters.max_price}` });
    }
    if (state.filters.neighborhood) {
        chips.push({ key: 'neighborhood', code: null, label: state.filters.neighborhood });
    }
    if (state.filters.urgency) {
        chips.push({ key: 'urgency', code: null, label: state.filters.urgency.replace('_', ' ') });
    }

    if (chips.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = chips.map(c => 
        '<span class="filter-chip">' +
        '<span>' + c.label + '</span>' +
        '<button type="button" class="filter-chip-remove" onclick="removeFilter('' + c.key + '', '' + (c.code || '') + '')" aria-label="Remove filter">' +
        '<span class="filter-chip-remove-glyph">?</span>' +
        '</button>' +
        '</span>'
    ).join('');
}

function renderMessages() {
    const container = document.getElementById('messages-container');
    const emptyState = document.getElementById('empty-state');
    if (!container) return;

    if (state.messages.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        container.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    let html = '';

    state.messages.forEach(msg => {
        if (msg.from === 'user') {
            html += 
                '<div class="message user-message message-enter">' +
                '<div class="message-bubble">' +
                '<p class="message-text">' + msg.text + '</p>' +
                '</div>' +
                '</div>';
        } else if (msg.from === 'bot') {
            if (msg.type === 'text') {
                html += 
                    '<div class="message bot-message message-enter">' +
                    '<div class="message-bubble">' +
                    '<p class="message-text">' + msg.text + '</p>' +
                    '</div>' +
                    '</div>';
            } else if (msg.type === 'request_summary') {
                const req = msg.request || {};
                const badges = (req.service_types || []).map(c => '<span style="background: var(--glass-fill-strong); padding: 2px 8px; border-radius: var(--radius-full); border: 1px solid var(--hairline);">' + c.replace('_', ' ') + '</span>').join('') +
                    (req.neighborhood ? '<span style="background: var(--glass-fill-strong); padding: 2px 8px; border-radius: var(--radius-full); border: 1px solid var(--hairline);">?? ' + req.neighborhood + '</span>' : '') +
                    (req.max_price ? '<span style="background: var(--glass-fill-strong); padding: 2px 8px; border-radius: var(--radius-full); border: 1px solid var(--hairline);">?? Under $' + req.max_price + '</span>' : '');

                html += 
                    '<div class="request-summary message-enter">' +
                    '<div class="request-summary-label">Interpreted request</div>' +
                    '<h4 class="request-summary-title">?' + (req.rawQuery || 'Job') + '?</h4>' +
                    '<div class="request-summary-meta" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; font-size: 0.8rem; color: var(--color-ink-soft);">' +
                    badges +
                    '</div>' +
                    '</div>';
            } else if (msg.type === 'results') {
                html += 
                    '<div class="message bot-message message-enter">' +
                    '<div class="message-bubble"><p class="message-text">' + msg.text + '</p></div>' +
                    '</div>' +
                    '<div class="results-grid" style="display: grid; gap: 12px; margin-top: 8px;">' +
                    (msg.results || []).map(listing => {
                        const key = 'bkg_' + listing.listing_id;
                        const isBooked = !!state.bookings[key];
                        const isOpen = state.openKey === key;
                        const isPickingSlots = state.bookingKey === key;
                        const provider = listing.provider || {};
                        const priceText = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.priceLabel(listing) : ('$' + listing.price);
                        const slots = (listing.availability || []).slice(0, 6);

                        if (isBooked) {
                            const bkg = state.bookings[key];
                            return '<article class="listing-card is-booked">' +
                                '<p class="booked-marker">? Booked request</p>' +
                                '<h4 class="booked-title">' + listing.title + '</h4>' +
                                '<div class="booked-provider">' + (provider.name || 'Doorstep Provider') + '</div>' +
                                '<div class="booked-line">??? ' + (typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.formatSlot(bkg.slot) : bkg.slot) + '</div>' +
                                '<div class="booked-actions">' +
                                '<button type="button" class="booked-action" onclick="handleCancelBooking('' + key + '')">Cancel request</button>' +
                                '</div>' +
                                '</article>';
                        }

                        let slotPickerHtml = '';
                        if (isPickingSlots) {
                            slotPickerHtml = '<div style="margin-top: 12px;">' +
                                '<div style="font-size: 0.8rem; font-weight: 600; text-transform: uppercase; color: var(--color-ink); margin-bottom: 6px;">Choose an open slot:</div>' +
                                '<div class="slot-picker" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px;">' +
                                slots.map(s => {
                                    const parts = typeof ChatbotEngine !== 'undefined' ? ChatbotEngine.formatSlotParts(s) : { day: s, time: '' };
                                    return '<button type="button" class="slot-button" onclick="event.stopPropagation(); handleChooseSlot('' + listing.listing_id + '', '' + s + '')" style="padding: 8px; border: 1px solid var(--hairline); border-radius: var(--radius-md); background: var(--glass-fill); color: var(--color-ink); cursor: pointer; text-align: left;">' +
                                        '<div style="font-weight: 600; font-size: 0.8rem;">' + parts.day + '</div>' +
                                        '<div style="font-size: 0.75rem; color: var(--color-accent-text);">' + parts.time + '</div>' +
                                        '</button>';
                                }).join('') +
                                '</div>' +
                                '</div>';
                        }

                        let detailsHtml = '';
                        if (isOpen) {
                            detailsHtml = '<div class="listing-details" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--hairline); font-size: 0.85rem; line-height: 1.4; color: var(--color-ink-soft);">' +
                                '<p>' + (listing.listing_description || '') + '</p>' +
                                slotPickerHtml +
                                '<div style="display: flex; gap: 8px; margin-top: 12px;">' +
                                '<button type="button" onclick="event.stopPropagation(); toggleBookingSlots('' + key + '')" style="flex: 1; padding: 10px; border-radius: var(--radius-full); background: var(--color-accent); color: var(--color-on-accent); font-weight: 600; font-size: 0.85rem; border: none; cursor: pointer;">' +
                                (isPickingSlots ? 'Hide slots' : 'Book a slot') +
                                '</button>' +
                                '<button type="button" onclick="event.stopPropagation(); window.location.href='../'" style="padding: 10px 16px; border-radius: var(--radius-full); background: transparent; border: 1px solid var(--hairline); color: var(--color-ink); font-size: 0.85rem; cursor: pointer;">' +
                                'View on Marketplace' +
                                '</button>' +
                                '</div>' +
                                '</div>';
                        }

                        return '<article class="listing-card ' + (isOpen ? 'is-open' : '') + '" onclick="toggleCard('' + key + '')">' +
                            '<div class="listing-header" style="display: flex; justify-content: space-between; align-items: flex-start;">' +
                            '<div>' +
                            '<div class="listing-provider" style="font-size: 0.85rem; color: var(--color-ink-soft); display: flex; align-items: center; gap: 6px;">' +
                            '<span>' + (provider.name || 'Provider') + '</span>' +
                            '<span style="font-size: 0.72rem; background: var(--glass-fill); padding: 1px 6px; border-radius: var(--radius-full); border: 1px solid var(--hairline);">Verified</span>' +
                            '</div>' +
                            '<h4 class="listing-title" style="margin: 2px 0 4px; font-family: var(--font-display); font-size: 1.1rem; color: var(--color-ink);">' + listing.title + '</h4>' +
                            '<div style="font-size: 0.8rem; color: var(--color-ink-soft);">' +
                            '? ' + (listing.rating ? listing.rating.toFixed(1) : '5.0') + ' (' + (listing.review_count || 0) + ') ? ? ' + listing.provider_location +
                            '</div>' +
                            '</div>' +
                            '<div class="listing-price" style="font-weight: 700; font-size: 1rem; color: var(--color-accent-text); background: var(--glass-fill); padding: 4px 10px; border-radius: var(--radius-md); border: 1px solid var(--hairline);">' +
                            priceText +
                            '</div>' +
                            '</div>' +
                            '<div class="listing-reason" style="margin-top: 8px; font-size: 0.8rem; color: var(--color-ink-soft); background: var(--glass-fill); padding: 6px 10px; border-radius: var(--radius-md);">' +
                            '? ' + (listing.reason || 'Matches your request') +
                            '</div>' +
                            detailsHtml +
                            '</article>';
                    }).join('') +
                    '</div>';
            }
        }
    });

    if (state.isTyping) {
        html += 
            '<div class="typing-indicator message-enter" style="display: flex; gap: 4px; padding: 10px 14px; background: var(--glass-fill); width: fit-content; border-radius: var(--radius-full); margin-top: 6px;">' +
            '<span class="dot" style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-ink-soft);"></span>' +
            '<span class="dot" style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-ink-soft);"></span>' +
            '<span class="dot" style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-ink-soft);"></span>' +
            '</div>';
    }

    container.innerHTML = html;
    const thread = document.getElementById('chat-thread');
    if (thread) thread.scrollTop = thread.scrollHeight;
}
