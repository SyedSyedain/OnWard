/**
 * Factory helpers so every test builds its own fresh data.
 */

export function makeReview(overrides = {}) {
  return { author: 'Guest', rating: 4, text: 'Nice stay.', ...overrides };
}

export function makeListing(overrides = {}) {
  return {
    id: 'l-test',
    title: 'Test Flat',
    city: 'Pune',
    pricePerNight: 800,
    cleaningFee: 200,
    maxGuests: 4,
    description: 'A test flat.',
    amenities: ['wifi'],
    reviews: [makeReview({ rating: 4 }), makeReview({ rating: 5 })],
    ...overrides,
  };
}

export function makeListings() {
  return [
    makeListing({ id: 'a', title: 'Alpha Studio', city: 'Goa', pricePerNight: 500, maxGuests: 2, amenities: ['wifi', 'pool'], reviews: [] }),
    makeListing({ id: 'b', title: 'Bravo House', city: 'Pune', pricePerNight: 900, maxGuests: 4, amenities: ['wifi', 'kitchen'] }),
    makeListing({ id: 'c', title: 'Charlie Villa', city: 'Goa', pricePerNight: 1500, maxGuests: 8, amenities: ['wifi', 'pool', 'kitchen'] }),
  ];
}

export function makeStay(overrides = {}) {
  return { checkIn: '2026-03-10', checkOut: '2026-03-13', guests: 2, ...overrides };
}

export const TODAY = '2026-03-01';
