import { createConnection } from './createConnection';
import { PaginationArgs } from './connection';
import { TestConnection } from './testUtils';
import { Cursor } from './cursor';

describe(createConnection.name, () => {
  describe('no pagination args', () => {
    it('uses defaults', async () => {
      const paginationArgs = new PaginationArgs();

      await createConnection({
        paginationArgs,
        connectionClass: TestConnection,
        defaultPageSize: 10,
        paginate: args => {
          expect(args.offset).toEqual(0);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });
  });

  describe('forward pagination', () => {
    it('uses default offset if "after" not provided', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.first = 10;

      await createConnection({
        paginationArgs,
        connectionClass: TestConnection,
        paginate: args => {
          expect(args.offset).toEqual(0);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('uses default page size if "first" not provided', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.first = 10;

      await createConnection({
        paginationArgs,
        connectionClass: TestConnection,
        paginate: args => {
          expect(args.offset).toEqual(0);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('uses "after" and "first"', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.after = Cursor.create(TestConnection.name, 10);
      paginationArgs.first = 10;

      await createConnection({
        paginationArgs,
        connectionClass: TestConnection,
        paginate: args => {
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
      paginationArgs.before = Cursor.create(TestConnection.name, 30);
      paginationArgs.last = 10;

      await createConnection({
        paginationArgs,
        connectionClass: TestConnection,
        paginate: args => {
          expect(args.offset).toEqual(20);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });

    it('handles "before" - "limit" < 0', async () => {
      const paginationArgs = new PaginationArgs();
      paginationArgs.before = Cursor.create(TestConnection.name, 10);
      paginationArgs.last = 20;

      await createConnection({
        paginationArgs,
        connectionClass: TestConnection,
        paginate: args => {
          expect(args.offset).toEqual(0);
          expect(args.limit).toEqual(10);
          return Promise.resolve([[], 0]);
        },
      });
    });
  });
});
