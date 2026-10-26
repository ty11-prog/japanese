import { createProgressStore } from './storage';

/** Grammar uses question IDs and an independent key in the existing database.
 * Saving or importing either learning domain cannot overwrite the other. */
const grammarStore = createProgressStore('grammar-state', 'kotoba-n3-grammar-backup');

export const loadGrammarState = grammarStore.loadState;
export const saveGrammarState = grammarStore.saveState;
export const exportGrammarBackup = grammarStore.exportBackup;
export const parseGrammarBackup = grammarStore.parseBackup;
export const resetGrammarState = grammarStore.resetState;
