import { IPageInfo } from './pageInfo';
import { Cursor } from './cursor';
import { IConnectionClass, PaginationArgs, IConnection } from './connection';
import { IEdge } from './edge';

export interface IPaginateArgs {
  offset: number;
  limit: number;
}

export interface ICreateConnectionOptions<TNode> {
  paginationArgs: PaginationArgs;
  connectionClass: IConnectionClass<TNode>;
  defaultPageSize?: number;
  paginate(args: IPaginateArgs): Promise<[TNode[], number]>;
}

export const createConnection = async <TNode>({
  paginationArgs,
  connectionClass,
  defaultPageSize = 20,
  paginate,
}: ICreateConnectionOptions<TNode>): Promise<IConnection<TNode>> => {
  let offset = 0;
  let limit = paginationArgs.first || defaultPageSize;

  if (paginationArgs.after) {
    offset = Cursor.getOffset(paginationArgs.after) + 1;
  } else if (paginationArgs.before) {
    const beforeOffset = Cursor.getOffset(paginationArgs.before);
    limit = paginationArgs.last || limit;
    offset = beforeOffset - limit;
    if (offset < 0) {
      limit = beforeOffset;
      offset = 0;
    }
  }

  const [nodes, totalCount] = await paginate({ offset, limit });

  const pageInfo: IPageInfo = {
    startCursor: Cursor.create(connectionClass.name, offset),
    endCursor: Cursor.create(connectionClass.name, offset + nodes.length),
    hasPreviousPage: offset > 0,
    hasNextPage: offset + nodes.length < totalCount,
  };

  const edges: IEdge<TNode>[] = nodes.map((node, index) => {
    return {
      cursor: Cursor.create(connectionClass.name, offset + index),
      node,
    };
  });

  return new connectionClass(totalCount, pageInfo, edges);
};
