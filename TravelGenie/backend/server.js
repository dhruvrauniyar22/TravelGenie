require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../')); // Serve static frontend files if needed

const PORT = process.env.PORT || 3000;

// Helper function to fetch destination image
// Structure ready for a real API (e.g., Unsplash API, Google Places Photo)
async function fetchDestinationImage(destinationName) {
    // TODO: Implement real API call when API key is available
    // Example: 
    // const response = await fetch(`https://api.unsplash.com/search/photos?query=${destinationName}&client_id=${process.env.UNSPLASH_API_KEY}`);
    // const data = await response.json();
    // return data.results[0].urls.regular;

    // Fallback: Using LoremFlickr for reliable mock images based on destination name
    const sanitizedName = destinationName.split(',')[0].toLowerCase().replace(/\s+/g, '');
    return `https://loremflickr.com/800/600/india,${sanitizedName},travel`;
}

// Demo/Fallback Data

const demoDestinations = [
  {
    id: 'meghalaya',
    name: 'Meghalaya, India',
    estimatedCost: 25000,
    style: ['Adventure', 'Nature'],
    reasons: ['Abode of clouds', 'Living root bridges', 'Pristine waterfalls'],
    weather: { temp: '18°C', condition: 'Misty' },
    hotels: ['Polo Orchid Resort', 'Ri Kynjai'],
    restaurants: ['Café Shillong', 'Dylan\'s Café'],
    attractions: ['Cherrapunji', 'Dawki River', 'Elephant Falls'],
    activities: ['Trekking', 'Boating', 'Caving'],
    safety: 'Very High',
    mapUrl: 'https://www.google.com/maps/embed?pb=...' 
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling, West Bengal',
    estimatedCost: 20000,
    style: ['Relaxing', 'Nature'],
    reasons: ['Tea gardens', 'Himalayan views', 'Toy train'],
    weather: { temp: '15°C', condition: 'Cloudy' },
    hotels: ['Windamere Hotel', 'Glenburn Tea Estate'],
    restaurants: ['Glenary\'s', 'Keventers'],
    attractions: ['Tiger Hill', 'Batasia Loop', 'Peace Pagoda'],
    activities: ['Tea Tasting', 'Mountain Railways'],
    safety: 'High',
    mapUrl: 'https://www.google.com/maps/embed?pb=...' 
  },
  {
    id: 'hampi',
    name: 'Hampi, Karnataka',
    estimatedCost: 15000,
    style: ['Cultural', 'History'],
    reasons: ['Ancient ruins', 'Fascinating boulder landscapes', 'Cultural heritage'],
    weather: { temp: '32°C', condition: 'Sunny' },
    hotels: ['Evolve Back', 'Heritage Resort Hampi'],
    restaurants: ['Mango Tree', 'Laughing Buddha'],
    attractions: ['Virupaksha Temple', 'Vittala Temple', 'Matanga Hill'],
    activities: ['Bouldering', 'Temple Hopping', 'Coracle Ride'],
    safety: 'Moderate',
    mapUrl: 'https://www.google.com/maps/embed?pb=...' 
  },
  {
    id: 'ladakh',
    name: 'Ladakh, India',
    estimatedCost: 30000,
    style: ['Adventure'],
    reasons: ['High altitude desert', 'Buddhist monasteries', 'Stunning lakes'],
    weather: { temp: '10°C', condition: 'Clear' },
    hotels: ['The Grand Dragon', 'Gomang Boutique Hotel'],
    restaurants: ['Tibetan Kitchen', 'Bon Appetit'],
    attractions: ['Pangong Lake', 'Nubra Valley', 'Thiksey Monastery'],
    activities: ['Motorbiking', 'Trekking', 'Camel Safari'],
    safety: 'High',
    mapUrl: 'https://www.google.com/maps/embed?pb=...' 
  },
  {
    id: 'sikkim',
    name: 'Sikkim, India',
    estimatedCost: 18000,
    style: ['Nature', 'Relaxing'],
    reasons: ['Snow-capped peaks', 'Vibrant monasteries', 'Organic farming'],
    weather: { temp: '12°C', condition: 'Pleasant' },
    hotels: ['Mayfair Spa Resort', 'The Elgin Nor-Khill'],
    restaurants: ['Taste of Tibet', 'Roll House'],
    attractions: ['Nathu La Pass', 'Tsomgo Lake', 'Rumtek Monastery'],
    activities: ['Hiking', 'Cable Car Ride', 'Monastery Tour'],
    safety: 'Very High',
    mapUrl: 'https://www.google.com/maps/embed?pb=...' 
  },
  {
    id: 'kerala',
    name: 'Kerala, India',
    estimatedCost: 35000,
    style: ['Relaxing', 'Nature'],
    reasons: ['Tranquil backwaters', 'Ayurvedic treatments', 'Lush tea gardens'],
    weather: { temp: '28°C', condition: 'Humid' },
    hotels: ['Kumarakom Lake Resort', 'Taj Malabar Resort'],
    restaurants: ['Villa Maya', 'History Restaurant'],
    attractions: ['Alleppey Backwaters', 'Munnar', 'Fort Kochi'],
    activities: ['Houseboat Cruise', 'Ayurveda Spa', 'Tea Tasting'],
    safety: 'High',
    mapUrl: 'https://www.google.com/maps/embed?pb=...' 
  },
  {
    id: 'jaipur',
    name: 'Jaipur, Rajasthan',
    estimatedCost: 15000,
    style: ['Cultural'],
    reasons: ['Majestic forts', 'Royal palaces', 'Vibrant markets'],
    weather: { temp: '25°C', condition: 'Sunny' },
    hotels: ['Rambagh Palace', 'Samode Haveli'],
    restaurants: ['Suvarna Mahal', 'Peacock Rooftop'],
    attractions: ['Amer Fort', 'Hawa Mahal', 'City Palace'],
    activities: ['Palace Tour', 'Shopping', 'Hot Air Balloon'],
    safety: 'Moderate',
    mapUrl: 'https://www.google.com/maps/embed?pb=...' 
  }
];

const generateDemoItinerary = (destination, days, budget) => {
    const itinerary = [];
    for(let i=1; i<=days; i++) {
        itinerary.push({
            day: i,
            activities: [
                { time: '09:00 AM', description: 'Morning Exploration', location: `${destination} Viewpoint`, cost: 500 },
                { time: '01:00 PM', description: 'Lunch at Local Restaurant', location: 'City Center', cost: 800 },
                { time: '03:00 PM', description: 'Afternoon Sightseeing', location: 'Historical Site', cost: 400 },
                { time: '07:00 PM', description: 'Dinner and Evening Walk', location: 'Local Market', cost: 1000 }
            ]
        });
    }
    return itinerary;
};

// Mock list of non-Indian locations for validation
const nonIndianLocations = ['new york', 'paris', 'tokyo', 'london', 'dubai', 'singapore', 'bali', 'europe', 'usa', 'uk'];

// Endpoints

app.post('/api/recommendations', async (req, res) => {
    const { destinationPref, budget, travelStyle, duration } = req.body;
    
    // Validate destination is in India
    if (destinationPref) {
        const prefLower = destinationPref.toLowerCase();
        const isForeign = nonIndianLocations.some(loc => prefLower.includes(loc));
        if (isForeign) {
            return res.status(400).json({ 
                error: 'TravelGenie currently supports destinations within India 🇮🇳. Please enter a valid Indian location.' 
            });
        }
    }

    // Dynamic AI Scoring Logic
    let scoredDestinations = demoDestinations.map(dest => {
        let score = 50; // Base score

        // If specific destination typed, boost its score
        if (destinationPref && dest.name.toLowerCase().includes(destinationPref.toLowerCase())) {
            score += 40;
        }

        // Budget match (if budget per person approx fits)
        // Note: budget is total for all travelers. Let's assume estimatedCost is per person for the duration.
        // For simplicity, just check if user budget is somewhat close to estimatedCost * 2 (assuming 2 travelers default)
        // Or we just boost if it's within budget
        const totalEstimated = dest.estimatedCost * (duration ? duration / 4 : 1); // Adjust for duration
        if (budget && budget >= totalEstimated * 0.8) {
            score += 20;
        }

        // Travel Style match
        if (travelStyle && dest.style.includes(travelStyle)) {
            score += 20;
        }

        return {
            ...dest,
            matchPercentage: Math.min(99, score) // Max 99% match
        };
    });

    // Sort by score descending
    scoredDestinations.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Take top 3
    const topDestinations = scoredDestinations.slice(0, 3);

    // Assign images dynamically
    const recommendationsWithImages = await Promise.all(topDestinations.map(async (dest) => {
        return {
            ...dest,
            imageUrl: await fetchDestinationImage(dest.name)
        };
    }));

    res.json({ recommendations: recommendationsWithImages });
});

app.get('/api/destination/:id', async (req, res) => {
    const dest = demoDestinations.find(d => d.id === req.params.id);
    if (dest) {
        const destWithImage = {
            ...dest,
            imageUrl: await fetchDestinationImage(dest.name)
        };
        res.json(destWithImage);
    } else {
        res.status(404).json({ error: 'Destination not found' });
    }
});

app.post('/api/itinerary', (req, res) => {
    const { destination, days, budget } = req.body;
    const itinerary = generateDemoItinerary(destination, days, budget);
    let calculatedTotal = 0;
    itinerary.forEach(dayInfo => {
        dayInfo.activities.forEach(act => {
            calculatedTotal += act.cost;
        });
    });
    res.json({ itinerary, totalCost: calculatedTotal }); 
});

app.post('/api/assistant', (req, res) => {
    const { message } = req.body;
    // Simulate AI response
    let response = "I'm your AI Travel Assistant. How can I help you refine your trip?";
    if (message.toLowerCase().includes('weather')) {
        response = "The weather looks great! However, if it rains, I can suggest indoor activities.";
    } else if (message.toLowerCase().includes('budget')) {
        response = "I can help you find cheaper alternatives for accommodation and dining.";
    }
    res.json({ response });
});

app.post('/api/replan', (req, res) => {
    const { currentItinerary, event } = req.body;
    // Simulate replanning due to an event (e.g., weather)
    // In a real app, use AI to update the itinerary intelligently
    let newTotalCost = 0;
    const updatedItinerary = currentItinerary.map(dayInfo => {
        let newActivities = dayInfo.activities;
        if (dayInfo.day === 2) {
            newActivities = dayInfo.activities.map(act => 
                act.description === 'Afternoon Sightseeing' 
                    ? { ...act, description: '[UPDATED] Indoor Museum Visit (due to rain)', cost: act.cost + 200 } 
                    : act
            );
        }
        
        newActivities.forEach(act => {
            newTotalCost += act.cost;
        });

        return {
            ...dayInfo,
            activities: newActivities
        };
    });
    res.json({ updatedItinerary, totalCost: newTotalCost, message: "✓ Itinerary updated due to " + event });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
