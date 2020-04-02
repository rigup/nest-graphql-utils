import { BatchLoader } from './batchLoader';
import { createTestData, TestNode } from '../testUtils';

const data = createTestData(50);

class TestLoader extends BatchLoader<TestNode> {
  public async load(keys: number[]) {
    return keys.map(
      key =>
        data.find(item => item.id === key) ||
        new Error(`No item found with key ${key}`),
    );
  }
}

describe(BatchLoader.name, () => {
  it('loads a single item', async () => {
    const loader = new TestLoader();
    const item = await loader.loadOne(1);
    expect(item.id).toEqual(1);
  });

  it('loads multiple items with no errors', async () => {
    const ids = [1, 2, 3, 4, 5];
    const loader = new TestLoader();
    const items = await loader.loadMany(ids);

    const loadedIds = items.map(item => {
      if (item instanceof TestNode) {
        return item.id;
      } else {
        fail('Did not expect in items array');
      }
    });

    expect(loadedIds).toEqual(ids);
  });

  it('loads multiple items with errors', async () => {
    const ids = [1, 2, 3, 4, 1000];
    const loader = new TestLoader();
    const items = await loader.loadMany(ids);

    const errors = items.filter(item => item instanceof Error);
    expect(errors.length).toEqual(1);
    expect((errors[0] as Error).message).toEqual('No item found with key 1000');
  });
});
