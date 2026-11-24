/**
 * The OnWard logo, traced from the official artwork (1254px square source).
 * `ring` is the black symbol in two pieces (the O, and its lower-right end that
 * the arrow cuts across); `arrow` is the orange arrow. Coordinates are in the
 * source image's pixels, so the geometry stays identical wherever it is drawn.
 */
export const LOGO_RING = [
  'M555 322H740C840 322 920 395 930 490C932 510 930 530 928 548H800C800 535 799 525 797 515C785 465 745 432 700 432H585C520 432 465 485 455 550L436 695C432 735 445 765 466 785C420 805 375 820 333 830C312 795 300 755 305 715L330 535C335 505 338 480 345 465C375 390 455 322 555 322Z',
  'M840 755L893 802C875 870 815 930 750 933H565C665 885 760 820 840 755Z',
];

export const LOGO_ARROW =
  'M350 858C420 840 520 805 600 760C660 727 715 690 762 640L725 595C720 588 725 580 735 580H917C925 580 929 587 927 595L905 750C903 760 893 765 885 757L840 716C760 785 650 860 520 922C505 930 490 933 470 933C420 933 375 900 350 858Z';

/** The glyph's bounding box in source pixels, and its centre. */
export const LOGO_VIEWBOX = '290 310 650 635';
export const LOGO_CENTRE = { x: 617, y: 628 };
export const LOGO_WIDTH = 650;

/**
 * The arrow split in two along its neck (762,640 to 840,716), for the intro:
 * the head flies in as one piece while the shaft draws behind it. Together they
 * cover exactly LOGO_ARROW, which replaces them once the arrow has landed.
 */
export const LOGO_ARROW_HEAD =
  'M762 640L725 595C720 588 725 580 735 580H917C925 580 929 587 927 595L905 750C903 760 893 765 885 757L840 716Z';
export const LOGO_ARROW_SHAFT =
  'M350 858C420 840 520 805 600 760C660 727 715 690 762 640L840 716C760 785 650 860 520 922C505 930 490 933 470 933C420 933 375 900 350 858Z';
