/**
 * Sample data for trying the library out by hand.
 */

export const seedBooks = [
  { id: 'b-algo', title: 'Introduction to Algorithms', author: 'Cormen', priceInPaise: 120000 },
  { id: 'b-sicp', title: 'Structure and Interpretation of Computer Programs', author: 'Abelson', priceInPaise: 85000 },
  { id: 'b-pragmatic', title: 'The Pragmatic Programmer', author: 'Hunt', priceInPaise: 60000 },
];

export const seedCopies = [
  { id: 'copy-a1', bookId: 'b-algo', status: 'available' },
  { id: 'copy-a2', bookId: 'b-algo', status: 'available' },
  { id: 'copy-s1', bookId: 'b-sicp', status: 'available' },
  { id: 'copy-p1', bookId: 'b-pragmatic', status: 'available' },
];

export const seedMembers = [
  { id: 'm-asha', name: 'Asha Rao', type: 'student', borrowLimit: 3 },
  { id: 'm-ravi', name: 'Dr. Ravi Menon', type: 'faculty', borrowLimit: 6 },
];
