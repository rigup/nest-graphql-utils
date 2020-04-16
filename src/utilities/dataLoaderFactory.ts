import DataLoader = require('dataloader');

export interface DataLoaderFactory<TItem, TKey = number> {
  create(): DataLoader<TKey, TItem>;
}
