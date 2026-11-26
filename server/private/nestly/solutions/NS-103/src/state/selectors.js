/**
 * Derived data: filtering, sorting, pagination and the favourites list.
 */

import { averageRating } from '../lib/format.js';

/**
 * Returns the listings that match the search filters.
 * @param {object[]} listings
 * @param {{query?: string, minPrice?: number|null, maxPrice?: number|null, guests?: number, amenities?: string[]}} filters
 * @returns {object[]}
 */
export function filterListings(listings, filters) {
  const query = (filters.query ?? '').trim().toLowerCase();
  const wanted = filters.amenities ?? [];
  return listings.filter((listing) => {
    if (query && !`${listing.title} ${listing.city}`.toLowerCase().includes(query)) return false;
    if (filters.minPrice != null && listing.pricePerNight < filters.minPrice) return false;
    if (filters.maxPrice != null && listing.pricePerNight > filters.maxPrice) return false;
    if (filters.guests && listing.maxGuests < filters.guests) return false;
    if (wanted.length > 0 && !wanted.every((amenity) => listing.amenities.includes(amenity))) return false;
    return true;
  });
}

/**
 * Returns a sorted copy of the listings.
 * @param {object[]} listings
 * @param {'recommended'|'price-asc'|'price-desc'|'rating'} sort
 * @returns {object[]}
 */
export function sortListings(listings, sort) {
  const copy = [...listings];
  if (sort === 'price-asc') copy.sort((a, b) => a.pricePerNight - b.pricePerNight);
  else if (sort === 'price-desc') copy.sort((a, b) => b.pricePerNight - a.pricePerNight);
  else if (sort === 'rating') copy.sort((a, b) => (averageRating(b.reviews) ?? 0) - (averageRating(a.reviews) ?? 0));
  return copy;
}

/**
 * Returns one page of items (pages start at 1) plus paging info.
 * @template T
 * @param {T[]} items
 * @param {number} page
 * @param {number} pageSize
 * @returns {{items: T[], page: number, totalPages: number}}
 */
export function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: current, totalPages };
}

const favouriteCache = new WeakMap();

/**
 * Listings the guest has saved, in the order they were saved. Cached per favourites list.
 * @param {{favourites: string[]}} state
 * @param {object[]} listings
 * @returns {object[]}
 */
export function selectFavouriteListings(state, listings) {
  const cached = favouriteCache.get(state.favourites);
  if (cached && cached.listings === listings) return cached.result;
  const result = state.favourites
    .map((id) => listings.find((listing) => listing.id === id))
    .filter(Boolean);
  favouriteCache.set(state.favourites, { listings, result });
  return result;
}
