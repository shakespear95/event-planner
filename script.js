// Get DOM elements (existing ones)
const searchModal = document.getElementById('searchModal');
const openSearchBtn = document.getElementById('openSearchBtn');
const heroSearchBtn = document.getElementById('heroSearchBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const eventForm = document.getElementById('eventForm');
const resultsDiv = document.getElementById('results');

// Mobile menu elements (existing ones)
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const openSearchBtnMobile = document.getElementById('openSearchBtnMobile');

// New: Login/Signup Button
const loginSignupBtn = document.querySelector('.login-signup a');

// New: Desktop Search button (for the Q Search text)
const desktopSearchBtn = document.querySelector('.navbar-right .search-btn');

// --- Supabase Configuration ---
// Replace with your ACTUAL Supabase Project URL and anon key
const SUPABASE_URL = 'https://nsdxklohluaakzftstelx.supabase.co'; // Your Project URL
const SUPABASE_ANON_KEY = 'YOUR_FULL_ANON_PUBLIC_KEY'; // Your full anon public key

// Initialize Supabase client
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Authentication Functions ---

// Function to update UI based on auth state
async function updateAuthUI(session) {
    if (session) {
        console.log('User is logged in:', session.user);
        loginSignupBtn.textContent = 'Sign Out';
        loginSignupBtn.href = '#'; // Make it an action
        loginSignupBtn.removeEventListener('click', redirectToLoginSignup);
        loginSignupBtn.addEventListener('click', signOut);
        // You might show a "My Profile" link or similar here
    } else {
        console.log('User is not logged in.');
        loginSignupBtn.textContent = 'Log In / Sign Up';
        loginSignupBtn.removeEventListener('click', signOut);
        loginSignupBtn.addEventListener('click', redirectToLoginSignup); // Setup listener for login/signup
    }
}

// Handler for the "Log In / Sign Up" button click
function redirectToLoginSignup(event) {
    event.preventDefault();
    // For now, we'll just log and maybe open a simple prompt,
    // later this will open a dedicated login/signup modal.
    console.log("Redirecting to login/signup flow... (To be implemented)");
    // For a real flow, you'd typically open a modal here,
    // or redirect to a dedicated login page.
    alert("Login/Signup functionality coming soon! For now, you'll need to create a UI for this.");
}


async function signOut(event) {
    event.preventDefault();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        console.log("User signed out successfully.");
        // The onAuthStateChange listener will handle UI update
    } catch (error) {
        console.error("Error signing out:", error.message);
    }
}

// Listen for authentication state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, 'Session:', session);
    updateAuthUI(session);
});

// Initial check when the page loads (gets current session)
supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthUI(session);
});


// --- Event Listeners for UI interaction (Existing, with minor adjustments) ---

// Open search modal from desktop navbar (Q Search)
desktopSearchBtn.addEventListener('click', () => {
    searchModal.style.display = 'flex';
});

// Open search modal from desktop navbar (text button)
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
        // Ensure this URL is correct and your n8n workflow is active
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