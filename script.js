// Get DOM elements
const searchModal = document.getElementById('searchModal');
const openSearchBtn = document.getElementById('openSearchBtn'); // Desktop navbar search button
const heroSearchBtn = document.getElementById('heroSearchBtn'); // Hero section search button
const closeModalBtn = document.getElementById('closeModalBtn');
const eventForm = document.getElementById('eventForm');
const resultsDiv = document.getElementById('results');

// Mobile menu elements
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const openSearchBtnMobile = document.getElementById('openSearchBtnMobile');


// --- Event Listeners for UI interaction ---

// Open search modal from desktop navbar
openSearchBtn.addEventListener('click', () => {
    searchModal.style.display = 'flex'; // Use flex for centering
});

// Open search modal from hero section button
heroSearchBtn.addEventListener('click', () => {
    searchModal.style.display = 'flex';
});

// Open search modal from mobile menu
openSearchBtnMobile.addEventListener('click', () => {
    mobileMenu.classList.remove('open'); // Close mobile menu first
    searchModal.style.display = 'flex';
});


// Close search modal
closeModalBtn.addEventListener('click', () => {
    searchModal.style.display = 'none';
});

// Close modal if clicking outside modal content
window.addEventListener('click', (event) => {
    if (event.target === searchModal) {
        searchModal.style.display = 'none';
    }
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
    mobileMenu.classList.add('open');
});

// Close mobile menu
closeMobileMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
});


// --- Form Submission Logic (unchanged from previous version) ---

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
        // IMPORTANT: Replace with your actual n8n webhook Production URL
        const response = await fetch("https://winwinglobal.app.n8n.cloud/webhook/event-finder", { // Changed to production URL
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

        // Format and display results
        if (result.results && result.results !== "[]" && JSON.parse(result.results).length > 0) {
            const events = JSON.parse(result.results);
            let eventsHtml = '<h3>Found Events:</h3><div class="event-cards-container">';
            events.forEach(event => {
                eventsHtml += `
                    <div class="event-card">
                        <h4>${event.name || 'N/A'}</h4>
                        <p><strong>Description:</strong> ${event.description || 'N/A'}</p>
                        <p><strong>Date & Time:</strong> ${event.date || 'N/A'}</p>
                        <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
                        <p><strong>Price:</strong> ${event.price || 'N/A'}</p>
                        ${event.source ? `<p><strong>Source:</strong> <a href="${event.source}" target="_blank">${event.source}</a></p>` : ''}
                    </div>
                `;
            });
            eventsHtml += '</div>';
            resultsDiv.innerHTML = eventsHtml;
        } else {
            resultsDiv.innerHTML = '<p class="no-results-message">No events found matching your criteria. Try broadening your search or adjusting keywords.</p>';
        }

    } catch (error) {
        console.error("Error fetching events:", error);
        resultsDiv.innerHTML = '<p class="error-message">An error occurred while fetching events. Please try again later.</p>';
    }
});

// Initial message for results div
resultsDiv.innerHTML = '<p class="no-results-message">Your search results will appear here.</p>';