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
const loginSignupBtn = document.querySelector('.login-signup a'); // Select the <a> tag
// New: Desktop Search button (for the Q Search text)
const desktopSearchBtn = document.querySelector('.navbar-right .search-btn'); // Select the button with the search icon and text

// --- Configure AWS Amplify ---
// Replace with your ACTUAL Cognito details
const amplifyConfig = {
    Auth: {
        region: 'ap-south-1', // Your AWS region
        userPoolId: 'ap-south-1_NbcNzaFOF', // Your User Pool ID
        userPoolWebClientId: '2fl9b2m0shvp912skoodb7qobd', // Your App Client ID
        oauth: {
            domain: 'ap-south-1nbngszfof.auth.ap-south-1.amazoncognito.com', // Your Cognito Domain
            scope: ['email', 'profile', 'openid'],
            redirectSignIn: 'https://shakespear95.github.io/event-finder-frontend/', // Your GitHub Pages URL (Callback URL)
            redirectSignOut: 'https://shakespear95.github.io/event-finder-frontend/', // Your GitHub Pages URL (Sign-out URL)
            responseType: 'code' // or 'token'
        }
    }
};

Amplify.configure(amplifyConfig);

// --- Authentication Functions ---

async function handleAuthRedirect() {
    try {
        const currentUser = await Amplify.Auth.currentAuthenticatedUser();
        console.log('User is logged in:', currentUser);
        loginSignupBtn.textContent = 'Sign Out';
        loginSignupBtn.href = '#'; // Make it a button action rather than a link
        loginSignupBtn.removeEventListener('click', redirectToCognitoSignIn); // Remove old listener
        loginSignupBtn.addEventListener('click', signOut); // Add signOut listener
        // Optionally update other UI elements for logged-in state
    } catch (error) {
        console.log('User is not logged in:', error);
        loginSignupBtn.textContent = 'Log In / Sign Up';
        loginSignupBtn.removeEventListener('click', signOut); // Remove signOut listener if present
        loginSignupBtn.addEventListener('click', redirectToCognitoSignIn); // Ensure sign-in listener is active
    }
}

async function redirectToCognitoSignIn(event) {
    event.preventDefault(); // Prevent default link behavior
    // INSERT THE CONSOLE.LOG HERE:
    console.log("Attempting to redirect to Cognito Hosted UI...");
    try {
        await Amplify.Auth.federatedSignIn(); // This redirects to the hosted UI
    } catch (error) {
        console.error("Error redirecting to sign in:", error);
    }
}

async function signOut(event) {
    event.preventDefault(); // Prevent default link behavior
    try {
        await Amplify.Auth.signOut(); // This clears tokens and redirects to sign-out URL
        console.log("User signed out successfully.");
        // After sign out, the handleAuthRedirect will run again on page load
        // and update the button to "Log In / Sign Up"
    } catch (error) {
        console.error("Error signing out:", error);
    }
}

// Initial check when the page loads
handleAuthRedirect();


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