/**
 * Copy and sample data for the home page, kept in one place so the
 * components only deal with layout and behaviour.
 *
 * The bench demo uses an example ticket that is not part of any simulation,
 * so the home page never reveals a real task's answer.
 */

export const NAV_LINKS = [
  { id: 'flow', label: 'How it works' },
  { id: 'team', label: 'Team' },
  { id: 'roles', label: 'Roles' },
  { id: 'record', label: 'Record' },
];

export const DEMO_TICKET = {
  id: 'SS-214',
  title: 'Coupons can be applied twice',
  cells: [
    { label: 'Area', value: 'Checkout' },
    { label: 'Difficulty', value: 'Medium' },
    { label: 'From', value: 'Manager' },
    { label: 'Checks', value: '3' },
  ],
};

/** Each line: text, and an optional change ("removed" or "added"). */
export const DEMO_CODE = [
  { text: 'export function applyCoupon(cart, coupon) {' },
  { text: '  cart.discounts.push(coupon);', change: 'removed' },
  { text: '  if (cart.discounts.some((d) => d.code === coupon.code)) {', change: 'added' },
  { text: "    throw new ConflictError('Coupon already applied.');", change: 'added' },
  { text: '  }', change: 'added' },
  { text: '  cart.discounts.push(coupon);', change: 'added' },
  { text: '  return cart;' },
  { text: '}' },
];

/** The hero's step guide; each step lights up with the matching part of the demo. */
export const HERO_STEPS = ['Read the ticket', 'Fix the code', 'Pass hidden checks'];

export const DEMO_CHECKS = ['one coupon applies', 'a second use is refused', 'expired ones still fail'];

/**
 * The three AI colleagues, in the order a student meets them.
 * Each has an opening line and a few questions a visitor can try.
 * Answers use the made-up SS-214 ticket, never a real ShopSphere task.
 */
export const TEAM = [
  {
    id: 'manager',
    name: 'Manager',
    role: 'Engineering Manager',
    when: 'Before you code',
    cantSee: 'your code or the hidden tests',
    intro: 'SS-214 is yours: coupons apply twice. Ask me what it should do.',
    prompts: [
      {
        q: 'Can I stack two coupons?',
        a: 'No. One coupon per order. Refuse the second with a clear error.',
      },
      { q: 'Where is the bug?', a: 'That part is your job. I can tell you what customers expect, not the code.' },
      { q: 'When is it done?', a: 'When all three acceptance checks pass.' },
    ],
  },
  {
    id: 'teammate',
    name: 'Teammate',
    role: 'Senior developer',
    when: 'While you code',
    cantSee: 'the answer or the hidden tests',
    intro: 'Stuck? Tell me what you tried. Each hint goes one level deeper.',
    prompts: [
      {
        q: 'Why do the tests fail?',
        a: 'What does the cart already hold before you add the coupon?',
        hint: true,
      },
      { q: 'Still stuck.', a: 'Open applyCoupon. Does anything check for a duplicate code?', hint: true },
      {
        q: 'Just give me the fix.',
        a: 'Not the fix, but a last nudge: check first, and throw if it is already there.',
        hint: true,
      },
    ],
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    role: 'Code reviewer',
    when: 'After the tests',
    cantSee: 'the hidden test code',
    intro: 'Your checks ran: 3 of 3 pass. Ask me about the change.',
    prompts: [
      { q: 'Review my change.', a: 'Focused, and the error matches the code around it. Nicely done.' },
      { q: 'What could be better?', a: 'Add a test for the duplicate case, so the bug can’t come back.' },
      { q: 'Can you raise my score?', a: 'No. The tests decide the outcome. I only explain it.' },
    ],
  },
];

export const HINT_LIMIT = 4;

export const ROLES = [
  { id: 'frontend-developer', title: 'Frontend developer', line: 'Components, state, accessibility.', open: true },
  { id: 'backend-developer', title: 'Backend developer', line: 'APIs, rules and consistent data.', open: true },
  { id: 'data-analyst', title: 'Data analyst', line: 'Queries that answer one question.', open: false },
  { id: 'devops-engineer', title: 'DevOps engineer', line: 'Pipelines, deploys, alerts.', open: false },
];

export const SAMPLE_RECORD = {
  name: 'Example Student',
  role: 'Backend developer',
  simulation: 'ShopSphere',
  task: 'SS-214, Coupons can be applied twice',
  score: 88,
  tamperedScore: 100,
  facts: [
    { label: 'Tests passed', value: '12 / 12' },
    { label: 'Checks', value: '3 / 3' },
    { label: 'Hint level used', value: '1 of 4' },
    { label: 'Time spent', value: '34 min' },
  ],
};

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

/** The five stops of a session, shown as the flow overview. */
export const FLOW = [
  { id: 'ticket', title: 'Ticket', line: 'A real bug, assigned.' },
  { id: 'code', title: 'Codebase', line: 'Code you didn’t write.' },
  { id: 'hints', title: 'Teammate', line: 'One hint at a time.' },
  { id: 'tests', title: 'Tests', line: 'Hidden checks decide.' },
  { id: 'record', title: 'Record', line: 'Signed and shareable.' },
];

/** One light line under each section heading, saying what that part of the page is for. */
export const SECTION_NOTES = {
  flow: 'What happens in one simulation, from the ticket to a signed record.',
  team: 'Three AI colleagues, each with one job. None of them writes your fix.',
  roles: 'Each role has its own codebases. Frontend and backend are open today.',
  record: 'Pass the hidden checks and get a signed record to share.',
};

/** The three ShopSphere tickets, by area and difficulty. */
export const TICKETS = [
  { id: 'SS-101', area: 'Product catalogue', difficulty: 'easy', label: 'Easy' },
  { id: 'SS-102', area: 'Shopping cart', difficulty: 'medium', label: 'Medium' },
  { id: 'SS-103', area: 'Checkout and inventory', difficulty: 'hard', label: 'Hard' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#flow' },
      { label: 'Your team', href: '#team' },
      { label: 'Roles', href: '#roles' },
      { label: 'Work record', href: '#record' },
    ],
  },
  {
    title: 'Simulations',
    items: [
      { label: 'Frontend apps', status: 'Open', startsSimulation: 'frontend-developer' },
      { label: 'Backend services', status: 'Open', startsSimulation: 'backend-developer' },
      { label: 'Data and DevOps', status: 'Soon' },
    ],
  },
  {
    title: 'Built for',
    items: [{ label: 'wHACKiest 2026' }, { label: 'Track 4, UnlockED' }, { label: 'RIT, Bengaluru' }],
  },
];
