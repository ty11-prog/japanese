import { dailyExpansion } from './expansion/daily';
import { workExpansion } from './expansion/work';
import { peopleExpansion } from './expansion/people';
import { societyExpansion } from './expansion/society';
import { actionsExpansion } from './expansion/actions';

/** Keep new words after the original 100 so existing study order and IDs stay stable.
 * Store each new example beside its reading to make future corrections atomic. */
export const expandedVocabulary = [
  ...dailyExpansion,
  ...workExpansion,
  ...peopleExpansion,
  ...societyExpansion,
  ...actionsExpansion,
];
