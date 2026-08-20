// Embedded Self-Contained Dataset for Doorstep App
// 100% Zero-Fetch, Instant Load, and CORS-Proof for Vercel / Local

let DB_LISTINGS = [
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
let DB_PROVIDERS = [
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
let DB_SERVICE_TYPES = [
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

let DB_CUSTOMERS = [
  {
    "customer_id": "cust_00001",
    "name": "Maya Lin",
    "email": "maya.lin1@example.invalid",
    "phone_number": "9175551000",
    "address": "1420 NW Lovejoy St, Apt 3B, Portland, OR",
    "avatar_color": "from-blue-500 to-indigo-600",
    "member_since": "2026-01-02"
  },
  {
    "customer_id": "cust_00002",
    "name": "Luis Rivera",
    "email": "luis.rivera2@example.invalid",
    "phone_number": "9175551001",
    "address": "825 SE Hawthorne Blvd, Portland, OR",
    "avatar_color": "from-emerald-500 to-teal-600",
    "member_since": "2026-02-03"
  },
  {
    "customer_id": "cust_00003",
    "name": "Priya Shah",
    "email": "priya.shah3@example.invalid",
    "phone_number": "9175551002",
    "address": "2104 NE Alberta St, Portland, OR",
    "avatar_color": "from-purple-500 to-pink-600",
    "member_since": "2026-03-04"
  },
  {
    "customer_id": "cust_00004",
    "name": "Omar Haddad",
    "email": "omar.haddad4@example.invalid",
    "phone_number": "9175551003",
    "address": "1830 NW 23rd Ave, Portland, OR",
    "avatar_color": "from-amber-500 to-orange-600",
    "member_since": "2026-04-05"
  },
  {
    "customer_id": "cust_00005",
    "name": "Mei Chen",
    "email": "mei.chen5@example.invalid",
    "phone_number": "9175551004",
    "address": "3312 SE Division St, Portland, OR",
    "avatar_color": "from-rose-500 to-red-600",
    "member_since": "2026-05-06"
  }
];

async function initData() {
    // Data is directly embedded in memory for zero-latency instant loading
    return true;
}

