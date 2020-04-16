import DataLoader = require('dataloader');

export interface BatchLoader<TItem, TKey = number> {
  generateDataLoader(): DataLoader<TKey, TItem>;
}
