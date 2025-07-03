// Get DOM elements
const searchModal = document.getElementById('searchModal');
const openSearchBtn = document.getElementById('openSearchBtn'); // Desktop navbar search button
const heroSearchBtn = document.getElementById('heroSearchBtn'); // Hero section search button
const closeModalBtn = document.getElementById('closeModalBtn');
const eventForm = document.getElementById('eventForm');
const resultsDiv = document.getElementById('results'); // Search Results Container
const featuredEventsContainer = document.getElementById('featuredEventsContainer'); // Featured Events Container

// Mobile menu elements
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const openSearchBtnMobile = document.getElementById('openSearchBtnMobile');

// --- Helper function to render event cards (REUSABLE) ---
function renderEventCards(containerElement, eventsData, messageIfEmpty) {
    if (eventsData && eventsData.length > 0) {
        let eventsHtml = '';
        eventsData.forEach(event => {
            eventsHtml += `
                <div class="event-card">
                    <h4>${event.name || 'Untitled Event'}</h4>
                    <p><strong>Description:</strong> ${event.description || 'No description available.'}</p>
                    <p><strong>Date & Time:</strong> ${event.date || 'To be announced'}</p>
                    <p><strong>Location:</strong> ${event.location || 'Online/Various'}</p>
                    <p><strong>Price:</strong> ${event.price || 'Free / N/A'}</p>
                    ${event.source ? `<p><strong>Source:</strong> <a href="${event.source}" target="_blank" rel="noopener noreferrer">${event.source}</a></p>` : ''}
                </div>
            `;
        });
        containerElement.innerHTML = eventsHtml;
    } else {
        containerElement.innerHTML = `<p class="no-results-message">${messageIfEmpty}</p>`;
    }
}

// --- Function to load featured events on page load ---
async function loadFeaturedEvents() {
    featuredEventsContainer.innerHTML = '<p class="loading-message">Loading featured events...</p>'; // Initial loading message

    const defaultData = {
        location: "Liechtenstein", // Default location for featured events
        activity_type: "Any",
        timeframe: "This Weekend",
        radius: "", // No radius for broader search
        keywords: ""
    };

    // Correct the n8n webhook URL if you're using /webhook-test/, otherwise use /webhook/
    const n8nWebhookUrl = "https://winwinglobal.app.n8n.cloud/webhook/event-finder"; // Removed -test
    try {
        const response = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(defaultData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error loading featured: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        const events = result.results ? JSON.parse(result.results) : [];

        renderEventCards(featuredEventsContainer, events, "No featured events found at this time. Try searching!");

    } catch (error) {
        console.error("Error loading featured events:", error);
        featuredEventsContainer.innerHTML = '<p class="error-message">Could not load featured events. Please try again later.</p>';
    }
}


// --- Event Listeners for UI interaction ---

// Open search modal from desktop navbar (Q Search)
const qSearchButton = document.querySelector('.navbar-right .search-btn');
if (qSearchButton) { // Check if element exists before adding listener
    qSearchButton.addEventListener('click', () => {
        searchModal.style.display = 'flex';
    });
}

// Open search modal from desktop navbar (text button)
if (openSearchBtn) {
    openSearchBtn.addEventListener('click', () => {
        searchModal.style.display = 'flex'; // Use flex for centering
    });
}

// Open search modal from hero section button
if (heroSearchBtn) {
    heroSearchBtn.addEventListener('click', () => {
        searchModal.style.display = 'flex';
    });
}

// Open search modal from mobile menu
if (openSearchBtnMobile) {
    openSearchBtnMobile.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        searchModal.style.display = 'flex';
    });
}

// Close search modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        searchModal.style.display = 'none';
    });
}

// Close modal if clicking outside modal content
window.addEventListener('click', (event) => {
    if (event.target === searchModal) {
        searchModal.style.display = 'none';
    }
});

// Mobile menu toggle
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.add('open');
    });
}

// Close mobile menu
if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
    });
}


// --- Form Submission Logic ---

eventForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission

    // Display a loading message
    resultsDiv.innerHTML = '<p class="loading-message">Searching for events... Please wait.</p>';

    const data = {
        location: document.getElementById("location").value,
        activity_type: document.getElementById("activity_type").value,
        timeframe: document.getElementById("timeframe").value,
        radius: document.getElementById("radius").value,
        keywords: document.getElementById("keywords").value
    };

    // Close the modal after submission (optional, but good UX)
    searchModal.style.display = 'none';

    try {
        // IMPORTANT: Ensure this is your correct n8n webhook Production URL
        // And your n8n workflow must be Active
        const response = await fetch("https://winwinglobal.app.n8n.cloud/webhook/event-finder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Check if the response was successful
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        const events = result.results ? JSON.parse(result.results) : [];

        renderEventCards(resultsDiv, events, "No events found matching your criteria. Try broadening your search or adjusting keywords.");

    } catch (error) {
        console.error("Error fetching events:", error);
        resultsDiv.innerHTML = '<p class="error-message">An error occurred while fetching events. Please try again later.</p>';
    }
});

// --- Initial Calls ---
// Initial message for search results div
resultsDiv.innerHTML = '<p class="no-results-message">Your search results will appear here.</p>';

// Load featured events when the page loads
loadFeaturedEvents();