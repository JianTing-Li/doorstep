// Simulated Database for Doorstep App Prototype
// Strictly adheres to the finalized Data Schema

const DB_LISTINGS = [
    {
        listing_id: "L-101",
        provider_id: "P-001",
        provider_name: "Sarah Jenkins",
        service_category: "Cleaning",
        service_title: "Deep Apartment Cleaning",
        price: 120,
        calendar_availability: ["2026-08-19", "2026-08-20", "2026-08-21"],
        rating: 4.8,
        reviews: 42,
        location: { lat: 40.7128, lng: -74.0060, distance: "1.2 miles" },
        description: "I provide deep cleaning services for apartments, including baseboards, appliances, and windows. Bring my own supplies!"
    },
    {
        listing_id: "L-102",
        provider_id: "P-002",
        provider_name: "Mike's Handyman Co.",
        service_category: "Handyman",
        service_title: "Plumbing & Sink Repair",
        price: 85,
        calendar_availability: ["2026-08-19", "2026-08-22"],
        rating: 4.9,
        reviews: 115,
        location: { lat: 40.7130, lng: -74.0050, distance: "0.8 miles" },
        description: "Licensed plumber and general handyman. Specializing in leaky sinks, pipe fitting, and general home repairs."
    },
    {
        listing_id: "L-103",
        provider_id: "P-003",
        provider_name: "QuickMove Team",
        service_category: "Moving",
        service_title: "Local Box & Furniture Moving",
        price: 150,
        calendar_availability: ["2026-08-20", "2026-08-21"],
        rating: 4.6,
        reviews: 89,
        location: { lat: 40.7150, lng: -74.0100, distance: "2.5 miles" },
        description: "Two-person team with a truck ready to help you move boxes and heavy furniture locally."
    },
    {
        listing_id: "L-104",
        provider_id: "P-004",
        provider_name: "Elena's Maid Service",
        service_category: "Cleaning",
        service_title: "Standard Weekly Clean",
        price: 75,
        calendar_availability: ["2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22"],
        rating: 4.5,
        reviews: 31,
        location: { lat: 40.7200, lng: -74.0010, distance: "3.0 miles" },
        description: "Reliable standard cleaning. Vacuuming, mopping, dusting, and bathroom sanitation."
    },
    {
        listing_id: "L-105",
        provider_id: "P-005",
        provider_name: "Fix-It Frank",
        service_category: "Handyman",
        service_title: "TV Mounting & Electrical",
        price: 60,
        calendar_availability: ["2026-08-21", "2026-08-23"],
        rating: 4.7,
        reviews: 56,
        location: { lat: 40.7100, lng: -74.0150, distance: "1.8 miles" },
        description: "Expert TV mounting, light fixture installation, and general electrical handyman work."
    }
];
