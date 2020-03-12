import { TestNode } from './testClasses';

export const createTestData = (count: number): TestNode[] => {
  const data = new Array<TestNode>();
  for (let i = 1; i <= count; ++i) {
    data.push(new TestNode(i));
  }

  return data;
};
