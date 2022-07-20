import { createConnection } from './createConnection';
import { PaginationArgs } from './connection';
import { TestNode } from '../testUtils';
import { Cursor } from '../utilities/cursor';

describe(createConnection.name, () => {
  describe('defaults', () => {
    it('uses all defaults if no pagination args provided', async () => {
      const paginationArgs = new PaginationArgs();

      await createConnection({
        paginationArgs,
        defaultPageSize: 10,
        paginate: (args) => {
          expect(args.offset).toEqual(0);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('uses provided offset if "after" not provided', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.offset = 5;

      await createConnection({
        paginationArgs,
        paginate: (args) => {
          expect(args.offset).toEqual(5);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('overrides provided offset if "after" is provided', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.offset = 5;
      paginationArgs.after = Cursor.create(10);

      await createConnection({
        paginationArgs,
        paginate: (args) => {
          expect(args.offset).toEqual(11);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('overrides provided offset if "before" is provided', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.offset = 5;
      paginationArgs.before = Cursor.create(30);
      paginationArgs.last = 10;

      await createConnection({
        paginationArgs,
        paginate: (args) => {
          expect(args.offset).toEqual(20);
          return Promise.resolve([[], 0]);
        },
      });
    });
  });

  describe('forward pagination', () => {
    it('uses default offset if "after" and "offset" not provided', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.first = 10;

      await createConnection({
        paginationArgs,
        paginate: (args) => {
          expect(args.offset).toEqual(0);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('uses "after" and "first"', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.after = Cursor.create(10);
      paginationArgs.first = 10;

      await createConnection({
        paginationArgs,
        paginate: (args) => {
          expect(args.offset).toEqual(11);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });
  });

  describe('backward pagination', () => {
    it('uses "before" and "last"', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.before = Cursor.create(30);
      paginationArgs.last = 10;

      await createConnection({
        paginationArgs,
        paginate: (args) => {
          expect(args.offset).toEqual(20);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('handles "before" - "limit" < 0', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.before = Cursor.create(10);
      paginationArgs.last = 20;

      await createConnection({
        paginationArgs,
        paginate: (args) => {
          expect(args.offset).toEqual(0);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });
  });

  describe('returned cursors', () => {
    it('sets the correct "startCursor"', async () => {
      const nodes = [...Array(5).keys()].map((k) => new TestNode(k));
      const paginationArgs = new PaginationArgs();
      paginationArgs.after = Cursor.create(2);
      paginationArgs.first = 5;

      const connection = await createConnection({
        paginationArgs,
        paginate: (args) => {
          return Promise.resolve([nodes, nodes.length]);
        },
      });

      const expectedCursor = Cursor.create(3);
      expect(connection.pageInfo.startCursor).toEqual(expectedCursor);
    });

    it('sets the correct "endCursor"', async () => {
      const nodes = [...Array(5).keys()].map((k) => new TestNode(k));
      const paginationArgs = new PaginationArgs();
      paginationArgs.after = Cursor.create(2);
      paginationArgs.first = 5;

      const connection = await createConnection({
        paginationArgs,
        paginate: (args) => {
          return Promise.resolve([nodes, nodes.length]);
        },
      });

      const expectedCursor = Cursor.create(7);
      expect(connection.pageInfo.endCursor).toEqual(expectedCursor);
    });
  });
});
