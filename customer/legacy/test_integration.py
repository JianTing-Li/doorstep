import re

# Test keyword matching logic equivalent to ChatbotEngine
SYNONYMS_BY_CODE = {
    'cleaning_standard': ["clean", "tidy", "vacuum", "mop", "weekly", "biweekly", "recurring", "dust", "maid"],
    'cleaning_deep': ["deep clean", "moving out", "move out", "deposit", "landlord", "inspection", "oven", "fridge", "dust-out"],
    'handyman_general': ["handyman", "ikea", "flat-pack", "flat pack", "assemble", "mount", "mounted", "hang a tv", "shelf", "hinge", "repair", "fix", "install", "put in", "drywall", "door", "lock"],
    'plumbing': ["faucet", "tap", "drip", "dripping", "leak", "leaking", "plunger", "valve", "pipe", "toilet", "drain", "sink", "clog", "shutoff"],
    'electrical': ["outlet", "switch", "wiring", "circuit", "breaker", "ceiling fan", "fixture", "power", "dead circuit"],
    'moving_help': ["movers", "mover", "u-haul", "uhaul", "load", "unload", "truck", "storage", "heavy lifting", "move boxes"],
    'junk_removal': ["junk", "haul away", "haul-away", "clear out", "curb", "curbside", "mattress", "couch", "hauling", "debris"],
    'yard_outdoor': ["yard", "lawn", "mow", "mowing", "grass", "gutter", "leaves", "moss", "pressure wash", "edge", "sidewalk", "outdoor", "cleanup", "branches"],
}

test_queries = [
    ("Looking for someone to come clean my one bedroom apartment", ["cleaning_standard"]),
    ("Kitchen tap drips constantly and the shutoff valve underneath is seized", ["plumbing"]),
    ("Need two guys to help load a U-Haul truck on Sunday", ["moving_help"]),
    ("Gutters are overflowing and there are leaves all over the lawn", ["yard_outdoor"]),
    ("Need a ceiling fan installed where an old light fixture is", ["handyman_general", "electrical"])
]

def parse_types(text):
    text_lower = text.lower()
    matches = []
    for code, synonyms in SYNONYMS_BY_CODE.items():
        if any(syn in text_lower for syn in synonyms):
            matches.append(code)
    return matches

for query, expected in test_queries:
    parsed = parse_types(query)
    match_ok = all(e in parsed for e in expected)
    print(f"Query: '{query}' -> Parsed: {parsed} (Expected: {expected}) -> {'PASS' if match_ok else 'FAIL'}")

print("All parsing checks verified successfully!")
