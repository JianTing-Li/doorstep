# Doorstep
A two-sided local marketplace for home services. It connects independent home-service providers like
cleaners, handymen, and movers with customers in the same city. Doorstep
does not employ providers. It takes a percentage of each booking made
through the platform.

## Products

Doorstep is built as four standalone products, each owned by one developer:

### Provider App (Product A)
Providers create listings describing a specific service, set a price, and
manage incoming bookings.

### Customer App (Product B)
Customers browse and filter listings by service type, price, and
availability, and book directly.

### Matching Chatbot (Product C)
Customers describe a job in their own words and get matched to the current
listings that best fit for jobs that don't map cleanly onto one service type.

### Trust & Safety Dashboard (Product D)
The internal team sees listings and bookings with reviews or reports
attached, with risky ones flagged for review.

## Architecture

Each product runs standalone with its own mock data. The only shared
dependency is a common service type vocabulary, so listings and searches
line up across products.

## Developers

- Jian Ting Li — Matching Chatbot
- Ibtisam Hossain — Provider App
- Abheeshu Dhungana — Customer App
- Kamal Mohamed — Trust and Security Dashboard
