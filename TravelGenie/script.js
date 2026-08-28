const API_BASE = 'http://localhost:3000/api';
let currentTripData = {
    budget: 0,
    destination: null,
    itinerary: [],
    totalCost: 0
};

// Navigation
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Load default trending recommendations on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${API_BASE}/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Empty body for default trending
        });
        if (res.ok) {
            const data = await res.json();
            displayRecommendations(data.recommendations, 'home-recommendations-list');
        }
    } catch (err) {
        console.error('Failed to load initial trending destinations', err);
    }
});

// Plan Trip Form Submit
document.getElementById('trip-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Store all preferences in currentTripData
    const budgetInput = document.getElementById('budget-input').value;
    currentTripData.budget = parseFloat(budgetInput) || 0;
    currentTripData.destinationPref = document.getElementById('destination-pref')?.value || '';
    currentTripData.startLocation = document.getElementById('start-location')?.value || '';
    currentTripData.duration = parseInt(document.getElementById('duration')?.value) || 4;
    currentTripData.travelers = parseInt(document.getElementById('travelers')?.value) || 2;
    currentTripData.travelStyle = document.getElementById('travel-style')?.value || '';
    currentTripData.interests = document.getElementById('interests')?.value || '';

    const btn = e.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Analyzing...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_BASE}/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentTripData)
        });
        const data = await res.json();
        
        if (!res.ok) {
            alert(data.error || 'Something went wrong.');
            return;
        }
        
        displayRecommendations(data.recommendations, 'recommendations-list');
        displayRecommendations(data.recommendations, 'home-recommendations-list');
        navigateTo('recommendations-screen');
    } catch (err) {
        alert('Error fetching recommendations. Is the backend running?');
        console.error(err);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

// Display Recommendations
function displayRecommendations(destinations, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!destinations || destinations.length === 0) {
        container.innerHTML = '<p>No destinations found matching your criteria. Try adjusting your preferences.</p>';
        return;
    }

    destinations.forEach(dest => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.onclick = () => viewDestination(dest.id);
        card.innerHTML = `
            <img src="${dest.imageUrl}" alt="${dest.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius) var(--radius) 0 0; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding: 0 1rem;">
                <h3 style="margin:0;">${dest.name}</h3>
                <span class="match-badge">${dest.matchPercentage}% Match</span>
            </div>
            <p style="padding: 0 1rem;"><strong>Est. Cost:</strong> ₹${dest.estimatedCost}</p>
            <p style="margin: 0.5rem 0; font-size: 0.9rem; color: var(--text-light); padding: 0 1rem;">
                ${dest.reasons.map(r => `• ${r}`).join('<br>')}
            </p>
            <div style="padding: 1rem;">
                <button class="secondary-btn" style="width: 100%;">View Details</button>
            </div>
        `;
        // Removed default padding in css for cards? The CSS for .card has padding: 1.5rem.
        // Let's adjust the inline styles so the image stretches edge-to-edge.
        card.style.padding = '0';
        container.appendChild(card);
    });
}

// View Destination Details
async function viewDestination(id) {
    try {
        const res = await fetch(`${API_BASE}/destination/${id}`);
        const dest = await res.json();
        currentTripData.destination = dest.id;

        const container = document.getElementById('destination-content');
        container.innerHTML = `
            <div class="dest-header" style="position: relative; height: 300px; border-radius: var(--radius); overflow: hidden; margin-bottom: 2rem;">
                <img src="${dest.imageUrl}" alt="${dest.name}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); padding: 2rem; color: white;">
                    <h2 style="margin: 0;">${dest.name}</h2>
                </div>
            </div>
            <div class="dest-info-grid">
                <div class="info-box">
                    <i class="fa-solid fa-cloud-sun"></i>
                    <h4>Weather</h4>
                    <p>${dest.weather.temp}, ${dest.weather.condition}</p>
                </div>
                <div class="info-box">
                    <i class="fa-solid fa-shield-halved"></i>
                    <h4>Safety</h4>
                    <p>${dest.safety}</p>
                </div>
                <div class="info-box">
                    <i class="fa-solid fa-hotel"></i>
                    <h4>Top Hotels</h4>
                    <p>${dest.hotels.join(', ')}</p>
                </div>
            </div>
            <div class="info-box" style="margin-bottom: 2rem;">
                <h4>Top Attractions</h4>
                <p>${dest.attractions.join(', ')}</p>
            </div>
        `;
        
        navigateTo('destination-screen');
    } catch (err) {
        alert('Error loading destination details.');
    }
}

// Generate Itinerary
document.getElementById('generate-itinerary-btn')?.addEventListener('click', async () => {
    try {
        const btn = document.getElementById('generate-itinerary-btn');
        btn.textContent = 'Generating...';

        const res = await fetch(`${API_BASE}/itinerary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destination: currentTripData.destination,
                days: 4, // 4-day itinerary as per prompt
                budget: currentTripData.budget
            })
        });
        const data = await res.json();
        
        currentTripData.itinerary = data.itinerary;
        currentTripData.totalCost = data.totalCost;
        
        renderItinerary(data.itinerary);
        updateBudgetDisplay();
        navigateTo('itinerary-screen');
    } catch (err) {
        alert('Error generating itinerary.');
    } finally {
        document.getElementById('generate-itinerary-btn').textContent = 'Generate AI Itinerary';
    }
});

function renderItinerary(itinerary) {
    const container = document.getElementById('itinerary-content');
    container.innerHTML = '';
    
    itinerary.forEach(day => {
        const dayHeader = document.createElement('h3');
        dayHeader.style.marginTop = '2rem';
        dayHeader.style.marginBottom = '1rem';
        dayHeader.textContent = `Day ${day.day}`;
        container.appendChild(dayHeader);

        day.activities.forEach(act => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-time">${act.time}</div>
                <div style="font-weight: 600;">${act.description}</div>
                <div style="color: var(--text-light); font-size: 0.9rem;">
                    <i class="fa-solid fa-location-dot"></i> ${act.location} 
                    | <i class="fa-solid fa-tag"></i> ₹${act.cost}
                </div>
            `;
            container.appendChild(item);
        });
    });
}

// Budget Calculation
function updateBudgetDisplay() {
    document.getElementById('total-budget-display').textContent = `₹${currentTripData.budget}`;
    document.getElementById('estimated-cost-display').textContent = `₹${currentTripData.totalCost}`;
    
    const remaining = currentTripData.budget - currentTripData.totalCost;
    const remainingElem = document.getElementById('remaining-budget-display');
    remainingElem.textContent = `₹${remaining}`;
    
    if (remaining < 0) {
        remainingElem.style.color = '#ef4444'; // red
    } else {
        remainingElem.style.color = 'var(--primary)';
    }

    // Mock category breakdown
    const categories = document.getElementById('budget-categories');
    categories.innerHTML = `
        <li style="margin-bottom: 0.5rem; display: flex; justify-content: space-between;"><span>Accommodation</span> <span>₹${currentTripData.totalCost * 0.4}</span></li>
        <li style="margin-bottom: 0.5rem; display: flex; justify-content: space-between;"><span>Food</span> <span>₹${currentTripData.totalCost * 0.3}</span></li>
        <li style="margin-bottom: 0.5rem; display: flex; justify-content: space-between;"><span>Activities</span> <span>₹${currentTripData.totalCost * 0.3}</span></li>
    `;
}

function updateTotalBudget() {
    const newBudget = document.getElementById('update-budget-input').value;
    if (newBudget && !isNaN(newBudget)) {
        currentTripData.budget = parseFloat(newBudget);
        updateBudgetDisplay();
        alert('Budget updated!');
    }
}

// Simulate Dynamic Replanning (Weather Event)
async function simulateWeatherEvent() {
    try {
        const res = await fetch(`${API_BASE}/replan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentItinerary: currentTripData.itinerary,
                event: 'heavy rain'
            })
        });
        const data = await res.json();
        
        currentTripData.itinerary = data.updatedItinerary;
        currentTripData.totalCost = data.totalCost; // Update the total cost
        
        renderItinerary(data.updatedItinerary);
        updateBudgetDisplay(); // Update budget UI
        alert(data.message);
    } catch (err) {
        alert('Error during replanning.');
    }
}

// AI Assistant Chat
document.getElementById('send-chat-btn')?.addEventListener('click', sendChatMessage);
document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';

    try {
        const res = await fetch(`${API_BASE}/assistant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        appendMessage(data.response, 'bot');
    } catch (err) {
        appendMessage('Sorry, I am having trouble connecting to the server.', 'bot');
    }
}

function appendMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}
