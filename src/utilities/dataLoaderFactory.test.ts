import { DataLoaderFactory } from './dataLoaderFactory';
import { createTestData, TestNode } from '../testUtils';
import DataLoader from 'dataloader';

const data = createTestData(50);

class TestLoader implements DataLoaderFactory<TestNode> {
  create() {
    return new DataLoader<number, TestNode>(async (keys: number[]) => {
      return keys.map(key => data.find(item => item.id === key));
    });
  }
}

describe('DataLoaderFactory', () => {
  let loader: ReturnType<TestLoader['create']>;

  beforeEach(() => {
    loader = new TestLoader().create();
  });

  it('loads a single item', async () => {
    const item = await loader.load(1);
    expect(item.id).toEqual(1);
  });

  it('loads multiple items with no errors', async () => {
    const ids = [1, 2, 3, 4, 5];
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

  it('loads multiple items with not found', async () => {
    const ids = [1, 2, 3, 4, 1000];
    const items = await loader.loadMany(ids);

    const notFound = items.filter(item => item === undefined);
    expect(notFound.length).toEqual(1);
  });
});
