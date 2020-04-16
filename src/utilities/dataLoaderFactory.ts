import DataLoader = require('dataloader');

export interface DataLoaderFactory<TItem, TKey = string> {
  create(): DataLoader<TKey, TItem>;
}
