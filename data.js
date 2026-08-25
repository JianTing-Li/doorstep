// Doorstep Shared Mock Data Loader - Auto-synced from JT mock-data repository

var DB_META = {
  "reference_date": "2026-08-19",
  "city": "Portland, Oregon",
  "timezone": "America/Los_Angeles",
  "currency": "USD",
  "commission_rate": 0.15,
  "version": "1.1.0",
  "generated_at": "2026-08-19"
};

var DB_NEIGHBORHOODS = [
  {
    "name": "Alberta Arts",
    "latitude": 45.559,
    "longitude": -122.647
  },
  {
    "name": "Montavilla",
    "latitude": 45.518,
    "longitude": -122.583
  },
  {
    "name": "Kenton",
    "latitude": 45.586,
    "longitude": -122.69
  },
  {
    "name": "Woodstock",
    "latitude": 45.479,
    "longitude": -122.61
  },
  {
    "name": "Sellwood",
    "latitude": 45.464,
    "longitude": -122.657
  },
  {
    "name": "Laurelhurst",
    "latitude": 45.529,
    "longitude": -122.625
  },
  {
    "name": "St. Johns",
    "latitude": 45.59,
    "longitude": -122.755
  },
  {
    "name": "Lents",
    "latitude": 45.487,
    "longitude": -122.568
  },
  {
    "name": "Multnomah Village",
    "latitude": 45.468,
    "longitude": -122.715
  },
  {
    "name": "Buckman",
    "latitude": 45.518,
    "longitude": -122.652
  },
  {
    "name": "Hawthorne",
    "latitude": 45.512,
    "longitude": -122.625
  },
  {
    "name": "Irvington",
    "latitude": 45.545,
    "longitude": -122.648
  },
  {
    "name": "Pearl District",
    "latitude": 45.528,
    "longitude": -122.682
  },
  {
    "name": "Northwest District",
    "latitude": 45.533,
    "longitude": -122.698
  },
  {
    "name": "Division-Clinton",
    "latitude": 45.505,
    "longitude": -122.632
  }
];

var DB_LISTINGS = [
  {
    "listing_id": "lst_001",
    "provider_id": "prv_001",
    "title": "Weekly Apartment Cleaning, 1-2 Bedrooms",
    "listing_description": "I clean one and two bedroom apartments on a weekly or biweekly schedule. Every visit covers kitchen counters and stovetop, sink and toilet scrub, mirrors, vacuuming the carpet, and mopping the hard floors. I bring my own supplies unless you would rather I use yours. Trash and recycling go out on my way if your building has a chute.",
    "service_type": [
      "cleaning_standard"
    ],
    "price": 45,
    "price_unit": "hourly",
    "duration_estimate_minutes": 180,
    "provider_location": "Alberta Arts",
    "latitude": 45.56061,
    "longitude": -122.64812,
    "service_radius_miles": 8,
    "rating": 5.0,
    "review_count": 2,
    "availability": [
      "2026-09-10T13:00:00-07:00",
      "2026-09-11T11:00:00-07:00",
      "2026-10-02T15:00:00-07:00",
      "2026-10-03T16:00:00-07:00",
      "2026-10-12T10:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_002",
    "provider_id": "prv_001",
    "title": "Kitchen & Bathroom Refresh",
    "listing_description": "This is a focused two-room visit for the kitchen and bathroom only. I degrease the stovetop and range hood, wipe cabinet fronts, scrub the sink, and clean the tub, tile grout, toilet, and mirror. Good if the rest of the place is fine but those two rooms have gotten away from you.",
    "service_type": [
      "cleaning_standard"
    ],
    "price": 120,
    "price_unit": "flat",
    "duration_estimate_minutes": 150,
    "provider_location": "Alberta Arts",
    "latitude": 45.56242,
    "longitude": -122.6505,
    "service_radius_miles": 8,
    "rating": 4.0,
    "review_count": 1,
    "availability": [
      "2026-08-31T11:00:00-07:00",
      "2026-08-31T13:00:00-07:00",
      "2026-09-11T08:00:00-07:00",
      "2026-09-25T11:00:00-07:00",
      "2026-10-07T16:00:00-07:00",
      "2026-10-09T08:00:00-07:00",
      "2026-10-09T15:00:00-07:00",
      "2026-10-13T09:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_003",
    "provider_id": "prv_001",
    "title": "Move-Out Deep Clean, Studio to 2BR",
    "listing_description": "Move-out clean for an empty studio through two bedroom. I do inside the oven and fridge, inside all cabinets and drawers, baseboards, window sills, closet shelves, and the bathroom top to bottom. The point is getting your deposit back, so send me the landlord checklist and I will work off it.",
    "service_type": [
      "cleaning_deep"
    ],
    "price": 260,
    "price_unit": "flat",
    "duration_estimate_minutes": 330,
    "provider_location": "Alberta Arts",
    "latitude": 45.55529,
    "longitude": -122.65027,
    "service_radius_miles": 10,
    "rating": 5.0,
    "review_count": 2,
    "availability": [
      "2026-08-25T15:00:00-07:00",
      "2026-08-29T13:00:00-07:00",
      "2026-09-03T08:00:00-07:00",
      "2026-09-24T08:00:00-07:00",
      "2026-10-03T10:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_004",
    "provider_id": "prv_003",
    "title": "Recurring House Clean, 3BR and Up",
    "listing_description": "Bright Path sends both of us for houses with three or more bedrooms. We do every bathroom, the kitchen including the outside of the appliances, dusting on all the surfaces we can reach, vacuuming, and mopping. Beds get made and linens changed if you leave fresh sets out on them.",
    "service_type": [
      "cleaning_standard"
    ],
    "price": 185,
    "price_unit": "flat",
    "duration_estimate_minutes": 210,
    "provider_location": "Kenton",
    "latitude": 45.58402,
    "longitude": -122.69179,
    "service_radius_miles": 12,
    "rating": 5.0,
    "review_count": 2,
    "availability": [
      "2026-08-27T09:00:00-07:00",
      "2026-08-31T14:00:00-07:00",
      "2026-09-17T10:00:00-07:00",
      "2026-09-25T11:00:00-07:00",
      "2026-10-08T11:00:00-07:00",
      "2026-10-16T14:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_005",
    "provider_id": "prv_003",
    "title": "Post-Renovation Dust-Out",
    "listing_description": "After the contractors leave there is fine drywall dust in absolutely everything. We HEPA vacuum the walls, ceilings, vents, and light fixtures, wipe every horizontal surface twice, scrape paint specks off the windows and floors, and haul out the leftover packaging. Plan on most of a day for an average job.",
    "service_type": [
      "cleaning_deep"
    ],
    "price": 340,
    "price_unit": "flat",
    "duration_estimate_minutes": 420,
    "provider_location": "Kenton",
    "latitude": 45.58649,
    "longitude": -122.6934,
    "service_radius_miles": 12,
    "rating": null,
    "review_count": 0,
    "availability": [
      "2026-08-26T08:00:00-07:00",
      "2026-08-31T10:00:00-07:00",
      "2026-09-19T10:00:00-07:00",
      "2026-09-23T10:00:00-07:00",
      "2026-09-26T16:00:00-07:00",
      "2026-09-29T08:00:00-07:00",
      "2026-10-15T08:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_006",
    "provider_id": "prv_004",
    "title": "Appliance Interior Deep Clean",
    "listing_description": "This is appliance interiors only: oven, fridge and freezer, dishwasher filter, and microwave. I pull the racks and shelves out and soak them, degrease the oven glass so you can see through it again, and wipe down all the door seals. Say the word and I will do the range hood filter at the same time.",
    "service_type": [
      "cleaning_deep"
    ],
    "price": 150,
    "price_unit": "flat",
    "duration_estimate_minutes": 180,
    "provider_location": "Woodstock",
    "latitude": 45.4817,
    "longitude": -122.61153,
    "service_radius_miles": 9,
    "rating": 4.0,
    "review_count": 1,
    "availability": [
      "2026-09-03T13:00:00-07:00",
      "2026-09-07T16:00:00-07:00",
      "2026-09-09T08:00:00-07:00",
      "2026-09-11T09:00:00-07:00",
      "2026-09-18T11:00:00-07:00",
      "2026-09-21T13:00:00-07:00",
      "2026-09-29T16:00:00-07:00",
      "2026-09-30T14:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_007",
    "provider_id": "prv_004",
    "title": "Deep Clean Plus Weekly Upkeep Trial",
    "listing_description": "The first visit is a full deep clean, so baseboards, inside the cabinets, the oven, and the bathroom grout. After that I come back weekly for regular upkeep at the same hourly rate. This is for people who have let things slide and want one reset before starting a schedule. Book at least four hours for the first visit.",
    "service_type": [
      "cleaning_deep",
      "cleaning_standard"
    ],
    "price": 55,
    "price_unit": "hourly",
    "minimum_quantity": 4,
    "duration_estimate_minutes": 240,
    "provider_location": "Woodstock",
    "latitude": 45.47778,
    "longitude": -122.60801,
    "service_radius_miles": 9,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-08-29T15:00:00-07:00",
      "2026-09-21T16:00:00-07:00",
      "2026-09-23T10:00:00-07:00",
      "2026-10-16T10:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_008",
    "provider_id": "prv_010",
    "title": "Small Apartment Tidy & Floors",
    "listing_description": "Quick cleaning for studios and one bedrooms. Surfaces wiped down, bathroom sink and toilet, kitchen counters, then vacuum and mop the floors. Two hour minimum and I supply the cleaning products.",
    "service_type": [
      "cleaning_standard"
    ],
    "price": 40,
    "price_unit": "hourly",
    "minimum_quantity": 2,
    "duration_estimate_minutes": 120,
    "provider_location": "Buckman",
    "latitude": 45.51675,
    "longitude": -122.64943,
    "service_radius_miles": 6,
    "rating": 1.7,
    "review_count": 3,
    "availability": [
      "2026-08-22T14:00:00-07:00",
      "2026-09-05T16:00:00-07:00",
      "2026-09-10T09:00:00-07:00",
      "2026-09-26T10:00:00-07:00",
      "2026-09-29T15:00:00-07:00",
      "2026-09-30T16:00:00-07:00",
      "2026-10-09T09:00:00-07:00",
      "2026-10-09T15:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_009",
    "provider_id": "prv_010",
    "title": "Clean-and-Fix Visit",
    "listing_description": "I clean the place and knock out the small repairs in the same trip. A typical visit is a full kitchen and bathroom clean plus floors, then tightening cabinet hinges, rehanging a curtain rod, patching a few nail holes, and swapping a doorknob that sticks. Send me the repair list when you book so I bring the right hardware.",
    "service_type": [
      "cleaning_standard",
      "handyman_general"
    ],
    "price": 60,
    "price_unit": "hourly",
    "duration_estimate_minutes": 240,
    "provider_location": "Buckman",
    "latitude": 45.51571,
    "longitude": -122.65337,
    "service_radius_miles": 6,
    "rating": 3.0,
    "review_count": 1,
    "availability": [
      "2026-09-21T14:00:00-07:00",
      "2026-09-24T13:00:00-07:00",
      "2026-09-29T08:00:00-07:00",
      "2026-09-29T09:00:00-07:00",
      "2026-09-30T10:00:00-07:00",
      "2026-10-03T10:00:00-07:00",
      "2026-10-08T15:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_010",
    "provider_id": "prv_013",
    "title": "Same-Day Deep Clean, Any Size",
    "listing_description": "Same-day deep cleaning for any home at one flat price, no matter the size. Oven, fridge, baseboards, windows, and the garage are all included. Book before noon and a crew is at your door the same afternoon.",
    "service_type": [
      "cleaning_deep"
    ],
    "price": 99,
    "price_unit": "flat",
    "duration_estimate_minutes": 240,
    "provider_location": "Pearl District",
    "latitude": 45.5302,
    "longitude": -122.6833,
    "service_radius_miles": 25,
    "rating": 1.3,
    "review_count": 3,
    "availability": [
      "2026-09-10T09:00:00-07:00",
      "2026-09-22T11:00:00-07:00",
      "2026-10-03T11:00:00-07:00",
      "2026-10-09T09:00:00-07:00"
    ],
    "listing_status": "suspended"
  },
  {
    "listing_id": "lst_011",
    "provider_id": "prv_002",
    "title": "Furniture Assembly & TV Mounting",
    "listing_description": "I assemble flat-pack furniture, whether it came from IKEA, Wayfair, Article, or somewhere else. Wardrobes, bed frames, dressers, desks, and shelving units include anti-tip anchoring into the studs. I can mount a TV up to 75 inches in the same visit, using the right anchors for plaster or drywall, then break down and stack the furniture cardboard before I leave.",
    "service_type": [
      "handyman_general"
    ],
    "price": 65,
    "price_unit": "hourly",
    "duration_estimate_minutes": 120,
    "provider_location": "Montavilla",
    "latitude": 45.51618,
    "longitude": -122.58431,
    "service_radius_miles": 10,
    "rating": 5.0,
    "review_count": 2,
    "availability": [
      "2026-09-12T08:00:00-07:00",
      "2026-09-15T10:00:00-07:00",
      "2026-09-17T10:00:00-07:00",
      "2026-09-21T14:00:00-07:00",
      "2026-09-29T11:00:00-07:00",
      "2026-10-02T10:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_012",
    "provider_id": "prv_002",
    "title": "TV & Shelf Mounting",
    "listing_description": "Wall mounting for TVs up to 75 inches and for floating shelves. I locate the studs, use the right anchors for plaster or drywall, level everything twice, and tuck the cables into a cord channel if you have one. Bring your own mount or I can pick one up on the way.",
    "service_type": [
      "handyman_general"
    ],
    "price": 95,
    "price_unit": "flat",
    "duration_estimate_minutes": 90,
    "provider_location": "Montavilla",
    "latitude": 45.52039,
    "longitude": -122.58262,
    "service_radius_miles": 10,
    "rating": 4.0,
    "review_count": 1,
    "availability": [
      "2026-08-21T16:00:00-07:00",
      "2026-09-03T08:00:00-07:00",
      "2026-09-10T16:00:00-07:00",
      "2026-09-22T09:00:00-07:00",
      "2026-09-23T08:00:00-07:00",
      "2026-10-05T15:00:00-07:00",
      "2026-10-08T13:00:00-07:00",
      "2026-10-10T16:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_013",
    "provider_id": "prv_002",
    "title": "Ceiling Fan Swap & Bracket Fix",
    "listing_description": "Replacing an existing ceiling fan or a light fixture with a new fan. I kill the circuit at the panel, take down the old unit, check whether the box is fan-rated and swap in a brace if it is not, then wire and balance the new fan. I also fix wobble and rattle on fans that are already up.",
    "service_type": [
      "handyman_general",
      "electrical"
    ],
    "price": 175,
    "price_unit": "flat",
    "duration_estimate_minutes": 150,
    "provider_location": "Montavilla",
    "latitude": 45.52103,
    "longitude": -122.58028,
    "service_radius_miles": 10,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-09-09T08:00:00-07:00",
      "2026-09-28T13:00:00-07:00",
      "2026-09-30T13:00:00-07:00",
      "2026-10-03T13:00:00-07:00",
      "2026-10-14T09:00:00-07:00",
      "2026-10-14T15:00:00-07:00",
      "2026-10-16T13:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_014",
    "provider_id": "prv_012",
    "title": "Door, Lock & Hinge Repairs",
    "listing_description": "Doors that stick, sag, or will not latch. I plane and rehang them, shim hinges, replace strike plates, repair split jambs, and install new deadbolts and knobs. Closet bifolds and sliding door tracks are fair game too.",
    "service_type": [
      "handyman_general"
    ],
    "price": 70,
    "price_unit": "hourly",
    "duration_estimate_minutes": 120,
    "provider_location": "Irvington",
    "latitude": 45.54524,
    "longitude": -122.6474,
    "service_radius_miles": 9,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-09-01T14:00:00-07:00",
      "2026-09-02T11:00:00-07:00",
      "2026-09-16T09:00:00-07:00",
      "2026-09-29T09:00:00-07:00",
      "2026-09-29T15:00:00-07:00",
      "2026-10-08T13:00:00-07:00",
      "2026-10-12T13:00:00-07:00",
      "2026-10-16T11:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_015",
    "provider_id": "prv_012",
    "title": "Outlet & Switch Replacement",
    "listing_description": "Swapping out worn outlets and switches, including GFCI outlets for kitchens and bathrooms and dimmers in living rooms. The flat price covers up to six devices in one visit. I test each one afterward and label anything that is not wired the way it should be.",
    "service_type": [
      "electrical"
    ],
    "price": 130,
    "price_unit": "flat",
    "duration_estimate_minutes": 120,
    "provider_location": "Irvington",
    "latitude": 45.54841,
    "longitude": -122.6469,
    "service_radius_miles": 9,
    "rating": 4.5,
    "review_count": 2,
    "availability": [
      "2026-09-08T13:00:00-07:00",
      "2026-09-09T14:00:00-07:00",
      "2026-09-23T14:00:00-07:00",
      "2026-09-30T14:00:00-07:00",
      "2026-10-05T16:00:00-07:00",
      "2026-10-16T15:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_016",
    "provider_id": "prv_012",
    "title": "Light Fixture Install, Up to Three",
    "listing_description": "Install up to three light fixtures in one visit, whether that is pendants, flush mounts, a vanity bar, or a dining room chandelier under forty pounds. I take down the old fixture, check the box and wiring, mount the new one, and haul the old one away. A loose or worn switch controlling those fixtures can be tightened or replaced during the same appointment.",
    "service_type": [
      "electrical"
    ],
    "price": 210,
    "price_unit": "flat",
    "duration_estimate_minutes": 180,
    "provider_location": "Irvington",
    "latitude": 45.54834,
    "longitude": -122.65196,
    "service_radius_miles": 9,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-08-29T14:00:00-07:00",
      "2026-09-01T08:00:00-07:00",
      "2026-09-01T16:00:00-07:00",
      "2026-09-09T13:00:00-07:00",
      "2026-09-15T13:00:00-07:00",
      "2026-09-16T13:00:00-07:00",
      "2026-09-17T08:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_017",
    "provider_id": "prv_006",
    "title": "Panel-Adjacent Small Jobs & GFCI",
    "listing_description": "Hourly electrical work for the jobs that are too small for a full contractor. Adding a GFCI, tracing a dead circuit, replacing a breaker that keeps tripping, labeling a panel nobody ever labeled, and running a dedicated line for a window AC. I pull the permit when the job needs one.",
    "service_type": [
      "electrical"
    ],
    "price": 95,
    "price_unit": "hourly",
    "duration_estimate_minutes": 120,
    "provider_location": "Laurelhurst",
    "latitude": 45.53147,
    "longitude": -122.62528,
    "service_radius_miles": 11,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-09-04T15:00:00-07:00",
      "2026-09-21T08:00:00-07:00",
      "2026-09-25T10:00:00-07:00",
      "2026-10-07T11:00:00-07:00",
      "2026-10-10T13:00:00-07:00",
      "2026-10-12T15:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_018",
    "provider_id": "prv_006",
    "title": "Recessed Lighting Retrofit",
    "listing_description": "Retrofitting a room to LED recessed cans, usually six lights in a living room or kitchen. That covers cutting the openings, running cable through the attic where I can reach, patching and sanding the drywall around each can, and wiring a dimmer at the switch. Paused until my apprentice is back from leave.",
    "service_type": [
      "electrical",
      "handyman_general"
    ],
    "price": 400,
    "price_unit": "flat",
    "duration_estimate_minutes": 480,
    "provider_location": "Laurelhurst",
    "latitude": 45.52976,
    "longitude": -122.62619,
    "service_radius_miles": 11,
    "rating": 4.0,
    "review_count": 1,
    "availability": [
      "2026-09-17T08:00:00-07:00",
      "2026-09-23T09:00:00-07:00",
      "2026-09-24T15:00:00-07:00",
      "2026-09-29T14:00:00-07:00"
    ],
    "listing_status": "paused"
  },
  {
    "listing_id": "lst_019",
    "provider_id": "prv_005",
    "title": "Faucet Replacement, Kitchen or Bath",
    "listing_description": "Removing your old faucet and installing the one you bought. That includes new supply lines and replacing the shutoff valve if the old one is seized, plus resealing the deck with silicone. I run it for ten minutes afterward and check under the sink for any weeping.",
    "service_type": [
      "plumbing"
    ],
    "price": 165,
    "price_unit": "flat",
    "duration_estimate_minutes": 120,
    "provider_location": "Sellwood",
    "latitude": 45.46799,
    "longitude": -122.65931,
    "service_radius_miles": 10,
    "rating": 4.5,
    "review_count": 2,
    "availability": [
      "2026-09-01T09:00:00-07:00",
      "2026-09-01T10:00:00-07:00",
      "2026-09-04T14:00:00-07:00",
      "2026-09-11T14:00:00-07:00",
      "2026-09-11T15:00:00-07:00",
      "2026-09-17T10:00:00-07:00",
      "2026-09-18T11:00:00-07:00",
      "2026-10-02T08:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_020",
    "provider_id": "prv_005",
    "title": "Drain Clearing, Sink or Tub",
    "listing_description": "Slow or stopped drains in a kitchen sink, bathroom sink, or tub, including a P-trap or tailpiece that is leaking at the same time. I pull and clean the trap, replace a failed washer or short trap section when needed, snake the line out to the branch, and clear hair and grease clogs. If the camera shows a root intrusion or a broken line further out I will tell you straight and not charge for the visit.",
    "service_type": [
      "plumbing"
    ],
    "price": 140,
    "price_unit": "flat",
    "duration_estimate_minutes": 90,
    "provider_location": "Sellwood",
    "latitude": 45.46239,
    "longitude": -122.66072,
    "service_radius_miles": 10,
    "rating": null,
    "review_count": 0,
    "availability": [
      "2026-09-04T10:00:00-07:00",
      "2026-09-07T09:00:00-07:00",
      "2026-09-09T15:00:00-07:00",
      "2026-09-17T16:00:00-07:00",
      "2026-09-23T08:00:00-07:00",
      "2026-10-12T14:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_021",
    "provider_id": "prv_005",
    "title": "Under-Sink Leak Repair & Cabinet Patch",
    "listing_description": "Under-sink leaks where the cabinet floor has already taken damage. We replace the failed trap, tailpiece, or supply line, then cut out the swollen particle board, fit a new sealed cabinet base, and caulk the edges so the next leak does not soak straight through.",
    "service_type": [
      "plumbing",
      "handyman_general"
    ],
    "price": 220,
    "price_unit": "flat",
    "duration_estimate_minutes": 210,
    "provider_location": "Sellwood",
    "latitude": 45.46536,
    "longitude": -122.6536,
    "service_radius_miles": 10,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-08-26T11:00:00-07:00",
      "2026-09-04T13:00:00-07:00",
      "2026-09-21T16:00:00-07:00",
      "2026-09-28T10:00:00-07:00",
      "2026-10-15T10:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_022",
    "provider_id": "prv_014",
    "title": "Toilet Repair or Replacement",
    "listing_description": "Running, rocking, or leaking toilets. I rebuild the fill and flush valves, replace the wax ring and closet bolts, shim and re-level the base, and re-caulk around the foot. A full replacement with a toilet you supply is the same flat rate and I take the old one away with me.",
    "service_type": [
      "plumbing"
    ],
    "price": 195,
    "price_unit": "flat",
    "duration_estimate_minutes": 150,
    "provider_location": "Northwest District",
    "latitude": 45.53313,
    "longitude": -122.70137,
    "service_radius_miles": 8,
    "rating": 4.0,
    "review_count": 2,
    "availability": [
      "2026-08-24T08:00:00-07:00",
      "2026-09-30T15:00:00-07:00",
      "2026-10-16T13:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_023",
    "provider_id": "prv_014",
    "title": "Emergency Leak Callout",
    "listing_description": "Hourly emergency callout for active leaks: burst supply lines, a water heater dripping, a shutoff valve that failed. I get the water shut down first, then make the repair the same visit wherever the parts allow.",
    "service_type": [
      "plumbing"
    ],
    "price": 130,
    "price_unit": "hourly",
    "duration_estimate_minutes": 120,
    "provider_location": "Northwest District",
    "latitude": 45.52925,
    "longitude": -122.70099,
    "service_radius_miles": 8,
    "rating": 2.5,
    "review_count": 2,
    "availability": [
      "2026-08-28T16:00:00-07:00",
      "2026-09-02T09:00:00-07:00",
      "2026-09-04T13:00:00-07:00",
      "2026-09-08T11:00:00-07:00",
      "2026-09-12T08:00:00-07:00",
      "2026-09-16T10:00:00-07:00",
      "2026-10-10T10:00:00-07:00",
      "2026-10-13T11:00:00-07:00"
    ],
    "listing_status": "suspended"
  },
  {
    "listing_id": "lst_024",
    "provider_id": "prv_007",
    "title": "Two Movers, Loading & Unloading",
    "listing_description": "Two of us with dollies, straps, and moving blankets, loading or unloading your truck or pod. We handle stairs and awkward corners, wrap anything with a finish on it, and stack the truck so nothing shifts on the drive. You provide the vehicle and we provide the muscle.",
    "service_type": [
      "moving_help"
    ],
    "price": 110,
    "price_unit": "hourly",
    "duration_estimate_minutes": 180,
    "provider_location": "St. Johns",
    "latitude": 45.58632,
    "longitude": -122.75728,
    "service_radius_miles": 15,
    "rating": 5.0,
    "review_count": 2,
    "availability": [
      "2026-09-12T16:00:00-07:00",
      "2026-09-21T14:00:00-07:00",
      "2026-09-26T11:00:00-07:00",
      "2026-10-06T10:00:00-07:00",
      "2026-10-12T09:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_025",
    "provider_id": "prv_007",
    "title": "In-Building Apartment Move",
    "listing_description": "Moving from one unit to another in the same building or complex, with no truck involved. We book the elevator with your building manager, pad the walls, carry everything across, and set the furniture down where you actually want it. The flat rate covers a two bedroom.",
    "service_type": [
      "moving_help"
    ],
    "price": 300,
    "price_unit": "flat",
    "duration_estimate_minutes": 300,
    "provider_location": "St. Johns",
    "latitude": 45.5915,
    "longitude": -122.75111,
    "service_radius_miles": 15,
    "rating": 4.0,
    "review_count": 1,
    "availability": [
      "2026-09-08T15:00:00-07:00",
      "2026-09-12T13:00:00-07:00",
      "2026-09-22T16:00:00-07:00",
      "2026-09-26T16:00:00-07:00",
      "2026-09-28T16:00:00-07:00",
      "2026-10-09T10:00:00-07:00",
      "2026-10-09T14:00:00-07:00",
      "2026-10-09T16:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_026",
    "provider_id": "prv_011",
    "title": "Single-Item Furniture Haul",
    "listing_description": "One piece of furniture from A to B, whether that is a couch off Marketplace, a piano bench, or a dresser from your parents' place. I have a cargo van, blankets, and straps. The price covers pickup and delivery inside the city with up to two flights of stairs.",
    "service_type": [
      "moving_help"
    ],
    "price": 85,
    "price_unit": "flat",
    "duration_estimate_minutes": 90,
    "provider_location": "Hawthorne",
    "latitude": 45.50963,
    "longitude": -122.62192,
    "service_radius_miles": 14,
    "rating": null,
    "review_count": 0,
    "availability": [
      "2026-09-12T14:00:00-07:00",
      "2026-09-19T08:00:00-07:00",
      "2026-09-25T13:00:00-07:00",
      "2026-09-25T14:00:00-07:00",
      "2026-10-06T08:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_027",
    "provider_id": "prv_011",
    "title": "Garage Clear-Out Plus Moving Boxes",
    "listing_description": "I clear out the garage and move whatever you are keeping. We sort into keep, donate, and dump piles, I haul the dump and donation loads away, and the keep pile gets boxed and moved wherever it belongs, whether that is a storage unit, the basement, or a new place. The two-hour minimum includes ordinary donation and dump charges, so there is no separate disposal fee.",
    "service_type": [
      "junk_removal",
      "moving_help"
    ],
    "price": 100,
    "price_unit": "hourly",
    "minimum_quantity": 2,
    "duration_estimate_minutes": 240,
    "provider_location": "Hawthorne",
    "latitude": 45.51091,
    "longitude": -122.62722,
    "service_radius_miles": 14,
    "rating": 4.0,
    "review_count": 2,
    "availability": [
      "2026-09-01T08:00:00-07:00",
      "2026-09-03T15:00:00-07:00",
      "2026-09-05T11:00:00-07:00",
      "2026-09-10T09:00:00-07:00",
      "2026-09-16T11:00:00-07:00",
      "2026-09-22T15:00:00-07:00",
      "2026-09-28T09:00:00-07:00",
      "2026-10-03T08:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_028",
    "provider_id": "prv_008",
    "title": "Basement & Attic Clearout",
    "listing_description": "Full clearouts of basements, attics, and crawlspaces. Old furniture, boxes of paperwork, broken appliances, rolled carpet, and construction leftovers all go. We carry it out ourselves, sweep the space down afterward, and take recyclables and e-waste to the right facility instead of the landfill.",
    "service_type": [
      "junk_removal"
    ],
    "price": 275,
    "price_unit": "flat",
    "duration_estimate_minutes": 300,
    "provider_location": "Lents",
    "latitude": 45.49095,
    "longitude": -122.56732,
    "service_radius_miles": 13,
    "rating": 4.5,
    "review_count": 2,
    "availability": [
      "2026-09-04T09:00:00-07:00",
      "2026-09-05T10:00:00-07:00",
      "2026-09-11T14:00:00-07:00",
      "2026-09-15T08:00:00-07:00",
      "2026-09-16T14:00:00-07:00",
      "2026-09-26T09:00:00-07:00",
      "2026-10-10T16:00:00-07:00",
      "2026-10-16T11:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_029",
    "provider_id": "prv_008",
    "title": "Curbside Furniture Pickup",
    "listing_description": "You put it at the curb or in the driveway and I pick it up. One couch, a mattress set, an appliance, or up to about eight boxes. I never enter the house, which is why this one is cheap. Mattress and appliance disposal fees are already in the price.",
    "service_type": [
      "junk_removal"
    ],
    "price": 75,
    "price_unit": "flat",
    "duration_estimate_minutes": 45,
    "provider_location": "Lents",
    "latitude": 45.48513,
    "longitude": -122.56765,
    "service_radius_miles": 13,
    "rating": null,
    "review_count": 0,
    "availability": [
      "2026-09-11T09:00:00-07:00",
      "2026-09-15T09:00:00-07:00",
      "2026-09-22T08:00:00-07:00",
      "2026-09-23T14:00:00-07:00",
      "2026-10-05T08:00:00-07:00",
      "2026-10-07T10:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_030",
    "provider_id": "prv_008",
    "title": "Small Repairs Plus Haul-Away",
    "listing_description": "This is the usual combination for landlords between tenants. We patch and touch up the nail holes, fix the cabinet doors and towel bars, swap out broken blinds, then haul away the furniture and trash the last tenant left behind. Billed hourly with the dump run counted in the hours.",
    "service_type": [
      "handyman_general",
      "junk_removal"
    ],
    "price": 80,
    "price_unit": "hourly",
    "duration_estimate_minutes": 300,
    "provider_location": "Lents",
    "latitude": 45.48797,
    "longitude": -122.57169,
    "service_radius_miles": 13,
    "rating": 4.0,
    "review_count": 1,
    "availability": [
      "2026-09-05T09:00:00-07:00",
      "2026-09-14T11:00:00-07:00",
      "2026-09-15T14:00:00-07:00",
      "2026-10-15T09:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_031",
    "provider_id": "prv_015",
    "title": "Yard Debris & Junk Run",
    "listing_description": "One trip for everything piled up outside: branches, bagged leaves, an old grill, cracked planters, a stack of rotted deck boards. I load it all, sweep the area, and split the load between yard debris and landfill so you are not paying dump rates on compost.",
    "service_type": [
      "yard_outdoor",
      "junk_removal"
    ],
    "price": 160,
    "price_unit": "flat",
    "duration_estimate_minutes": 150,
    "provider_location": "Division-Clinton",
    "latitude": 45.50239,
    "longitude": -122.63515,
    "service_radius_miles": 12,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-09-19T11:00:00-07:00",
      "2026-09-22T10:00:00-07:00",
      "2026-09-29T08:00:00-07:00",
      "2026-10-05T13:00:00-07:00",
      "2026-10-16T13:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_032",
    "provider_id": "prv_015",
    "title": "Leaf Clearing & Gutter Clean",
    "listing_description": "Leaves off the lawn, out of the beds, and out of the gutters. I hand-scoop the gutters, flush the downspouts, bag or haul the leaves away, and blow off the driveway and walkways at the end. Two-story houses are fine, I carry my own ladder.",
    "service_type": [
      "yard_outdoor"
    ],
    "price": 145,
    "price_unit": "flat",
    "duration_estimate_minutes": 180,
    "provider_location": "Division-Clinton",
    "latitude": 45.5036,
    "longitude": -122.63348,
    "service_radius_miles": 12,
    "rating": 4.0,
    "review_count": 1,
    "availability": [
      "2026-09-03T16:00:00-07:00",
      "2026-09-17T11:00:00-07:00",
      "2026-09-24T09:00:00-07:00",
      "2026-10-03T10:00:00-07:00",
      "2026-10-08T15:00:00-07:00",
      "2026-10-16T08:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_033",
    "provider_id": "prv_009",
    "title": "Lawn Mow & Edge, Standard Lot",
    "listing_description": "Mow, string trim, and edge along the sidewalk and driveway on a standard city lot. Clippings get bagged and taken with me or left in your yard debris bin, whichever you prefer. If the grass gets ahead of you I will come back the same week.",
    "service_type": [
      "yard_outdoor"
    ],
    "price": 60,
    "price_unit": "flat",
    "duration_estimate_minutes": 60,
    "provider_location": "Multnomah Village",
    "latitude": 45.46627,
    "longitude": -122.71198,
    "service_radius_miles": 10,
    "rating": 5.0,
    "review_count": 2,
    "availability": [
      "2026-09-08T15:00:00-07:00",
      "2026-09-09T13:00:00-07:00",
      "2026-09-15T13:00:00-07:00",
      "2026-09-23T13:00:00-07:00",
      "2026-09-26T10:00:00-07:00",
      "2026-10-06T10:00:00-07:00",
      "2026-10-14T08:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_034",
    "provider_id": "prv_009",
    "title": "Patio & Deck Pressure Wash",
    "listing_description": "Pressure washing concrete patios, pavers, and wood decks. I pre-treat the moss and algae, wash at a pressure the wood can actually take, and rinse the siding and windows afterward so you do not end up with a dirt line. Deck sealing later in the week can be added on.",
    "service_type": [
      "yard_outdoor"
    ],
    "price": 190,
    "price_unit": "flat",
    "duration_estimate_minutes": 210,
    "provider_location": "Multnomah Village",
    "latitude": 45.47114,
    "longitude": -122.7185,
    "service_radius_miles": 10,
    "rating": null,
    "review_count": 0,
    "availability": [
      "2026-09-04T09:00:00-07:00",
      "2026-09-09T11:00:00-07:00",
      "2026-09-14T08:00:00-07:00",
      "2026-09-26T09:00:00-07:00",
      "2026-10-16T09:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_035",
    "provider_id": "prv_009",
    "title": "Fall Cleanup With Debris Haul",
    "listing_description": "An end-of-season yard reset: cut back the perennials, pull the spent annuals, rake and remove the leaves, clear the gutters, and cut the lawn one last time. Everything we pull leaves in the truck with us, including old pots or broken garden furniture you point at. Paused until October.",
    "service_type": [
      "yard_outdoor",
      "junk_removal"
    ],
    "price": 230,
    "price_unit": "flat",
    "duration_estimate_minutes": 300,
    "provider_location": "Multnomah Village",
    "latitude": 45.47193,
    "longitude": -122.71368,
    "service_radius_miles": 10,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-08-22T08:00:00-07:00",
      "2026-08-27T14:00:00-07:00",
      "2026-09-12T14:00:00-07:00",
      "2026-09-28T16:00:00-07:00",
      "2026-09-29T15:00:00-07:00",
      "2026-10-01T11:00:00-07:00",
      "2026-10-15T08:00:00-07:00",
      "2026-10-15T09:00:00-07:00"
    ],
    "listing_status": "paused"
  },
  {
    "listing_id": "lst_036",
    "provider_id": "prv_013",
    "title": "Handyman Hourly, No Job Too Small",
    "listing_description": "QuickFix handles anything on your list by the hour. Mounting, patching, assembly, minor plumbing and electrical, and paint touch-ups. Crews available seven days a week across the whole metro area.",
    "service_type": [
      "handyman_general"
    ],
    "price": 55,
    "price_unit": "hourly",
    "duration_estimate_minutes": 120,
    "provider_location": "Pearl District",
    "latitude": 45.5244,
    "longitude": -122.67922,
    "service_radius_miles": 25,
    "rating": 1.7,
    "review_count": 3,
    "availability": [
      "2026-08-28T16:00:00-07:00",
      "2026-10-01T14:00:00-07:00",
      "2026-10-02T09:00:00-07:00",
      "2026-10-02T11:00:00-07:00"
    ],
    "listing_status": "suspended"
  },
  {
    "listing_id": "lst_037",
    "provider_id": "prv_010",
    "title": "Weekend Moving Help",
    "listing_description": "Saturday and Sunday moving help: loading a truck, unloading at the new place, or shifting heavy things around inside. I bring straps and a hand truck. Still working out how many weekends I can commit to before I publish this.",
    "service_type": [
      "moving_help"
    ],
    "price": 90,
    "price_unit": "hourly",
    "duration_estimate_minutes": 180,
    "provider_location": "Buckman",
    "latitude": 45.52195,
    "longitude": -122.65347,
    "service_radius_miles": 6,
    "rating": null,
    "review_count": 0,
    "availability": [
      "2026-09-03T16:00:00-07:00",
      "2026-09-09T11:00:00-07:00",
      "2026-09-14T16:00:00-07:00",
      "2026-10-06T10:00:00-07:00",
      "2026-10-08T13:00:00-07:00",
      "2026-10-08T15:00:00-07:00"
    ],
    "listing_status": "draft"
  },
  {
    "listing_id": "lst_038",
    "provider_id": "prv_001",
    "title": "Office Cleaning, After Hours",
    "listing_description": "After-hours cleaning for small offices and studios under two thousand square feet. Desks and conference tables wiped, kitchenette and bathrooms cleaned, floors vacuumed and mopped, bins emptied. I no longer take commercial work and this is kept up only for reference.",
    "service_type": [
      "cleaning_standard"
    ],
    "price": 50,
    "price_unit": "hourly",
    "duration_estimate_minutes": 180,
    "provider_location": "Alberta Arts",
    "latitude": 45.55941,
    "longitude": -122.64995,
    "service_radius_miles": 8,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-09-02T15:00:00-07:00",
      "2026-09-08T08:00:00-07:00",
      "2026-09-15T13:00:00-07:00",
      "2026-09-17T08:00:00-07:00",
      "2026-09-26T09:00:00-07:00",
      "2026-10-14T11:00:00-07:00"
    ],
    "listing_status": "archived"
  },
  {
    "listing_id": "lst_039",
    "provider_id": "prv_004",
    "title": "Move-Out Clean With Load-Out Help",
    "listing_description": "Two things in one appointment on moving day. First the last boxes and furniture get carried out to your truck, then I do a full move-out deep clean on the empty unit. Oven, fridge, inside the cabinets, baseboards, and the bathroom are all done to the standard a landlord checklist asks for.",
    "service_type": [
      "cleaning_deep",
      "moving_help"
    ],
    "price": 380,
    "price_unit": "flat",
    "duration_estimate_minutes": 420,
    "provider_location": "Woodstock",
    "latitude": 45.4788,
    "longitude": -122.61231,
    "service_radius_miles": 9,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-09-15T15:00:00-07:00",
      "2026-09-17T14:00:00-07:00",
      "2026-09-18T14:00:00-07:00",
      "2026-09-26T13:00:00-07:00",
      "2026-10-06T09:00:00-07:00",
      "2026-10-16T15:00:00-07:00"
    ],
    "listing_status": "active"
  },
  {
    "listing_id": "lst_040",
    "provider_id": "prv_011",
    "title": "Storage Unit Clear & Transport",
    "listing_description": "Emptying a storage unit and getting the contents where they need to go. We sort on the spot, run the junk to the transfer station, and deliver the rest to your house or to another unit. Hourly with a two hour minimum. Paused while the van is in the shop.",
    "service_type": [
      "moving_help",
      "junk_removal"
    ],
    "price": 105,
    "price_unit": "hourly",
    "minimum_quantity": 2,
    "duration_estimate_minutes": 180,
    "provider_location": "Hawthorne",
    "latitude": 45.51294,
    "longitude": -122.6263,
    "service_radius_miles": 14,
    "rating": 5.0,
    "review_count": 1,
    "availability": [
      "2026-08-21T15:00:00-07:00",
      "2026-09-04T11:00:00-07:00",
      "2026-09-18T10:00:00-07:00",
      "2026-10-05T10:00:00-07:00",
      "2026-10-07T15:00:00-07:00"
    ],
    "listing_status": "paused"
  }
];

var DB_PROVIDERS = [
  {
    "provider_id": "prv_001",
    "name": "Marisol Vega",
    "bio": "I have cleaned homes in Northeast Portland for six years and I work alone, so you get the same person every visit. I am picky about kitchens and bathrooms and I will tell you if something needs more time than we booked.",
    "rating": 4.8,
    "review_count": 6,
    "location": "Alberta Arts",
    "latitude": 45.55891,
    "longitude": -122.64671,
    "member_since": "2023-09-14",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_002",
    "name": "Dan Okonkwo",
    "bio": "I am a former cabinet shop guy who now does small home repairs full time. Assembly, mounting, doors, and the odd fan swap are my bread and butter.",
    "rating": 4.8,
    "review_count": 4,
    "location": "Montavilla",
    "latitude": 45.51896,
    "longitude": -122.58447,
    "member_since": "2024-02-03",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_003",
    "name": "Bright Path Cleaning Co.",
    "bio": "We are a two-person cleaning team, my sister and me, covering North Portland houses. We bring our own supplies and we do not rush the bathrooms.",
    "rating": 5.0,
    "review_count": 2,
    "location": "Kenton",
    "latitude": 45.58528,
    "longitude": -122.68841,
    "member_since": "2023-11-21",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_004",
    "name": "Teodora Ilic",
    "bio": "I specialize in deep cleans and move-outs. I used to manage turnovers for a property company, so I know exactly what a landlord checklist asks for.",
    "rating": 4.7,
    "review_count": 3,
    "location": "Woodstock",
    "latitude": 45.478,
    "longitude": -122.61376,
    "member_since": "2024-05-09",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_005",
    "name": "Hollis & Sons Plumbing",
    "bio": "Licensed plumber, second generation, working the inner southeast. I take the small residential jobs that bigger shops will not schedule.",
    "rating": 4.7,
    "review_count": 3,
    "location": "Sellwood",
    "latitude": 45.46092,
    "longitude": -122.65466,
    "member_since": "2023-08-28",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_006",
    "name": "Ray Delacroix",
    "bio": "Licensed electrician doing residential service calls. I like the small stuff other people skip, and I will always tell you when a job needs a permit.",
    "rating": 4.5,
    "review_count": 2,
    "location": "Laurelhurst",
    "latitude": 45.52939,
    "longitude": -122.6268,
    "member_since": "2024-08-16",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_007",
    "name": "Tuck Moving Crew",
    "bio": "Two of us, a lot of moving blankets, and no truck. You rent the vehicle and we do the loading, the stairs, and the tricky corners.",
    "rating": 4.7,
    "review_count": 3,
    "location": "St. Johns",
    "latitude": 45.59249,
    "longitude": -122.75884,
    "member_since": "2024-01-12",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_008",
    "name": "Priya Raman",
    "bio": "I run a small junk hauling outfit and I sort every load. Anything that can be donated or recycled goes there first and I keep the receipts for you.",
    "rating": 4.3,
    "review_count": 3,
    "location": "Lents",
    "latitude": 45.49052,
    "longitude": -122.56486,
    "member_since": "2024-06-27",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_009",
    "name": "Grady Fenwick",
    "bio": "I do yard work around Southwest Portland, mostly mowing, leaves, and gutters. I have been at it since I retired from the parks bureau.",
    "rating": 5.0,
    "review_count": 3,
    "location": "Multnomah Village",
    "latitude": 45.46623,
    "longitude": -122.71565,
    "member_since": "2025-03-05",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_010",
    "name": "Nell Sandoval",
    "bio": "I clean and I fix things, usually in the same visit. Give me your list and I will work down it until the time is up.",
    "rating": 2.0,
    "review_count": 4,
    "location": "Buckman",
    "latitude": 45.51557,
    "longitude": -122.65595,
    "member_since": "2025-01-30",
    "provider_status": "warned"
  },
  {
    "provider_id": "prv_011",
    "name": "Ivo Petrov",
    "bio": "I have a cargo van and a strong back. Single-item hauls, garage clear-outs, and storage unit runs are what I do most weeks.",
    "rating": 4.3,
    "review_count": 3,
    "location": "Hawthorne",
    "latitude": 45.51445,
    "longitude": -122.62656,
    "member_since": "2024-10-08",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_012",
    "name": "Beatrix Lund",
    "bio": "I trained as an electrician and picked up general repair work along the way. Fixtures, outlets, doors, and locks are my usual calls.",
    "rating": 4.8,
    "review_count": 4,
    "location": "Irvington",
    "latitude": 45.54532,
    "longitude": -122.64964,
    "member_since": "2024-04-18",
    "provider_status": "active"
  },
  {
    "provider_id": "prv_013",
    "name": "QuickFix Home Services",
    "bio": "We are a fast-growing home services crew covering the whole metro. Same-day availability, flat pricing, anything you need.",
    "rating": 1.5,
    "review_count": 6,
    "location": "Pearl District",
    "latitude": 45.52916,
    "longitude": -122.67844,
    "member_since": "2025-06-11",
    "provider_status": "suspended"
  },
  {
    "provider_id": "prv_014",
    "name": "Amara Oyelaran",
    "bio": "Plumbing repairs and replacements in Northwest Portland. Toilets, faucets, and leaks are most of my week.",
    "rating": 3.2,
    "review_count": 4,
    "location": "Northwest District",
    "latitude": 45.53001,
    "longitude": -122.6988,
    "member_since": "2024-07-22",
    "provider_status": "warned"
  },
  {
    "provider_id": "prv_015",
    "name": "Sam Rutkowski",
    "bio": "I combine yard cleanup with hauling so you only pay for one trip. Branches, leaves, old grills, whatever is piled up out back.",
    "rating": 4.5,
    "review_count": 2,
    "location": "Division-Clinton",
    "latitude": 45.50591,
    "longitude": -122.63231,
    "member_since": "2025-05-02",
    "provider_status": "active"
  }
];

var DB_SERVICE_TYPES = [
  {
    "code": "cleaning_standard",
    "label": "Home Cleaning",
    "description": "Regular apartment and house cleaning: kitchens, bathrooms, dusting, floors."
  },
  {
    "code": "cleaning_deep",
    "label": "Deep Cleaning",
    "description": "Move-in and move-out cleans, post-renovation dust-out, appliance interiors."
  },
  {
    "code": "handyman_general",
    "label": "Handyman",
    "description": "Furniture assembly, wall mounting, drywall patching, doors and locks."
  },
  {
    "code": "plumbing",
    "label": "Plumbing",
    "description": "Faucets, drains, leaks, toilets, and under-sink work."
  },
  {
    "code": "electrical",
    "label": "Electrical",
    "description": "Outlets, switches, light fixtures, and ceiling fans."
  },
  {
    "code": "moving_help",
    "label": "Moving Help",
    "description": "Loading, unloading, in-building moves, and furniture hauling."
  },
  {
    "code": "junk_removal",
    "label": "Junk Removal",
    "description": "Furniture, boxes, and garage or basement clearouts."
  },
  {
    "code": "yard_outdoor",
    "label": "Yard & Outdoor",
    "description": "Lawn care, leaves, gutters, and patio or deck cleanup."
  }
];

var DB_CUSTOMERS = [
  {
    "customer_id": "cst_001",
    "name": "Hannah Breece",
    "neighborhood": "Alberta Arts",
    "latitude": 45.55794,
    "longitude": -122.64491,
    "signup_date": "2024-03-11"
  },
  {
    "customer_id": "cst_002",
    "name": "Terrence Wolfe",
    "neighborhood": "Sellwood",
    "latitude": 45.4636,
    "longitude": -122.65431,
    "signup_date": "2024-06-02"
  },
  {
    "customer_id": "cst_003",
    "name": "Junie Park",
    "neighborhood": "Kenton",
    "latitude": 45.58651,
    "longitude": -122.69329,
    "signup_date": "2024-09-19"
  },
  {
    "customer_id": "cst_004",
    "name": "Malik Ferreira",
    "neighborhood": "Hawthorne",
    "latitude": 45.50981,
    "longitude": -122.62889,
    "signup_date": "2025-01-08"
  },
  {
    "customer_id": "cst_005",
    "name": "Delia Nakamura",
    "neighborhood": "Woodstock",
    "latitude": 45.48178,
    "longitude": -122.60837,
    "signup_date": "2025-02-24"
  },
  {
    "customer_id": "cst_006",
    "name": "Owen Straub",
    "neighborhood": "Buckman",
    "latitude": 45.5184,
    "longitude": -122.6495,
    "signup_date": "2025-04-15"
  },
  {
    "customer_id": "cst_007",
    "name": "Rosalind Achterberg",
    "neighborhood": "Montavilla",
    "latitude": 45.51973,
    "longitude": -122.58084,
    "signup_date": "2025-05-30"
  },
  {
    "customer_id": "cst_008",
    "name": "Felix Amadi",
    "neighborhood": "Lents",
    "latitude": 45.48849,
    "longitude": -122.56927,
    "signup_date": "2025-07-13"
  },
  {
    "customer_id": "cst_009",
    "name": "Camille Duarte",
    "neighborhood": "Laurelhurst",
    "latitude": 45.528,
    "longitude": -122.62224,
    "signup_date": "2025-09-06"
  },
  {
    "customer_id": "cst_010",
    "name": "Bo Whitaker",
    "neighborhood": "Multnomah Village",
    "latitude": 45.4653,
    "longitude": -122.7157,
    "signup_date": "2025-11-17"
  },
  {
    "customer_id": "cst_011",
    "name": "Ingrid Solheim",
    "neighborhood": "Irvington",
    "latitude": 45.549,
    "longitude": -122.64806,
    "signup_date": "2026-01-26"
  },
  {
    "customer_id": "cst_012",
    "name": "Desta Fikru",
    "neighborhood": "St. Johns",
    "latitude": 45.58696,
    "longitude": -122.7529,
    "signup_date": "2026-04-04"
  },
  {
    "customer_id": "cst_013",
    "name": "Marguerite Ely",
    "neighborhood": "Kenton",
    "latitude": 45.58269,
    "longitude": -122.69359,
    "signup_date": "2024-05-21"
  },
  {
    "customer_id": "cst_014",
    "name": "Tobias Renn",
    "neighborhood": "Montavilla",
    "latitude": 45.51517,
    "longitude": -122.58251,
    "signup_date": "2024-08-14"
  },
  {
    "customer_id": "cst_015",
    "name": "Perpetua Nwosu",
    "neighborhood": "Pearl District",
    "latitude": 45.52634,
    "longitude": -122.68425,
    "signup_date": "2024-11-03"
  },
  {
    "customer_id": "cst_016",
    "name": "Halvard Sunde",
    "neighborhood": "Northwest District",
    "latitude": 45.53267,
    "longitude": -122.69519,
    "signup_date": "2025-02-11"
  },
  {
    "customer_id": "cst_017",
    "name": "Cleo Barrington",
    "neighborhood": "Division-Clinton",
    "latitude": 45.50179,
    "longitude": -122.63514,
    "signup_date": "2025-06-19"
  },
  {
    "customer_id": "cst_018",
    "name": "Anselm Kirby",
    "neighborhood": "Alberta Arts",
    "latitude": 45.55508,
    "longitude": -122.6461,
    "signup_date": "2025-08-25"
  },
  {
    "customer_id": "cst_019",
    "name": "Winifred Osei",
    "neighborhood": "Sellwood",
    "latitude": 45.4606,
    "longitude": -122.6608,
    "signup_date": "2025-12-09"
  },
  {
    "customer_id": "cst_020",
    "name": "Ravi Chandrasekar",
    "neighborhood": "Woodstock",
    "latitude": 45.47619,
    "longitude": -122.61346,
    "signup_date": "2026-02-17"
  }
];

var DB_BOOKINGS = [
  {
    "booking_id": "bkg_001",
    "listing_id": "lst_035",
    "customer_id": "cst_006",
    "provider_id": "prv_009",
    "scheduled_slot": "2026-02-07T13:00:00-08:00",
    "created_at": "2026-01-23T17:48:00-08:00",
    "price_paid": 230,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 34.5,
    "status": "completed",
    "job_address": "2484 SE Hawthorne Blvd, Unit A, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_002",
    "listing_id": "lst_038",
    "customer_id": "cst_011",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-02-07T16:00:00-08:00",
    "created_at": "2026-01-27T19:17:00-08:00",
    "price_paid": 150,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 22.5,
    "status": "completed",
    "job_address": "9153 NE 41st Ave, Unit D, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_003",
    "listing_id": "lst_021",
    "customer_id": "cst_013",
    "provider_id": "prv_005",
    "scheduled_slot": "2026-02-16T15:00:00-08:00",
    "created_at": "2026-01-30T12:05:00-08:00",
    "price_paid": 220,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 33.0,
    "status": "completed",
    "job_address": "9119 NE 41st Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_004",
    "listing_id": "lst_015",
    "customer_id": "cst_014",
    "provider_id": "prv_012",
    "scheduled_slot": "2026-02-26T16:00:00-08:00",
    "created_at": "2026-02-17T08:17:00-08:00",
    "price_paid": 130,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 19.5,
    "status": "completed",
    "job_address": "3553 SE Hawthorne Blvd, Apt 28, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_005",
    "listing_id": "lst_014",
    "customer_id": "cst_010",
    "provider_id": "prv_012",
    "scheduled_slot": "2026-03-16T15:00:00-07:00",
    "created_at": "2026-02-24T12:17:00-08:00",
    "price_paid": 140,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 21.0,
    "status": "completed",
    "job_address": "2641 SE 17th Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_006",
    "listing_id": "lst_004",
    "customer_id": "cst_010",
    "provider_id": "prv_003",
    "scheduled_slot": "2026-03-10T14:00:00-07:00",
    "created_at": "2026-02-27T17:48:00-08:00",
    "price_paid": 185,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 27.75,
    "status": "completed",
    "job_address": "8173 NE Alberta St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_007",
    "listing_id": "lst_011",
    "customer_id": "cst_008",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-03-07T08:00:00-08:00",
    "created_at": "2026-03-01T17:33:00-08:00",
    "price_paid": 130,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 19.5,
    "status": "completed",
    "job_address": "2634 SE Caruthers St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_008",
    "listing_id": "lst_030",
    "customer_id": "cst_010",
    "provider_id": "prv_008",
    "scheduled_slot": "2026-03-19T09:00:00-07:00",
    "created_at": "2026-03-02T12:17:00-08:00",
    "price_paid": 480,
    "quantity": 6,
    "quantity_unit": "hours",
    "commission_amount": 72.0,
    "status": "completed",
    "job_address": "4451 SE Belmont St, Unit A, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_009",
    "listing_id": "lst_019",
    "customer_id": "cst_015",
    "provider_id": "prv_005",
    "scheduled_slot": "2026-03-06T09:00:00-08:00",
    "created_at": "2026-03-03T21:48:00-08:00",
    "price_paid": 165,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 24.75,
    "status": "completed",
    "job_address": "7800 SE Clinton St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_010",
    "listing_id": "lst_032",
    "customer_id": "cst_010",
    "provider_id": "prv_015",
    "scheduled_slot": "2026-03-20T14:00:00-07:00",
    "created_at": "2026-03-05T17:33:00-08:00",
    "price_paid": 145,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 21.75,
    "status": "completed",
    "job_address": "9262 SE Woodstock Blvd, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_011",
    "listing_id": "lst_028",
    "customer_id": "cst_015",
    "provider_id": "prv_008",
    "scheduled_slot": "2026-03-18T09:00:00-07:00",
    "created_at": "2026-03-10T12:48:00-07:00",
    "price_paid": 275,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 41.25,
    "status": "completed",
    "job_address": "432 NE Alberta St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_012",
    "listing_id": "lst_026",
    "customer_id": "cst_018",
    "provider_id": "prv_011",
    "scheduled_slot": "2026-03-24T16:00:00-07:00",
    "created_at": "2026-03-12T12:17:00-07:00",
    "price_paid": 85,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 12.75,
    "status": "completed",
    "job_address": "5795 NE Alberta St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_013",
    "listing_id": "lst_007",
    "customer_id": "cst_010",
    "provider_id": "prv_004",
    "scheduled_slot": "2026-04-01T15:00:00-07:00",
    "created_at": "2026-03-17T08:05:00-07:00",
    "price_paid": 275,
    "quantity": 5,
    "quantity_unit": "hours",
    "commission_amount": 41.25,
    "status": "completed",
    "job_address": "7898 N Lombard St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_014",
    "listing_id": "lst_017",
    "customer_id": "cst_013",
    "provider_id": "prv_006",
    "scheduled_slot": "2026-03-25T13:00:00-07:00",
    "created_at": "2026-03-22T17:48:00-07:00",
    "price_paid": 190,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 28.5,
    "status": "completed",
    "job_address": "7139 SE 34th Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_015",
    "listing_id": "lst_001",
    "customer_id": "cst_004",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-04-10T15:00:00-07:00",
    "created_at": "2026-03-30T21:05:00-07:00",
    "price_paid": 135,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 20.25,
    "status": "completed",
    "job_address": "789 SE Caruthers St, Apt 14, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_016",
    "listing_id": "lst_013",
    "customer_id": "cst_017",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-05-04T16:00:00-07:00",
    "created_at": "2026-04-25T21:48:00-07:00",
    "price_paid": 175,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 26.25,
    "status": "completed",
    "job_address": "4249 NE 15th Ave, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_017",
    "listing_id": "lst_022",
    "customer_id": "cst_019",
    "provider_id": "prv_014",
    "scheduled_slot": "2026-05-14T13:00:00-07:00",
    "created_at": "2026-05-01T21:48:00-07:00",
    "price_paid": 195,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 29.25,
    "status": "completed",
    "job_address": "8417 SE 17th Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_018",
    "listing_id": "lst_033",
    "customer_id": "cst_011",
    "provider_id": "prv_009",
    "scheduled_slot": "2026-05-08T14:00:00-07:00",
    "created_at": "2026-05-04T08:05:00-07:00",
    "price_paid": 60,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 9.0,
    "status": "completed",
    "job_address": "8284 N Portsmouth Ave, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_019",
    "listing_id": "lst_012",
    "customer_id": "cst_013",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-05-13T10:00:00-07:00",
    "created_at": "2026-05-05T19:48:00-07:00",
    "price_paid": 95,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 14.25,
    "status": "completed",
    "job_address": "4843 SE Milwaukie Ave, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_020",
    "listing_id": "lst_019",
    "customer_id": "cst_003",
    "provider_id": "prv_005",
    "scheduled_slot": "2026-05-11T14:00:00-07:00",
    "created_at": "2026-05-06T21:05:00-07:00",
    "price_paid": 165,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 24.75,
    "status": "completed",
    "job_address": "2376 SE Hawthorne Blvd, Unit B, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_021",
    "listing_id": "lst_002",
    "customer_id": "cst_020",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-05-23T15:00:00-07:00",
    "created_at": "2026-05-07T19:48:00-07:00",
    "price_paid": 120,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 18.0,
    "status": "completed",
    "job_address": "1080 N Lombard St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_022",
    "listing_id": "lst_016",
    "customer_id": "cst_009",
    "provider_id": "prv_012",
    "scheduled_slot": "2026-05-21T15:00:00-07:00",
    "created_at": "2026-05-09T12:33:00-07:00",
    "price_paid": 210,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 31.5,
    "status": "completed",
    "job_address": "4189 SE Division St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_023",
    "listing_id": "lst_003",
    "customer_id": "cst_016",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-05-13T09:00:00-07:00",
    "created_at": "2026-05-09T19:48:00-07:00",
    "price_paid": 260,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 39.0,
    "status": "completed",
    "job_address": "9239 NE Alberta St, Unit B, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_024",
    "listing_id": "lst_011",
    "customer_id": "cst_005",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-05-18T08:00:00-07:00",
    "created_at": "2026-05-14T08:33:00-07:00",
    "price_paid": 195,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 29.25,
    "status": "completed",
    "job_address": "3998 NE Cully Blvd, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_025",
    "listing_id": "lst_027",
    "customer_id": "cst_011",
    "provider_id": "prv_011",
    "scheduled_slot": "2026-06-02T16:00:00-07:00",
    "created_at": "2026-05-16T08:33:00-07:00",
    "price_paid": 400,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 60.0,
    "status": "completed",
    "job_address": "4889 N Fenwick Ave, Apt 29, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_026",
    "listing_id": "lst_031",
    "customer_id": "cst_017",
    "provider_id": "prv_015",
    "scheduled_slot": "2026-06-04T13:00:00-07:00",
    "created_at": "2026-05-17T17:33:00-07:00",
    "price_paid": 160,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 24.0,
    "status": "completed",
    "job_address": "6698 SE Hawthorne Blvd, Unit B, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_027",
    "listing_id": "lst_004",
    "customer_id": "cst_001",
    "provider_id": "prv_003",
    "scheduled_slot": "2026-05-28T16:00:00-07:00",
    "created_at": "2026-05-17T17:48:00-07:00",
    "price_paid": 185,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 27.75,
    "status": "completed",
    "job_address": "801 SE Caruthers St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_028",
    "listing_id": "lst_017",
    "customer_id": "cst_019",
    "provider_id": "prv_006",
    "scheduled_slot": "2026-06-12T14:00:00-07:00",
    "created_at": "2026-05-23T08:17:00-07:00",
    "price_paid": 190,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 28.5,
    "status": "completed",
    "job_address": "9587 SE 17th Ave, Apt 24, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_029",
    "listing_id": "lst_033",
    "customer_id": "cst_007",
    "provider_id": "prv_009",
    "scheduled_slot": "2026-06-03T10:00:00-07:00",
    "created_at": "2026-05-25T08:17:00-07:00",
    "price_paid": 60,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 9.0,
    "status": "completed",
    "job_address": "8897 NW Naito Pkwy, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_030",
    "listing_id": "lst_015",
    "customer_id": "cst_015",
    "provider_id": "prv_012",
    "scheduled_slot": "2026-05-28T14:00:00-07:00",
    "created_at": "2026-05-25T17:05:00-07:00",
    "price_paid": 130,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 19.5,
    "status": "completed",
    "job_address": "8208 NE Prescott St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_031",
    "listing_id": "lst_020",
    "customer_id": "cst_013",
    "provider_id": "prv_005",
    "scheduled_slot": "2026-06-03T10:00:00-07:00",
    "created_at": "2026-05-26T21:48:00-07:00",
    "price_paid": 140,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 21.0,
    "status": "completed",
    "job_address": "2852 SE Belmont St, Apt 21, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_032",
    "listing_id": "lst_040",
    "customer_id": "cst_004",
    "provider_id": "prv_011",
    "scheduled_slot": "2026-06-01T09:00:00-07:00",
    "created_at": "2026-05-29T12:48:00-07:00",
    "price_paid": 315,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 47.25,
    "status": "completed",
    "job_address": "2152 N Fenwick Ave, Apt 14, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_033",
    "listing_id": "lst_003",
    "customer_id": "cst_008",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-06-08T09:00:00-07:00",
    "created_at": "2026-05-29T21:33:00-07:00",
    "price_paid": 260,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 39.0,
    "status": "completed",
    "job_address": "1694 SW Vermont St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_034",
    "listing_id": "lst_039",
    "customer_id": "cst_010",
    "provider_id": "prv_004",
    "scheduled_slot": "2026-06-26T10:00:00-07:00",
    "created_at": "2026-06-13T12:48:00-07:00",
    "price_paid": 380,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 57.0,
    "status": "completed",
    "job_address": "4910 SE Stark St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_035",
    "listing_id": "lst_010",
    "customer_id": "cst_008",
    "provider_id": "prv_013",
    "scheduled_slot": "2026-07-08T08:00:00-07:00",
    "created_at": "2026-06-19T17:48:00-07:00",
    "price_paid": 99,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 14.85,
    "status": "completed",
    "job_address": "1077 N Lombard St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_036",
    "listing_id": "lst_024",
    "customer_id": "cst_012",
    "provider_id": "prv_007",
    "scheduled_slot": "2026-06-24T15:00:00-07:00",
    "created_at": "2026-06-21T17:33:00-07:00",
    "price_paid": 440,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 66.0,
    "status": "completed",
    "job_address": "403 SW Barbur Blvd, Apt 39, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_037",
    "listing_id": "lst_034",
    "customer_id": "cst_018",
    "provider_id": "prv_009",
    "scheduled_slot": "2026-06-29T14:00:00-07:00",
    "created_at": "2026-06-23T21:33:00-07:00",
    "price_paid": 190,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 28.5,
    "status": "completed",
    "job_address": "3452 SE Milwaukie Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_038",
    "listing_id": "lst_028",
    "customer_id": "cst_019",
    "provider_id": "prv_008",
    "scheduled_slot": "2026-07-14T16:00:00-07:00",
    "created_at": "2026-06-26T19:05:00-07:00",
    "price_paid": 275,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 41.25,
    "status": "completed",
    "job_address": "991 SE Milwaukie Ave, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_039",
    "listing_id": "lst_002",
    "customer_id": "cst_001",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-07-08T14:00:00-07:00",
    "created_at": "2026-06-30T17:48:00-07:00",
    "price_paid": 120,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 18.0,
    "status": "completed",
    "job_address": "5153 SW Barbur Blvd, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_040",
    "listing_id": "lst_036",
    "customer_id": "cst_013",
    "provider_id": "prv_013",
    "scheduled_slot": "2026-07-13T09:00:00-07:00",
    "created_at": "2026-07-01T17:33:00-07:00",
    "price_paid": 165,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 24.75,
    "status": "completed",
    "job_address": "1272 SE Clinton St, Apt 7, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_041",
    "listing_id": "lst_008",
    "customer_id": "cst_019",
    "provider_id": "prv_010",
    "scheduled_slot": "2026-07-11T16:00:00-07:00",
    "created_at": "2026-07-04T08:05:00-07:00",
    "price_paid": 80,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 12.0,
    "status": "completed",
    "job_address": "7065 NE Killingsworth St, Apt 18, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_042",
    "listing_id": "lst_010",
    "customer_id": "cst_006",
    "provider_id": "prv_013",
    "scheduled_slot": "2026-07-16T16:00:00-07:00",
    "created_at": "2026-07-05T19:33:00-07:00",
    "price_paid": 99,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 14.85,
    "status": "completed",
    "job_address": "9040 SE 17th Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_043",
    "listing_id": "lst_018",
    "customer_id": "cst_013",
    "provider_id": "prv_006",
    "scheduled_slot": "2026-07-16T13:00:00-07:00",
    "created_at": "2026-07-07T21:33:00-07:00",
    "price_paid": 400,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 60.0,
    "status": "completed",
    "job_address": "3888 SE 92nd Ave, Unit A, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_044",
    "listing_id": "lst_010",
    "customer_id": "cst_001",
    "provider_id": "prv_013",
    "scheduled_slot": "2026-07-21T11:00:00-07:00",
    "created_at": "2026-07-08T08:48:00-07:00",
    "price_paid": 99,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 14.85,
    "status": "completed",
    "job_address": "4996 SE 17th Ave, Unit B, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_045",
    "listing_id": "lst_006",
    "customer_id": "cst_010",
    "provider_id": "prv_004",
    "scheduled_slot": "2026-07-20T14:00:00-07:00",
    "created_at": "2026-07-08T12:17:00-07:00",
    "price_paid": 150,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 22.5,
    "status": "completed",
    "job_address": "4529 NE Prescott St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_046",
    "listing_id": "lst_023",
    "customer_id": "cst_020",
    "provider_id": "prv_014",
    "scheduled_slot": "2026-07-29T08:00:00-07:00",
    "created_at": "2026-07-10T21:33:00-07:00",
    "price_paid": 390,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 58.5,
    "status": "completed",
    "job_address": "3904 SW Capitol Hwy, Unit A, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_047",
    "listing_id": "lst_027",
    "customer_id": "cst_008",
    "provider_id": "prv_011",
    "scheduled_slot": "2026-07-18T08:00:00-07:00",
    "created_at": "2026-07-10T21:33:00-07:00",
    "price_paid": 400,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 60.0,
    "status": "completed",
    "job_address": "2735 SE Foster Rd, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_048",
    "listing_id": "lst_009",
    "customer_id": "cst_018",
    "provider_id": "prv_010",
    "scheduled_slot": "2026-07-17T16:00:00-07:00",
    "created_at": "2026-07-11T17:33:00-07:00",
    "price_paid": 240,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 36.0,
    "status": "completed",
    "job_address": "7442 NE Cully Blvd, Unit C, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_049",
    "listing_id": "lst_036",
    "customer_id": "cst_006",
    "provider_id": "prv_013",
    "scheduled_slot": "2026-07-22T15:00:00-07:00",
    "created_at": "2026-07-12T08:05:00-07:00",
    "price_paid": 165,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 24.75,
    "status": "completed",
    "job_address": "1392 NE Prescott St, Unit A, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_050",
    "listing_id": "lst_024",
    "customer_id": "cst_006",
    "provider_id": "prv_007",
    "scheduled_slot": "2026-07-18T10:00:00-07:00",
    "created_at": "2026-07-13T21:48:00-07:00",
    "price_paid": 440,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 66.0,
    "status": "completed",
    "job_address": "1040 SE 34th Ave, Apt 31, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_051",
    "listing_id": "lst_008",
    "customer_id": "cst_015",
    "provider_id": "prv_010",
    "scheduled_slot": "2026-07-25T10:00:00-07:00",
    "created_at": "2026-07-14T12:05:00-07:00",
    "price_paid": 80,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 12.0,
    "status": "completed",
    "job_address": "801 N Fenwick Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_052",
    "listing_id": "lst_022",
    "customer_id": "cst_014",
    "provider_id": "prv_014",
    "scheduled_slot": "2026-08-02T09:00:00-07:00",
    "created_at": "2026-07-15T21:48:00-07:00",
    "price_paid": 195,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 29.25,
    "status": "completed",
    "job_address": "6042 N Fenwick Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_053",
    "listing_id": "lst_012",
    "customer_id": "cst_002",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-08-04T16:00:00-07:00",
    "created_at": "2026-07-16T19:05:00-07:00",
    "price_paid": 95,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 14.25,
    "status": "completed",
    "job_address": "4839 NE Killingsworth St, Unit B, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_054",
    "listing_id": "lst_036",
    "customer_id": "cst_008",
    "provider_id": "prv_013",
    "scheduled_slot": "2026-08-01T15:00:00-07:00",
    "created_at": "2026-07-20T08:33:00-07:00",
    "price_paid": 165,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 24.75,
    "status": "completed",
    "job_address": "8990 N Rosa Parks Way, Unit C, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_055",
    "listing_id": "lst_029",
    "customer_id": "cst_013",
    "provider_id": "prv_008",
    "scheduled_slot": "2026-07-26T08:00:00-07:00",
    "created_at": "2026-07-21T19:05:00-07:00",
    "price_paid": 75,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 11.25,
    "status": "cancelled",
    "job_address": "3280 SE Belmont St, Unit C, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_056",
    "listing_id": "lst_008",
    "customer_id": "cst_010",
    "provider_id": "prv_010",
    "scheduled_slot": "2026-08-04T08:00:00-07:00",
    "created_at": "2026-07-21T21:33:00-07:00",
    "price_paid": 80,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 12.0,
    "status": "completed",
    "job_address": "1790 SE Foster Rd, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_057",
    "listing_id": "lst_025",
    "customer_id": "cst_011",
    "provider_id": "prv_007",
    "scheduled_slot": "2026-08-03T08:00:00-07:00",
    "created_at": "2026-07-22T21:33:00-07:00",
    "price_paid": 300,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 45.0,
    "status": "completed",
    "job_address": "6196 SE Holgate Blvd, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_058",
    "listing_id": "lst_001",
    "customer_id": "cst_015",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-08-05T08:00:00-07:00",
    "created_at": "2026-07-24T12:17:00-07:00",
    "price_paid": 135,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 20.25,
    "status": "completed",
    "job_address": "4886 NE 15th Ave, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_059",
    "listing_id": "lst_005",
    "customer_id": "cst_009",
    "provider_id": "prv_003",
    "scheduled_slot": "2026-07-30T15:00:00-07:00",
    "created_at": "2026-07-25T17:33:00-07:00",
    "price_paid": 340,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 51.0,
    "status": "completed",
    "job_address": "2607 SW Barbur Blvd, Unit B, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_060",
    "listing_id": "lst_023",
    "customer_id": "cst_008",
    "provider_id": "prv_014",
    "scheduled_slot": "2026-08-06T13:00:00-07:00",
    "created_at": "2026-07-30T19:17:00-07:00",
    "price_paid": 260,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 39.0,
    "status": "completed",
    "job_address": "3344 SE Holgate Blvd, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_061",
    "listing_id": "lst_019",
    "customer_id": "cst_010",
    "provider_id": "prv_005",
    "scheduled_slot": "2026-08-21T11:00:00-07:00",
    "created_at": "2026-07-31T17:17:00-07:00",
    "price_paid": 165,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 24.75,
    "status": "confirmed",
    "job_address": "6799 SE 17th Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_062",
    "listing_id": "lst_021",
    "customer_id": "cst_003",
    "provider_id": "prv_005",
    "scheduled_slot": "2026-08-26T11:00:00-07:00",
    "created_at": "2026-08-03T12:17:00-07:00",
    "price_paid": 220,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 33.0,
    "status": "cancelled",
    "job_address": "1285 SE Division St, Apt 20, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_063",
    "listing_id": "lst_032",
    "customer_id": "cst_005",
    "provider_id": "prv_015",
    "scheduled_slot": "2026-08-29T11:00:00-07:00",
    "created_at": "2026-08-07T21:33:00-07:00",
    "price_paid": 145,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 21.75,
    "status": "pending",
    "job_address": "6961 SE 17th Ave, Apt 34, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_064",
    "listing_id": "lst_002",
    "customer_id": "cst_017",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-08-21T16:00:00-07:00",
    "created_at": "2026-08-08T19:05:00-07:00",
    "price_paid": 120,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 18.0,
    "status": "pending",
    "job_address": "9443 N Fenwick Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_065",
    "listing_id": "lst_005",
    "customer_id": "cst_014",
    "provider_id": "prv_003",
    "scheduled_slot": "2026-08-26T08:00:00-07:00",
    "created_at": "2026-08-09T12:33:00-07:00",
    "price_paid": 340,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 51.0,
    "status": "cancelled",
    "job_address": "3985 SE Hawthorne Blvd, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_066",
    "listing_id": "lst_029",
    "customer_id": "cst_003",
    "provider_id": "prv_008",
    "scheduled_slot": "2026-08-21T14:00:00-07:00",
    "created_at": "2026-08-10T08:33:00-07:00",
    "price_paid": 75,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 11.25,
    "status": "pending",
    "job_address": "7809 SE Woodstock Blvd, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_067",
    "listing_id": "lst_003",
    "customer_id": "cst_017",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-08-24T15:00:00-07:00",
    "created_at": "2026-08-11T08:48:00-07:00",
    "price_paid": 260,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 39.0,
    "status": "confirmed",
    "job_address": "663 SE Holgate Blvd, Apt 27, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_068",
    "listing_id": "lst_012",
    "customer_id": "cst_019",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-08-21T08:00:00-07:00",
    "created_at": "2026-08-11T19:33:00-07:00",
    "price_paid": 95,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 14.25,
    "status": "pending",
    "job_address": "1219 SE 17th Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_069",
    "listing_id": "lst_027",
    "customer_id": "cst_004",
    "provider_id": "prv_011",
    "scheduled_slot": "2026-08-28T16:00:00-07:00",
    "created_at": "2026-08-14T08:17:00-07:00",
    "price_paid": 500,
    "quantity": 5,
    "quantity_unit": "hours",
    "commission_amount": 75.0,
    "status": "confirmed",
    "job_address": "2626 SE Belmont St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_070",
    "listing_id": "lst_015",
    "customer_id": "cst_015",
    "provider_id": "prv_012",
    "scheduled_slot": "2026-09-08T13:00:00-07:00",
    "created_at": "2026-08-14T08:17:00-07:00",
    "price_paid": 130,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 19.5,
    "status": "cancelled",
    "job_address": "6571 NE Killingsworth St, Unit B, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_071",
    "listing_id": "lst_007",
    "customer_id": "cst_007",
    "provider_id": "prv_004",
    "scheduled_slot": "2026-08-29T15:00:00-07:00",
    "created_at": "2026-08-14T08:33:00-07:00",
    "price_paid": 220,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 33.0,
    "status": "cancelled",
    "job_address": "1594 SE Division St, Unit D, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_072",
    "listing_id": "lst_022",
    "customer_id": "cst_018",
    "provider_id": "prv_014",
    "scheduled_slot": "2026-08-24T08:00:00-07:00",
    "created_at": "2026-08-14T12:05:00-07:00",
    "price_paid": 195,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 29.25,
    "status": "cancelled",
    "job_address": "6468 SW Barbur Blvd, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_073",
    "listing_id": "lst_004",
    "customer_id": "cst_002",
    "provider_id": "prv_003",
    "scheduled_slot": "2026-08-22T14:00:00-07:00",
    "created_at": "2026-08-15T08:05:00-07:00",
    "price_paid": 185,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 27.75,
    "status": "pending",
    "job_address": "7713 N Vancouver Ave, Apt 39, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_074",
    "listing_id": "lst_009",
    "customer_id": "cst_015",
    "provider_id": "prv_010",
    "scheduled_slot": "2026-09-12T13:00:00-07:00",
    "created_at": "2026-08-15T12:33:00-07:00",
    "price_paid": 240,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 36.0,
    "status": "confirmed",
    "job_address": "1248 SE Milwaukie Ave, Apt 23, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_075",
    "listing_id": "lst_016",
    "customer_id": "cst_010",
    "provider_id": "prv_012",
    "scheduled_slot": "2026-08-26T14:00:00-07:00",
    "created_at": "2026-08-15T17:05:00-07:00",
    "price_paid": 210,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 31.5,
    "status": "pending",
    "job_address": "6488 SE Stark St, Apt 20, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_076",
    "listing_id": "lst_028",
    "customer_id": "cst_016",
    "provider_id": "prv_008",
    "scheduled_slot": "2026-09-04T09:00:00-07:00",
    "created_at": "2026-08-15T17:17:00-07:00",
    "price_paid": 275,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 41.25,
    "status": "cancelled",
    "job_address": "4513 SE Belmont St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_077",
    "listing_id": "lst_031",
    "customer_id": "cst_002",
    "provider_id": "prv_015",
    "scheduled_slot": "2026-09-07T09:00:00-07:00",
    "created_at": "2026-08-16T19:05:00-07:00",
    "price_paid": 160,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 24.0,
    "status": "confirmed",
    "job_address": "6524 NE Prescott St, Unit A, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_078",
    "listing_id": "lst_017",
    "customer_id": "cst_010",
    "provider_id": "prv_006",
    "scheduled_slot": "2026-09-03T08:00:00-07:00",
    "created_at": "2026-08-16T21:48:00-07:00",
    "price_paid": 190,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 28.5,
    "status": "confirmed",
    "job_address": "6728 NW Marshall St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_079",
    "listing_id": "lst_026",
    "customer_id": "cst_013",
    "provider_id": "prv_011",
    "scheduled_slot": "2026-09-09T14:00:00-07:00",
    "created_at": "2026-08-17T12:05:00-07:00",
    "price_paid": 85,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 12.75,
    "status": "pending",
    "job_address": "783 NE Alberta St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_080",
    "listing_id": "lst_034",
    "customer_id": "cst_012",
    "provider_id": "prv_009",
    "scheduled_slot": "2026-08-26T15:00:00-07:00",
    "created_at": "2026-08-17T12:33:00-07:00",
    "price_paid": 190,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 28.5,
    "status": "pending",
    "job_address": "5635 SE Ankeny St, Apt 18, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_081",
    "listing_id": "lst_024",
    "customer_id": "cst_006",
    "provider_id": "prv_007",
    "scheduled_slot": "2026-09-07T15:00:00-07:00",
    "created_at": "2026-08-17T17:05:00-07:00",
    "price_paid": 330,
    "quantity": 3,
    "quantity_unit": "hours",
    "commission_amount": 49.5,
    "status": "confirmed",
    "job_address": "8302 SE Ankeny St, Apt 11, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_082",
    "listing_id": "lst_013",
    "customer_id": "cst_001",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-09-09T08:00:00-07:00",
    "created_at": "2026-08-18T12:17:00-07:00",
    "price_paid": 175,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 26.25,
    "status": "cancelled",
    "job_address": "4952 SE Milwaukie Ave, Unit B, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_083",
    "listing_id": "lst_014",
    "customer_id": "cst_018",
    "provider_id": "prv_012",
    "scheduled_slot": "2026-08-25T11:00:00-07:00",
    "created_at": "2026-08-18T12:33:00-07:00",
    "price_paid": 140,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 21.0,
    "status": "confirmed",
    "job_address": "5920 SE Foster Rd, Apt 34, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_084",
    "listing_id": "lst_039",
    "customer_id": "cst_008",
    "provider_id": "prv_004",
    "scheduled_slot": "2026-08-31T08:00:00-07:00",
    "created_at": "2026-08-18T12:48:00-07:00",
    "price_paid": 380,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 57.0,
    "status": "pending",
    "job_address": "2055 SE 34th Ave, Apt 8, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_085",
    "listing_id": "lst_006",
    "customer_id": "cst_006",
    "provider_id": "prv_004",
    "scheduled_slot": "2026-08-26T15:00:00-07:00",
    "created_at": "2026-08-18T17:17:00-07:00",
    "price_paid": 150,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 22.5,
    "status": "confirmed",
    "job_address": "5064 NE 41st Ave, Apt 2, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_086",
    "listing_id": "lst_011",
    "customer_id": "cst_006",
    "provider_id": "prv_002",
    "scheduled_slot": "2026-09-10T10:00:00-07:00",
    "created_at": "2026-08-18T17:17:00-07:00",
    "price_paid": 130,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 19.5,
    "status": "confirmed",
    "job_address": "1519 SE 92nd Ave, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_087",
    "listing_id": "lst_033",
    "customer_id": "cst_008",
    "provider_id": "prv_009",
    "scheduled_slot": "2026-09-03T10:00:00-07:00",
    "created_at": "2026-08-18T19:17:00-07:00",
    "price_paid": 60,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 9.0,
    "status": "confirmed",
    "job_address": "9649 NE Alberta St, Apt 14, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_088",
    "listing_id": "lst_001",
    "customer_id": "cst_003",
    "provider_id": "prv_001",
    "scheduled_slot": "2026-09-07T16:00:00-07:00",
    "created_at": "2026-08-18T19:33:00-07:00",
    "price_paid": 180,
    "quantity": 4,
    "quantity_unit": "hours",
    "commission_amount": 27.0,
    "status": "confirmed",
    "job_address": "5979 SE Division St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_089",
    "listing_id": "lst_020",
    "customer_id": "cst_006",
    "provider_id": "prv_005",
    "scheduled_slot": "2026-08-31T13:00:00-07:00",
    "created_at": "2026-08-19T12:05:00-07:00",
    "price_paid": 140,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 21.0,
    "status": "pending",
    "job_address": "4328 SE 92nd Ave, Unit B, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_090",
    "listing_id": "lst_030",
    "customer_id": "cst_007",
    "provider_id": "prv_008",
    "scheduled_slot": "2026-09-05T09:00:00-07:00",
    "created_at": "2026-08-19T21:17:00-07:00",
    "price_paid": 400,
    "quantity": 5,
    "quantity_unit": "hours",
    "commission_amount": 60.0,
    "status": "cancelled",
    "job_address": "1986 NE Prescott St, Portland, OR",
    "source": "chatbot"
  },
  {
    "booking_id": "bkg_091",
    "listing_id": "lst_008",
    "customer_id": "cst_020",
    "provider_id": "prv_010",
    "scheduled_slot": "2026-08-08T09:00:00-07:00",
    "created_at": "2026-07-27T12:33:00-07:00",
    "price_paid": 80,
    "quantity": 2,
    "quantity_unit": "hours",
    "commission_amount": 12.0,
    "status": "cancelled",
    "job_address": "1080 N Lombard St, Portland, OR",
    "source": "customer_app"
  },
  {
    "booking_id": "bkg_092",
    "listing_id": "lst_022",
    "customer_id": "cst_005",
    "provider_id": "prv_014",
    "scheduled_slot": "2026-09-03T10:00:00-07:00",
    "created_at": "2026-08-19T22:10:00-07:00",
    "price_paid": 195,
    "quantity": 1,
    "quantity_unit": "job",
    "commission_amount": 29.25,
    "status": "confirmed",
    "job_address": "3985 SE Hawthorne Blvd, Portland, OR",
    "source": "customer_app"
  }
];

var DB_REVIEWS = [
  {
    "review_id": "rev_001",
    "booking_id": "bkg_002",
    "listing_id": "lst_038",
    "customer_id": "cst_011",
    "rating": 5,
    "text": "I have a cat who sheds constantly and the vacuuming was genuinely thorough, including under the couch. Booking fortnightly from now on.",
    "created_at": "2026-02-09T18:41:00-08:00"
  },
  {
    "review_id": "rev_002",
    "booking_id": "bkg_001",
    "listing_id": "lst_035",
    "customer_id": "cst_006",
    "rating": 5,
    "text": "Full fall cleanup and everything they pulled left in the truck with them, including a broken planter I pointed at halfway through.",
    "created_at": "2026-02-11T13:09:00-08:00"
  },
  {
    "review_id": "rev_003",
    "booking_id": "bkg_003",
    "listing_id": "lst_021",
    "customer_id": "cst_013",
    "rating": 5,
    "text": "The leak had swollen the cabinet floor before I noticed it. They replaced the failed trap, fitted a sealed base, and left the cupboard dry and usable again.",
    "created_at": "2026-02-17T18:09:00-08:00"
  },
  {
    "review_id": "rev_004",
    "booking_id": "bkg_004",
    "listing_id": "lst_015",
    "customer_id": "cst_014",
    "rating": 5,
    "text": "Six old outlets and switches replaced in one visit, including a GFCI by the kitchen sink. Everything was tested and the odd wiring behind one box was clearly explained.",
    "created_at": "2026-03-01T20:09:00-08:00"
  },
  {
    "review_id": "rev_005",
    "booking_id": "bkg_007",
    "listing_id": "lst_011",
    "customer_id": "cst_008",
    "rating": 5,
    "text": "He came back to finish the desk from the same job at no extra charge. Exactly the same care the second time around.",
    "created_at": "2026-03-08T13:26:00-07:00"
  },
  {
    "review_id": "rev_006",
    "booking_id": "bkg_009",
    "listing_id": "lst_019",
    "customer_id": "cst_015",
    "rating": 4,
    "text": "The new kitchen faucet works perfectly and the seized shutoff underneath was replaced too. Quick and clean, though the arrival was about an hour outside the window I was given.",
    "created_at": "2026-03-11T13:41:00-07:00"
  },
  {
    "review_id": "rev_007",
    "booking_id": "bkg_006",
    "listing_id": "lst_004",
    "customer_id": "cst_010",
    "rating": 5,
    "text": "Everything I asked for got done and the floors were dry by the time I got home. The mirrors were streak-free, which nobody else has managed.",
    "created_at": "2026-03-12T20:26:00-07:00"
  },
  {
    "review_id": "rev_008",
    "booking_id": "bkg_005",
    "listing_id": "lst_014",
    "customer_id": "cst_010",
    "rating": 5,
    "text": "Our front door had not latched properly in two years. Planed, rehung, new strike plate, done inside ninety minutes.",
    "created_at": "2026-03-18T08:41:00-07:00"
  },
  {
    "review_id": "rev_009",
    "booking_id": "bkg_010",
    "listing_id": "lst_032",
    "customer_id": "cst_010",
    "rating": 4,
    "text": "The gutters are flowing again and the leaves are off both the lawn and the beds. Everything was bagged into my yard debris bin as asked.",
    "created_at": "2026-03-21T08:09:00-07:00"
  },
  {
    "review_id": "rev_010",
    "booking_id": "bkg_008",
    "listing_id": "lst_030",
    "customer_id": "cst_010",
    "rating": 4,
    "text": "Good work on the blinds and the towel rails. The patch on the hallway wall sits very slightly proud of the surface, though you would have to look for it.",
    "created_at": "2026-03-22T08:26:00-07:00"
  },
  {
    "review_id": "rev_011",
    "booking_id": "bkg_011",
    "listing_id": "lst_028",
    "customer_id": "cst_015",
    "rating": 5,
    "text": "They cleared years of boxes and a broken dresser out of the basement, then swept the concrete floor. The recycling and donation receipts arrived that evening.",
    "created_at": "2026-03-24T18:09:00-07:00"
  },
  {
    "review_id": "rev_012",
    "booking_id": "bkg_013",
    "listing_id": "lst_007",
    "customer_id": "cst_010",
    "rating": 5,
    "text": "Booked the four hour first visit and every minute of it got used. The shower grout is white again and the inside of the cabinets got wiped out.",
    "created_at": "2026-04-05T18:09:00-07:00"
  },
  {
    "review_id": "rev_013",
    "booking_id": "bkg_015",
    "listing_id": "lst_001",
    "customer_id": "cst_004",
    "rating": 5,
    "text": "Marisol was on time and the kitchen came out better than when I moved in. She got the burnt ring off the stovetop that I had given up on months ago.",
    "created_at": "2026-04-11T18:09:00-07:00"
  },
  {
    "review_id": "rev_014",
    "booking_id": "bkg_016",
    "listing_id": "lst_013",
    "customer_id": "cst_017",
    "rating": 5,
    "text": "The new ceiling fan is solid, quiet, and finally balanced. He found that the old box was not fan-rated, fitted the proper brace, and explained the extra work before doing it.",
    "created_at": "2026-05-06T08:26:00-07:00"
  },
  {
    "review_id": "rev_015",
    "booking_id": "bkg_018",
    "listing_id": "lst_033",
    "customer_id": "cst_011",
    "rating": 5,
    "text": "The lawn had got embarrassingly high, but he mowed, trimmed, and edged it cleanly in one visit. He bagged the heavy clippings and took them away.",
    "created_at": "2026-05-12T20:09:00-07:00"
  },
  {
    "review_id": "rev_016",
    "booking_id": "bkg_020",
    "listing_id": "lst_019",
    "customer_id": "cst_003",
    "rating": 5,
    "text": "Kitchen faucet swapped and the seized shutoff valve replaced without any drama. He ran the water for a good ten minutes and checked underneath twice.",
    "created_at": "2026-05-14T18:26:00-07:00"
  },
  {
    "review_id": "rev_017",
    "booking_id": "bkg_017",
    "listing_id": "lst_022",
    "customer_id": "cst_019",
    "rating": 4,
    "text": "Solid work on the toilet replacement and they took the old one away as promised. Would have liked more warning that the water would be off for two hours.",
    "created_at": "2026-05-17T08:41:00-07:00"
  },
  {
    "review_id": "rev_018",
    "booking_id": "bkg_023",
    "listing_id": "lst_003",
    "customer_id": "cst_016",
    "rating": 5,
    "text": "The apartment passed the move-out inspection with no cleaning deduction. The oven, fridge drawers, cabinet interiors, and baseboards were all properly done.",
    "created_at": "2026-05-18T13:09:00-07:00"
  },
  {
    "review_id": "rev_019",
    "booking_id": "bkg_022",
    "listing_id": "lst_016",
    "customer_id": "cst_009",
    "rating": 5,
    "text": "Three fixtures including a heavy dining room chandelier. She checked the box was rated for the weight before touching anything and took the old ones away.",
    "created_at": "2026-05-23T20:09:00-07:00"
  },
  {
    "review_id": "rev_020",
    "booking_id": "bkg_024",
    "listing_id": "lst_011",
    "customer_id": "cst_005",
    "rating": 5,
    "text": "Two wardrobes and a bed frame in under three hours, and he anchored both wardrobes into the studs without me having to ask. Cardboard flattened and stacked by the door.",
    "created_at": "2026-05-24T08:09:00-07:00"
  },
  {
    "review_id": "rev_021",
    "booking_id": "bkg_021",
    "listing_id": "lst_002",
    "customer_id": "cst_020",
    "rating": 4,
    "text": "Good clean overall and the bathroom was spotless. She ran about twenty minutes over, which is on me for underestimating the state of the kitchen.",
    "created_at": "2026-05-27T13:26:00-07:00"
  },
  {
    "review_id": "rev_022",
    "booking_id": "bkg_030",
    "listing_id": "lst_015",
    "customer_id": "cst_015",
    "rating": 4,
    "text": "Replaced five outlets and a dimmer in a bit over an hour. One of the new outlets was loose in the box and she came back the following week to sort it.",
    "created_at": "2026-05-31T20:09:00-07:00"
  },
  {
    "review_id": "rev_023",
    "booking_id": "bkg_027",
    "listing_id": "lst_004",
    "customer_id": "cst_001",
    "rating": 5,
    "text": "Both of them worked through our three bedroom in a bit under three hours and did not skip a single baseboard. Beds were made with the sheets I left out.",
    "created_at": "2026-06-02T20:09:00-07:00"
  },
  {
    "review_id": "rev_024",
    "booking_id": "bkg_032",
    "listing_id": "lst_040",
    "customer_id": "cst_004",
    "rating": 5,
    "text": "The storage unit was emptied in one afternoon, with the donation load separated from the things coming home. Everything we kept arrived intact and clearly grouped.",
    "created_at": "2026-06-03T08:09:00-07:00"
  },
  {
    "review_id": "rev_025",
    "booking_id": "bkg_025",
    "listing_id": "lst_027",
    "customer_id": "cst_011",
    "rating": 5,
    "text": "The garage was sorted without rushing me, the donation and dump loads disappeared, and the boxes I kept made it safely to storage. The four-hour estimate was accurate.",
    "created_at": "2026-06-05T08:26:00-07:00"
  },
  {
    "review_id": "rev_026",
    "booking_id": "bkg_029",
    "listing_id": "lst_033",
    "customer_id": "cst_007",
    "rating": 5,
    "text": "The grass was badly overgrown, but he mowed it evenly and edged the sidewalk and drive. He took the extra clippings rather than overfilling my bin.",
    "created_at": "2026-06-06T08:26:00-07:00"
  },
  {
    "review_id": "rev_027",
    "booking_id": "bkg_026",
    "listing_id": "lst_031",
    "customer_id": "cst_017",
    "rating": 5,
    "text": "Two years of branches and an old grill gone in one trip. He split the load so I was not charged landfill rates on the yard debris, and swept the pad after.",
    "created_at": "2026-06-08T08:09:00-07:00"
  },
  {
    "review_id": "rev_028",
    "booking_id": "bkg_033",
    "listing_id": "lst_003",
    "customer_id": "cst_008",
    "rating": 5,
    "text": "Used this for a move-out and the property manager signed off with no deductions at all. The inside of the oven and the fridge drawers were spotless.",
    "created_at": "2026-06-09T08:09:00-07:00"
  },
  {
    "review_id": "rev_029",
    "booking_id": "bkg_028",
    "listing_id": "lst_017",
    "customer_id": "cst_019",
    "rating": 5,
    "text": "Added a GFCI in the bathroom and sorted a breaker that had been tripping for months. Pulled the permit himself without me having to chase it.",
    "created_at": "2026-06-15T13:41:00-07:00"
  },
  {
    "review_id": "rev_030",
    "booking_id": "bkg_034",
    "listing_id": "lst_039",
    "customer_id": "cst_010",
    "rating": 5,
    "text": "Ten years of grease on top of the cupboards, gone. I did not think that was recoverable and I am still faintly amazed.",
    "created_at": "2026-06-27T13:09:00-07:00"
  },
  {
    "review_id": "rev_031",
    "booking_id": "bkg_036",
    "listing_id": "lst_024",
    "customer_id": "cst_012",
    "rating": 5,
    "text": "Four hours of loading with two of them and a rented truck. Nothing got scratched, they wrapped the dresser and the table tops, and nothing shifted on the drive.",
    "created_at": "2026-06-29T13:26:00-07:00"
  },
  {
    "review_id": "rev_032",
    "booking_id": "bkg_035",
    "listing_id": "lst_010",
    "customer_id": "cst_008",
    "rating": 1,
    "text": "Nothing in this listing was true. Two people came for ninety minutes, did not touch the oven, the windows, or the garage, and told me those all cost extra despite the flat price.",
    "created_at": "2026-07-09T13:09:00-07:00"
  },
  {
    "review_id": "rev_033",
    "booking_id": "bkg_041",
    "listing_id": "lst_008",
    "customer_id": "cst_019",
    "rating": 2,
    "text": "Booked the two hour minimum and she left after seventy minutes with the floors unmopped. The bathroom was done properly, so it was not all bad, but I was charged the full minimum.",
    "created_at": "2026-07-12T20:26:00-07:00"
  },
  {
    "review_id": "rev_034",
    "booking_id": "bkg_040",
    "listing_id": "lst_036",
    "customer_id": "cst_013",
    "rating": 2,
    "text": "Two hours booked, one person who spent most of it on the phone. The shelf is up but it is not level and there are three spare holes in the wall beside it.",
    "created_at": "2026-07-17T20:09:00-07:00"
  },
  {
    "review_id": "rev_035",
    "booking_id": "bkg_038",
    "listing_id": "lst_028",
    "customer_id": "cst_019",
    "rating": 4,
    "text": "The attic was cleared and swept exactly as promised. The flat price was honored, although the crew arrived later than the original window.",
    "created_at": "2026-07-18T20:09:00-07:00"
  },
  {
    "review_id": "rev_036",
    "booking_id": "bkg_048",
    "listing_id": "lst_009",
    "customer_id": "cst_018",
    "rating": 3,
    "text": "The cleaning itself was solid, but the small repairs in the listing were refused unless I accepted a separate quote. Three stars because only half of the combined service was actually honored.",
    "created_at": "2026-07-20T18:41:00-07:00"
  },
  {
    "review_id": "rev_037",
    "booking_id": "bkg_042",
    "listing_id": "lst_010",
    "customer_id": "cst_006",
    "rating": 2,
    "text": "Their support offered a partial credit toward another booking rather than a refund, which is not much use to me. The clean itself was surface level at best.",
    "created_at": "2026-07-21T13:09:00-07:00"
  },
  {
    "review_id": "rev_038",
    "booking_id": "bkg_043",
    "listing_id": "lst_018",
    "customer_id": "cst_013",
    "rating": 4,
    "text": "Fixtures look great. Scheduling took two attempts because an earlier job overran, but she messaged ahead both times rather than leaving me waiting.",
    "created_at": "2026-07-21T20:41:00-07:00"
  },
  {
    "review_id": "rev_039",
    "booking_id": "bkg_050",
    "listing_id": "lst_024",
    "customer_id": "cst_006",
    "rating": 5,
    "text": "They loaded our rented truck carefully, wrapped every finished surface, and stacked it so nothing shifted. Both movers worked steadily for the full booking.",
    "created_at": "2026-07-22T13:26:00-07:00"
  },
  {
    "review_id": "rev_040",
    "booking_id": "bkg_045",
    "listing_id": "lst_006",
    "customer_id": "cst_010",
    "rating": 4,
    "text": "Oven and fridge came out excellent and the racks had clearly been soaked properly. The dishwasher filter got skipped until I asked about it.",
    "created_at": "2026-07-22T18:09:00-07:00"
  },
  {
    "review_id": "rev_041",
    "booking_id": "bkg_047",
    "listing_id": "lst_027",
    "customer_id": "cst_008",
    "rating": 3,
    "text": "The garage clear-out was efficient and most of the sorting went well. I was still upset that one keep box went with the donation load, even though the photos later showed how the mix-up happened.",
    "created_at": "2026-07-22T20:41:00-07:00"
  },
  {
    "review_id": "rev_042",
    "booking_id": "bkg_044",
    "listing_id": "lst_010",
    "customer_id": "cst_001",
    "rating": 1,
    "text": "They arrived hours late, then tried to add separate charges for the oven and windows before starting. The surface clean was rushed and nowhere close to what the flat-price listing promised.",
    "created_at": "2026-07-25T13:41:00-07:00"
  },
  {
    "review_id": "rev_043",
    "booking_id": "bkg_049",
    "listing_id": "lst_036",
    "customer_id": "cst_006",
    "rating": 1,
    "text": "Billed me for a third hour that nobody was here for, then did not respond to two messages asking about it.",
    "created_at": "2026-07-26T13:41:00-07:00"
  },
  {
    "review_id": "rev_044",
    "booking_id": "bkg_051",
    "listing_id": "lst_008",
    "customer_id": "cst_015",
    "rating": 1,
    "text": "She confirmed a Saturday slot, never arrived, and did not answer messages until the Monday. I had cleared the whole morning for it.",
    "created_at": "2026-07-28T18:26:00-07:00"
  },
  {
    "review_id": "rev_045",
    "booking_id": "bkg_046",
    "listing_id": "lst_023",
    "customer_id": "cst_020",
    "rating": 2,
    "text": "Billed three hours for a visit that ran a bit over one. I paid at the time because the water was off and I needed it done.",
    "created_at": "2026-07-31T08:09:00-07:00"
  },
  {
    "review_id": "rev_046",
    "booking_id": "bkg_054",
    "listing_id": "lst_036",
    "customer_id": "cst_008",
    "rating": 2,
    "text": "The work was passable but the person who came was short with me when I asked him to redo the patching. I would not have him back in the house.",
    "created_at": "2026-08-03T20:09:00-07:00"
  },
  {
    "review_id": "rev_047",
    "booking_id": "bkg_052",
    "listing_id": "lst_022",
    "customer_id": "cst_014",
    "rating": 4,
    "text": "The toilet no longer rocks or leaks at the base, and the replacement itself was priced exactly as quoted. The old unit was collected the next afternoon rather than the same day.",
    "created_at": "2026-08-05T08:26:00-07:00"
  },
  {
    "review_id": "rev_048",
    "booking_id": "bkg_057",
    "listing_id": "lst_025",
    "customer_id": "cst_011",
    "rating": 4,
    "text": "Got the couch up two flights without a word of complaint. They were about forty minutes late but messaged to say so.",
    "created_at": "2026-08-05T20:26:00-07:00"
  },
  {
    "review_id": "rev_049",
    "booking_id": "bkg_056",
    "listing_id": "lst_008",
    "customer_id": "cst_010",
    "rating": 2,
    "text": "The provider tried to add a travel fee in chat that appears nowhere on the listing. Support removed it before I was charged, but the clean itself was still rushed.",
    "created_at": "2026-08-08T08:26:00-07:00"
  },
  {
    "review_id": "rev_050",
    "booking_id": "bkg_058",
    "listing_id": "lst_001",
    "customer_id": "cst_015",
    "rating": 5,
    "text": "Third visit on the same schedule now and it is the same standard every time. She takes the recycling down on her way out without being asked.",
    "created_at": "2026-08-08T20:09:00-07:00"
  },
  {
    "review_id": "rev_051",
    "booking_id": "bkg_053",
    "listing_id": "lst_012",
    "customer_id": "cst_002",
    "rating": 4,
    "text": "The TV is level and secure on a plaster wall, and the cable channel looks tidy. He explained the anchor choice before drilling and cleaned up every bit of dust.",
    "created_at": "2026-08-10T20:26:00-07:00"
  },
  {
    "review_id": "rev_052",
    "booking_id": "bkg_060",
    "listing_id": "lst_023",
    "customer_id": "cst_008",
    "rating": 3,
    "text": "She did stop the leak quickly and clearly knew what she was doing. The invoice was the problem, not the plumbing.",
    "created_at": "2026-08-11T18:41:00-07:00"
  }
];

var DB_REPORTS = [
  {
    "report_id": "rpt_001",
    "listing_id": "lst_008",
    "booking_id": "bkg_041",
    "reporter_id": "cst_019",
    "reason": "quality",
    "description": "I booked the two hour minimum and she left after about seventy minutes with the floors not mopped at all. When I asked about it I was told the minimum is the minimum. I was charged the full amount for work that was not finished.",
    "evidence_url": "https://evidence.doorstep.example/rpt_001/invoice.pdf",
    "created_at": "2026-07-14T15:44:00-07:00",
    "risk_level": "medium",
    "status": "resolved"
  },
  {
    "report_id": "rpt_002",
    "listing_id": "lst_008",
    "booking_id": "bkg_091",
    "reporter_id": "cst_020",
    "reason": "no_show",
    "description": "She confirmed a Saturday morning slot and then never arrived or messaged. I waited two hours and had to cancel my own plans for the day. The booking was eventually marked cancelled, but only after I contacted support.",
    "evidence_url": null,
    "created_at": "2026-08-12T19:26:00-07:00",
    "risk_level": "high",
    "status": "open"
  },
  {
    "report_id": "rpt_003",
    "listing_id": "lst_008",
    "booking_id": "bkg_056",
    "reporter_id": "cst_010",
    "reason": "pricing",
    "description": "The listing says forty dollars an hour with a two hour minimum. Before my upcoming booking, the quote sent in chat came to a hundred and forty for the same two hours because of a travel fee that is not mentioned anywhere on the listing. I kept the booking while support reviewed the fee because I still needed the cleaning.",
    "evidence_url": "https://evidence.doorstep.example/rpt_003/chat-transcript.png",
    "created_at": "2026-07-23T11:02:00-07:00",
    "risk_level": "medium",
    "status": "under_review"
  },
  {
    "report_id": "rpt_004",
    "listing_id": "lst_010",
    "booking_id": "bkg_035",
    "reporter_id": "cst_008",
    "reason": "misleading_listing",
    "description": "The listing advertises oven, fridge, baseboards, windows and garage at one flat price for any size home. The crew did none of those and said each one was an add-on. Ninety nine dollars for ninety minutes of surface wiping is not what was described.",
    "evidence_url": "https://evidence.doorstep.example/rpt_004/listing-screenshot.png",
    "created_at": "2026-07-10T11:44:00-07:00",
    "risk_level": "high",
    "status": "resolved"
  },
  {
    "report_id": "rpt_005",
    "listing_id": "lst_010",
    "booking_id": "bkg_044",
    "reporter_id": "cst_001",
    "reason": "pricing",
    "description": "Same flat price advertised, but I was quoted three separate add-on fees on the doorstep before they would start. It felt like the price on the listing exists only to get them through the door.",
    "evidence_url": "https://evidence.doorstep.example/rpt_005/addon-quote.pdf",
    "created_at": "2026-07-23T09:26:00-07:00",
    "risk_level": "high",
    "status": "resolved"
  },
  {
    "report_id": "rpt_006",
    "listing_id": "lst_036",
    "booking_id": "bkg_040",
    "reporter_id": "cst_013",
    "reason": "conduct",
    "description": "The worker spent most of the visit on personal calls and got short with me when I pointed out the shelf was not level. He left three extra holes in the wall and did not patch them. I did not feel comfortable asking him to redo it.",
    "evidence_url": "https://evidence.doorstep.example/rpt_006/wall-damage.jpg",
    "created_at": "2026-07-15T19:26:00-07:00",
    "risk_level": "high",
    "status": "resolved"
  },
  {
    "report_id": "rpt_007",
    "listing_id": "lst_036",
    "booking_id": "bkg_049",
    "reporter_id": "cst_006",
    "reason": "quality",
    "description": "Booked two hours of general handyman work and almost nothing on my list got finished. The blind is hanging crooked and the door still does not close. I have asked twice for someone to come back and had no reply.",
    "evidence_url": null,
    "created_at": "2026-07-25T19:44:00-07:00",
    "risk_level": "medium",
    "status": "resolved"
  },
  {
    "report_id": "rpt_008",
    "listing_id": "lst_023",
    "booking_id": "bkg_046",
    "reporter_id": "cst_020",
    "reason": "pricing",
    "description": "This was billed as an hourly emergency callout. She was at my house from about four to a little after five, and the invoice charged three hours at the published hourly rate. I paid at the time because the water was off and I needed it done.",
    "evidence_url": "https://evidence.doorstep.example/rpt_008/invoice.pdf",
    "created_at": "2026-07-31T09:02:00-07:00",
    "risk_level": "critical",
    "status": "resolved"
  },
  {
    "report_id": "rpt_009",
    "listing_id": "lst_027",
    "booking_id": "bkg_047",
    "reporter_id": "cst_008",
    "reason": "quality",
    "description": "The garage clear-out took nearly twice the estimate, which I could live with, but a box I had clearly labelled as keep went out with the donation load. It had my grandfather's tools in it and there is no getting them back.",
    "evidence_url": "https://evidence.doorstep.example/rpt_009/labelled-box.jpg",
    "created_at": "2026-07-20T15:44:00-07:00",
    "risk_level": "low",
    "status": "dismissed"
  },
  {
    "report_id": "rpt_010",
    "listing_id": "lst_022",
    "booking_id": "bkg_052",
    "reporter_id": "cst_014",
    "reason": "safety",
    "description": "The old toilet was left on my front walkway overnight with the bolts still sticking out of the base, and my kids use that path to get to the street. It was collected the next afternoon but it should not have been left there at all.",
    "evidence_url": "https://evidence.doorstep.example/rpt_010/walkway.jpg",
    "created_at": "2026-08-11T15:26:00-07:00",
    "risk_level": "low",
    "status": "dismissed"
  },
  {
    "report_id": "rpt_011",
    "listing_id": "lst_029",
    "booking_id": "bkg_055",
    "reporter_id": "cst_013",
    "reason": "no_show",
    "description": "I put the couch and two boxes at the curb for the agreed morning window and nothing was collected. The couch sat out in the rain all day and my building manager has now billed me for it.",
    "evidence_url": null,
    "created_at": "2026-07-30T09:26:00-07:00",
    "risk_level": "high",
    "status": "open"
  },
  {
    "report_id": "rpt_012",
    "listing_id": "lst_009",
    "booking_id": "bkg_048",
    "reporter_id": "cst_018",
    "reason": "misleading_listing",
    "description": "The listing says cleaning and small repairs in one visit at one hourly rate. On the day I was told repairs are quoted separately and only the cleaning was covered by the rate I booked. That is not how the description reads.",
    "evidence_url": "https://evidence.doorstep.example/rpt_012/listing-screenshot.png",
    "created_at": "2026-07-22T19:26:00-07:00",
    "risk_level": "medium",
    "status": "under_review"
  }
];

var DB_MODERATION_ACTIONS = [
  {
    "action_id": "mod_001",
    "report_id": "rpt_004",
    "listing_id": "lst_010",
    "admin_name": "Renata Voss",
    "action": "suspend",
    "risk_level": "high",
    "reason": "Listing copy promises oven, fridge, window and garage cleaning at a flat rate the provider does not honour, and this is not the first complaint of that shape. Listing suspended pending a rewrite and a refund to the customer.",
    "created_at": "2026-07-12T16:51:00-07:00"
  },
  {
    "action_id": "mod_002",
    "report_id": "rpt_005",
    "listing_id": "lst_010",
    "admin_name": "Renata Voss",
    "action": "resolve",
    "risk_level": "high",
    "reason": "Second pricing complaint against a listing already suspended under rpt_004. No further action needed on the listing itself; refund confirmed and the case is closed against the existing suspension.",
    "created_at": "2026-07-26T14:22:00-07:00"
  },
  {
    "action_id": "mod_003",
    "report_id": "rpt_006",
    "listing_id": "lst_036",
    "admin_name": "Renata Voss",
    "action": "suspend",
    "risk_level": "high",
    "reason": "Conduct complaint is credible and the provider account already has one suspended listing for misrepresentation. Suspending this listing as well and escalating the provider account for review.",
    "created_at": "2026-07-18T16:08:00-07:00"
  },
  {
    "action_id": "mod_004",
    "report_id": "rpt_007",
    "listing_id": "lst_036",
    "admin_name": "Desmond Achebe",
    "action": "resolve",
    "risk_level": "medium",
    "reason": "Quality complaint on an already suspended listing. Recorded against the provider file and closed; the suspension from mod_003 remains the operative action.",
    "created_at": "2026-07-29T16:22:00-07:00"
  },
  {
    "action_id": "mod_005",
    "report_id": "rpt_008",
    "listing_id": "lst_023",
    "admin_name": "Desmond Achebe",
    "action": "suspend",
    "risk_level": "critical",
    "reason": "Invoice supplied by the customer shows three billed hours against a documented one hour visit. Listing suspended and the provider has been instructed to refund the two excess hours.",
    "created_at": "2026-08-04T16:08:00-07:00"
  },
  {
    "action_id": "mod_006",
    "report_id": "rpt_009",
    "listing_id": "lst_027",
    "admin_name": "Desmond Achebe",
    "action": "dismiss",
    "risk_level": "low",
    "reason": "The provider produced photos of the sorted piles and the customer's own message approving the donation load. This reads as a genuine mistake rather than a policy breach, so no action against the listing.",
    "created_at": "2026-07-23T10:22:00-07:00"
  },
  {
    "action_id": "mod_007",
    "report_id": "rpt_001",
    "listing_id": "lst_008",
    "admin_name": "Priyanka Shah",
    "action": "warn",
    "risk_level": "medium",
    "reason": "First substantiated complaint on this listing. Provider warned about charging the full minimum for an unfinished visit and told that a repeat will suspend the listing.",
    "created_at": "2026-07-17T16:08:00-07:00"
  },
  {
    "action_id": "mod_008",
    "report_id": "rpt_010",
    "listing_id": "lst_022",
    "admin_name": "Priyanka Shah",
    "action": "dismiss",
    "risk_level": "low",
    "reason": "Provider confirmed the haul-away was scheduled for the following day and the customer was notified at booking. Poor placement rather than a safety breach; provider reminded to keep walkways clear.",
    "created_at": "2026-08-13T16:22:00-07:00"
  },
  {
    "action_id": "mod_009",
    "report_id": "rpt_008",
    "listing_id": "lst_023",
    "admin_name": "Desmond Achebe",
    "action": "warn",
    "risk_level": "critical",
    "reason": "Formal provider-account warning issued after the verified emergency-callout overbilling. Any repeat pricing complaint will trigger account-level suspension.",
    "created_at": "2026-08-05T10:22:00-07:00"
  }
];

var DB_EXAMPLE_QUERIES = [
  {
    "query_id": "qry_001",
    "query": "The inside of my oven is disgusting and I have a landlord inspection on Friday.",
    "expected_codes": [
      "cleaning_deep"
    ],
    "expected_listing_ids": [
      "lst_006",
      "lst_003"
    ],
    "match_type": "single_code",
    "notes": "Appliance interiors are the strongest signal here. lst_006 is the exact fit; lst_003 is an acceptable broader match."
  },
  {
    "query_id": "qry_002",
    "query": "Looking for someone to come every other week and clean my one bedroom.",
    "expected_codes": [
      "cleaning_standard"
    ],
    "expected_listing_ids": [
      "lst_001"
    ],
    "match_type": "single_code",
    "notes": "Recurring language is decisive: lst_001 explicitly advertises weekly or biweekly service. Small-unit language alone is not enough to make lst_008 a recurring-cleaning match."
  },
  {
    "query_id": "qry_003",
    "query": "Moving out of my apartment on Saturday and I need it cleaned well enough to get my deposit back.",
    "expected_codes": [
      "cleaning_deep"
    ],
    "expected_listing_ids": [
      "lst_003",
      "lst_039"
    ],
    "match_type": "single_code",
    "notes": "Deposit and move-out wording should beat generic cleaning. lst_039 also covers the load-out."
  },
  {
    "query_id": "qry_004",
    "query": "I have three IKEA wardrobes sitting in boxes that I am never going to build myself.",
    "expected_codes": [
      "handyman_general"
    ],
    "expected_listing_ids": [
      "lst_011"
    ],
    "match_type": "single_code",
    "notes": "Flat-pack assembly is named directly in the listing description."
  },
  {
    "query_id": "qry_005",
    "query": "Want a TV mounted above the fireplace, the wall is plaster.",
    "expected_codes": [
      "handyman_general"
    ],
    "expected_listing_ids": [
      "lst_012"
    ],
    "match_type": "single_code",
    "notes": "Mounting plus a wall-type detail the description explicitly addresses."
  },
  {
    "query_id": "qry_006",
    "query": "Kitchen tap drips constantly and the shutoff valve underneath is seized.",
    "expected_codes": [
      "plumbing"
    ],
    "expected_listing_ids": [
      "lst_019"
    ],
    "match_type": "single_code",
    "notes": "Seized shutoff is called out verbatim in the listing description."
  },
  {
    "query_id": "qry_007",
    "query": "Bathroom sink is draining really slowly and the plunger is not helping.",
    "expected_codes": [
      "plumbing"
    ],
    "expected_listing_ids": [
      "lst_020"
    ],
    "match_type": "single_code",
    "notes": "Drain-specific. Should not match the faucet listing."
  },
  {
    "query_id": "qry_008",
    "query": "Toilet runs all night and rocks when you sit on it.",
    "expected_codes": [
      "plumbing"
    ],
    "expected_listing_ids": [
      "lst_022"
    ],
    "match_type": "single_code",
    "notes": "Both symptoms appear in the listing description."
  },
  {
    "query_id": "qry_009",
    "query": "Half the outlets in my living room stopped working at once.",
    "expected_codes": [
      "electrical"
    ],
    "expected_listing_ids": [
      "lst_017"
    ],
    "match_type": "single_code",
    "notes": "Dead circuit tracing rather than outlet replacement. lst_015 is a weaker match and should rank below."
  },
  {
    "query_id": "qry_010",
    "query": "I want a ceiling fan put in where the old light fixture is.",
    "expected_codes": [
      "handyman_general",
      "electrical"
    ],
    "expected_listing_ids": [
      "lst_013"
    ],
    "match_type": "multi_code",
    "notes": "Genuinely spans both codes. The listing carries both and should win over pure-electrical listings."
  },
  {
    "query_id": "qry_011",
    "query": "Need two guys to help load a U-Haul on Sunday, I have the truck already.",
    "expected_codes": [
      "moving_help"
    ],
    "expected_listing_ids": [
      "lst_024"
    ],
    "match_type": "single_code",
    "notes": "Customer supplying the vehicle is the distinguishing detail."
  },
  {
    "query_id": "qry_012",
    "query": "Moving from apartment 2B to 5A in the same building, no truck needed.",
    "expected_codes": [
      "moving_help"
    ],
    "expected_listing_ids": [
      "lst_025"
    ],
    "match_type": "single_code",
    "notes": "In-building move. Should not match the two-mover truck listing."
  },
  {
    "query_id": "qry_013",
    "query": "The garage is full of junk and whatever is worth keeping needs to go to a storage unit.",
    "expected_codes": [
      "junk_removal",
      "moving_help"
    ],
    "expected_listing_ids": [
      "lst_027"
    ],
    "match_type": "multi_code",
    "notes": "Classic mixed job. lst_040 covers this too but is paused, so it must not be returned."
  },
  {
    "query_id": "qry_014",
    "query": "An old couch and a mattress need to disappear, I can put them at the curb.",
    "expected_codes": [
      "junk_removal"
    ],
    "expected_listing_ids": [
      "lst_029"
    ],
    "match_type": "single_code",
    "notes": "Curbside is the key qualifier and keeps the price down."
  },
  {
    "query_id": "qry_015",
    "query": "Basement is full of boxes from when my dad passed away and I cannot face it.",
    "expected_codes": [
      "junk_removal"
    ],
    "expected_listing_ids": [
      "lst_028"
    ],
    "match_type": "single_code",
    "notes": "Emotionally loaded phrasing with a clear service need. Tone of the reply matters here."
  },
  {
    "query_id": "qry_016",
    "query": "Gutters are overflowing and there are leaves all over the lawn.",
    "expected_codes": [
      "yard_outdoor"
    ],
    "expected_listing_ids": [
      "lst_032"
    ],
    "match_type": "single_code",
    "notes": "Both tasks are in a single listing."
  },
  {
    "query_id": "qry_017",
    "query": "Grass is knee high and the strip by the sidewalk looks feral.",
    "expected_codes": [
      "yard_outdoor"
    ],
    "expected_listing_ids": [
      "lst_033"
    ],
    "match_type": "single_code",
    "notes": "Mow plus edge. Colloquial phrasing with no service words in it."
  },
  {
    "query_id": "qry_018",
    "query": "My deck has gone green with moss over the winter.",
    "expected_codes": [
      "yard_outdoor"
    ],
    "expected_listing_ids": [
      "lst_034"
    ],
    "match_type": "single_code",
    "notes": "Pressure washing. The description names moss pre-treatment specifically."
  },
  {
    "query_id": "qry_019",
    "query": "Need a few things fixed around the flat and then the old furniture taken away.",
    "expected_codes": [
      "handyman_general",
      "junk_removal"
    ],
    "expected_listing_ids": [
      "lst_030"
    ],
    "match_type": "multi_code",
    "notes": "Repairs plus haul-away in one visit. Should beat two separate single-code listings."
  },
  {
    "query_id": "qry_020",
    "query": "My sink is a mess.",
    "expected_codes": [
      "cleaning_standard",
      "plumbing"
    ],
    "expected_listing_ids": [],
    "match_type": "ambiguous",
    "notes": "Do not match. 'Mess' could be dirty or blocked. Ask whether the sink is draining before recommending anything."
  },
  {
    "query_id": "qry_021",
    "query": "I need help with my kitchen.",
    "expected_codes": [
      "cleaning_standard",
      "cleaning_deep",
      "handyman_general",
      "plumbing",
      "electrical"
    ],
    "expected_listing_ids": [],
    "match_type": "ambiguous",
    "notes": "Five plausible codes. Ask what is actually wrong rather than guessing at the most expensive one."
  },
  {
    "query_id": "qry_022",
    "query": "Can someone paint the exterior of my house?",
    "expected_codes": [],
    "expected_listing_ids": [],
    "match_type": "no_match",
    "notes": "Painting is not in the service vocabulary. Say so plainly instead of pushing the handyman listings."
  },
  {
    "query_id": "qry_023",
    "query": "My kitchen sink is leaking and the drain is slow.",
    "expected_codes": [
      "plumbing"
    ],
    "expected_listing_ids": [
      "lst_020"
    ],
    "match_type": "single_code",
    "notes": "Both symptoms matter. lst_020 explicitly covers a slow sink drain and a leaking trap or tailpiece in the same visit."
  },
  {
    "query_id": "qry_024",
    "query": "Two light fixtures need replacing and a switch is loose.",
    "expected_codes": [
      "electrical"
    ],
    "expected_listing_ids": [
      "lst_016"
    ],
    "match_type": "single_code",
    "notes": "lst_016 installs up to three fixtures and explicitly covers a loose or worn controlling switch in the same appointment."
  },
  {
    "query_id": "qry_025",
    "query": "Hang a TV and put together an IKEA dresser.",
    "expected_codes": [
      "handyman_general"
    ],
    "expected_listing_ids": [
      "lst_011"
    ],
    "match_type": "single_code",
    "notes": "lst_011 explicitly covers flat-pack dressers and TV wall mounting in one visit."
  }
];


async function initData() {
    try {
        const fetchJson = async (file) => {
            // Try relative path from mock-data/ first (works on Vercel and local static servers)
            try {
                const res = await fetch('./mock-data/' + file);
                if (res.ok) return await res.json();
            } catch (e) {}

            try {
                const res = await fetch('../mock-data/' + file);
                if (res.ok) return await res.json();
            } catch (e) {}

            // Fallback to GitHub raw main branch
            try {
                const url = 'https://raw.githubusercontent.com/JianTing-Li/doorstep/main/mock-data/' + file;
                const res = await fetch(url);
                if (res.ok) return await res.json();
            } catch (e) {}

            return null;
        };

        const [fetchedListings, fetchedProviders, fetchedServiceTypes, fetchedNeighborhoods, fetchedCustomers] = await Promise.all([
            fetchJson('listings.json'),
            fetchJson('providers.json'),
            fetchJson('service-types.json'),
            fetchJson('neighborhoods.json'),
            fetchJson('customers.json')
        ]);

        if (fetchedListings && fetchedListings.length > 0) DB_LISTINGS = fetchedListings;
        if (fetchedProviders && fetchedProviders.length > 0) DB_PROVIDERS = fetchedProviders;
        if (fetchedServiceTypes && fetchedServiceTypes.length > 0) DB_SERVICE_TYPES = fetchedServiceTypes;
        if (fetchedNeighborhoods && fetchedNeighborhoods.length > 0) DB_NEIGHBORHOODS = fetchedNeighborhoods;
        if (fetchedCustomers && fetchedCustomers.length > 0) DB_CUSTOMERS = fetchedCustomers;

    } catch (err) {
        console.warn('Network fetch for mock-data failed, using pre-embedded dataset:', err);
    }

    if (typeof window !== 'undefined') {
        window.DB_META = DB_META;
        window.DB_NEIGHBORHOODS = DB_NEIGHBORHOODS;
        window.DB_LISTINGS = DB_LISTINGS;
        window.DB_PROVIDERS = DB_PROVIDERS;
        window.DB_SERVICE_TYPES = DB_SERVICE_TYPES;
        window.DB_CUSTOMERS = DB_CUSTOMERS;
        window.DB_BOOKINGS = DB_BOOKINGS;
        window.DB_REVIEWS = DB_REVIEWS;
        window.DB_REPORTS = DB_REPORTS;
        window.DB_MODERATION_ACTIONS = DB_MODERATION_ACTIONS;
        window.DB_EXAMPLE_QUERIES = DB_EXAMPLE_QUERIES;
    }

    console.log('Doorstep data ready:', {
        listings: DB_LISTINGS.length,
        providers: DB_PROVIDERS.length,
        serviceTypes: DB_SERVICE_TYPES.length,
        neighborhoods: DB_NEIGHBORHOODS.length
    });

    return true;
}

if (typeof window !== 'undefined') {
    window.DB_META = typeof DB_META !== 'undefined' ? DB_META : {};
    window.DB_NEIGHBORHOODS = typeof DB_NEIGHBORHOODS !== 'undefined' ? DB_NEIGHBORHOODS : [];
    window.DB_LISTINGS = typeof DB_LISTINGS !== 'undefined' ? DB_LISTINGS : [];
    window.DB_PROVIDERS = typeof DB_PROVIDERS !== 'undefined' ? DB_PROVIDERS : [];
    window.DB_SERVICE_TYPES = typeof DB_SERVICE_TYPES !== 'undefined' ? DB_SERVICE_TYPES : [];
    window.DB_CUSTOMERS = typeof DB_CUSTOMERS !== 'undefined' ? DB_CUSTOMERS : [];
    window.DB_BOOKINGS = typeof DB_BOOKINGS !== 'undefined' ? DB_BOOKINGS : [];
    window.DB_REVIEWS = typeof DB_REVIEWS !== 'undefined' ? DB_REVIEWS : [];
    window.DB_REPORTS = typeof DB_REPORTS !== 'undefined' ? DB_REPORTS : [];
    window.DB_MODERATION_ACTIONS = typeof DB_MODERATION_ACTIONS !== 'undefined' ? DB_MODERATION_ACTIONS : [];
    window.DB_EXAMPLE_QUERIES = typeof DB_EXAMPLE_QUERIES !== 'undefined' ? DB_EXAMPLE_QUERIES : [];
    window.initData = initData;
}
