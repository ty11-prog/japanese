import { timeReasonGrammar } from './time-reason';
import { conditionsChangeGrammar } from './conditions-change';
import { standpointComparisonGrammar } from './standpoint-comparison';

export { grammarCategories } from './types';
export type { GrammarCategory, GrammarPoint, GrammarQuestion } from './types';

export const grammarPoints = [
  ...timeReasonGrammar,
  ...conditionsChangeGrammar,
  ...standpointComparisonGrammar,
];
export const grammarQuestions = grammarPoints.flatMap((point) => point.questions);
export const grammarPointMap = new Map(grammarPoints.map((point) => [point.id, point]));
export const grammarQuestionMap = new Map(grammarQuestions.map((question) => [question.id, question]));
