import DataLoader = require('dataloader');

export abstract class BatchLoader<TItem, TKey = number> {
  private loader: DataLoader<TKey, TItem>;

  constructor() {
    this.loader = new DataLoader<TKey, TItem>(keys => this.load(keys as TKey[]));
  }

  public abstract async load(keys: TKey[]): Promise<(TItem | Error)[]>;

  public async loadOne(key: TKey) {
    return this.loader.load(key);
  }

  public async loadMany(keys: TKey[]) {
    return await this.loader.loadMany(keys);
  }

  public clearOne(key: TKey) {
    this.loader.clear(key);
  }

  public clearAll() {
    this.loader.clearAll();
  }
}
