import { ObjectType, Field } from 'type-graphql';

export interface IPageInfo {
  startCursor: string;
  endCursor: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@ObjectType({ description: 'Provides info abou the current page' })
export class PageInfo implements IPageInfo {
  @Field({ description: 'Cursor referencing the beginning of the page' })
  startCursor: string;

  @Field({ description: 'Cursor referencing the end of the page' })
  endCursor: string;

  @Field()
  hasPreviousPage: boolean;

  @Field()
  hasNextPage: boolean;
}
