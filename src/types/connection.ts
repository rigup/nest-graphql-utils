import { ObjectType, Field, Int, ArgsType } from '@nestjs/graphql';
import { Min } from 'class-validator';

import { ClassType } from '../utilities';
import { PageInfo, IPageInfo } from './pageInfo';
import { IEdge } from './edge';

export interface IConnection<TNode> {
  totalCount: number;
  pageInfo: IPageInfo;
  edges: IEdge<TNode>[];
}

export interface IConnectionOptions {
  connectionName?: string;
  edgeName?: string;
}

export interface IConnectionClass<TNode> {
  new (totalCount: number, pageInfo: IPageInfo, edges: IEdge<TNode>[]): IConnection<TNode>;
}

export const Connection = <TNode>(
  TNodeClass: ClassType<TNode>,
  options?: IConnectionOptions,
): IConnectionClass<TNode> => {
  @ObjectType(options?.edgeName || `${TNodeClass.name}Edge`, {
    description: `Provides ${TNodeClass.name} item and a cursor to its position`,
  })
  class EdgeClass implements IEdge<TNode> {
    @Field({ description: `The position of this ${TNodeClass.name} item` })
    public cursor: string;

    @Field(type => TNodeClass)
    public node: TNode;
  }

  @ObjectType(options?.connectionName || `${TNodeClass.name}Connection`, {
    isAbstract: true,
    description: `Provides paginated ${TNodeClass.name} data`,
  })
  class ConnectionClass implements IConnection<TNode> {
    constructor(totalCount: number, pageInfo: PageInfo, edges: EdgeClass[]) {
      this.totalCount = totalCount;
      this.pageInfo = pageInfo;
      this.edges = edges;
    }

    @Field(type => Int, {
      description: `Total number of ${TNodeClass.name} items`,
    })
    public totalCount: number;

    @Field(type => PageInfo)
    public pageInfo: PageInfo;

    @Field(type => [EdgeClass])
    public edges: EdgeClass[];
  }

  return ConnectionClass;
};

@ArgsType()
export class PaginationArgs {
  @Field({
    nullable: true,
    description: 'Cursor to the item after which first n items will be taken',
  })
  public after?: string;

  @Min(0)
  @Field(type => Int, { nullable: true })
  public first?: number;

  @Field({
    nullable: true,
    description: 'Cursor to the item before which last n items will be taken',
  })
  public before?: string;

  @Min(0)
  @Field(type => Int, { nullable: true })
  public last?: number;

  @Min(0)
  @Field(type => Int, { nullable: true })
  public offset?: number;
}
