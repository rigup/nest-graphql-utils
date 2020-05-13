![Build status](https://img.shields.io/github/workflow/status/rigup/nest-graphql-utils/Publish%20to%20NPM)
![NPM version](https://img.shields.io/npm/v/nest-graphql-utils)
![License](https://img.shields.io/npm/l/nest-graphql-utils)

# NestJS GraphQL Utils

A collection of utilities for building real-world GraphQL apps using [NestJS](https://nestjs.com/).

* [Pagination](#pagination)
* [Batch Loading](#batch-loading)
* [Release Notes](#release-notes)

## Features

- "Relay-style" pagination using connections, edges, and nodes that follows the [Cursor Connections Specification](https://facebook.github.io/relay/graphql/connections.htm).
- Batch loading of records using [DataLoader](https://github.com/graphql/dataloader).

## Usage

Assume we have the following GraphQL schema

```typescript
@ObjectType()
class TodoList {
  @Field(type => ID)
  public id: string;

  @Field()
  public name: string;

  @Field(type => [TodoItem])
  public items: TodoItem[];
}

@ObjectType()
class TodoItem {
  @Field(type => ID)
  public id: string;

  @Field()
  public description: string;

  @Field(type => TodoList)
  public list: TodoList;
}

@Resolver(TodoItem)
class TodoItemResolver {
  constructor(private readonly service: TodoService) {}

  @Query(returns => [TodoItem])
  public async items() {
    return this.service.getAllItems();
  }
}
```

## Pagination

We can create a connection class by extending `Connection` and use it on the `items` field in our `TodoList` type

```typescript
import { Connection } from 'nest-graphql-utils';

@ObjectType()
class TodoItemConnection extends Connection(TodoItem) {}

@ObjectType()
class TodoList {
  @Field(type => ID)
  public id: string;

  @Field()
  public name: string;

  @Field(type => TodoItemConnection)
  public items: TodoItemConnection;
}
```

And update the `TodoListResolver` to create and return the connection, utilizing the `createConnection` function

```typescript
import { createConnection, PaginationArgs } from 'nest-graphql-utils';

@Resolver(TodoItem)
class TodoItemResolver {
  constructor(private readonly service: TodoService) {}

  @Query(returns => TodoItemConnection)
  public async items(@Args() paginationArgs: PaginationArgs): Promise<TodoItemConnection> {
    return createConnection({
      paginationArgs,
      paginate: args => this.service.paginateItems(args.offset, args.limit),
    });
  }
}
```

We can then query the todo items like this

```graphql
query {
  items(after: "ABCDE==", first: 3) {
    totalCount
    pageInfo {
      startCursor
      endCursor
      hasNextPage
      hasPreviousPage
    }
    edges {
      cursor
      node {
        id
        description
      }
    }
  }
}
```

Which might return a result such as

```json
{
  "items": {
    "totalCount": 50,
    "pageInfo": {
      "startCursor": "ABCDE==",
      "endCursor": "FGHIJ==",
      "hasNextPage": true,
      "hasPreviousPage": true
    },
    "edges": [
      {
        "cursor": "ABCDE==",
        "node": {
          "id": 20,
          "description": "Write the code"
        }
      },
      {
        "cursor": "ZHDHF==",
        "node": {
          "id": 21,
          "description": "Delete the code"
        }
      },
      {
        "cursor": "FGHIJ==",
        "node": {
          "id": 22,
          "description": "Try again"
        }
      }
    ]
  }
}
```

## Batch Loading

Let's add a field resolver to our `TodoItemResolver`

```typescript
@ResolveField(returns => TodoList)
public async list(@Parent() item: TodoItem) {
  return this.service.getListById(item.listId);
}
```

We can use batch loading to avoid the N+1 query problem here. First, we need to define a new loader by extending `BatchLoader` and overriding the `load` method

```typescript
import { DataLoaderFactory } from 'nest-graphql-utils';

@Injectable()
class TodoListLoader implements DataLoaderFactory<TodoList> {
  constructor(private readonly service: TodoService) {}

  create() {
    return new DataLoader<number, TodoList>((keys: number[]) =>
      this.service.getListsByIds(keys);
    );
  }
}
```

We can then update the `resolveList` method in our `TodoItemResolver` to use the new loader

```typescript
@ResolveField(returns => TodoList)
public async list(
  @Parent() item: TodoItem,
  @Loader(TodoListLoader) loader: ReturnType<TodoListLoader['create']>,
) {
  return loader.load(item.listId);
}
```

Finally, we need to provide the `DataLoaderInterceptor` in order for the `Loader` decorator to work. We do that by adding the provider to our app module

``` typescript
@Module({
  providers: [
    // any other providers that your app module uses,
    DataLoaderInterceptorProvider,
  ],
})
export class AppModule {}
```

## Release Notes

#### 0.4.0
* Remove `connectionClass` from `createConnection` options

#### 0.3.5
* Add `offset` pagination argument

#### 0.3.4
* Export all decorators

#### 0.3.3
* Add federation decorators

#### 0.3.2
* Fix endCursor pointing to next cursor rather than last cursor

#### 0.3.1
* Support request scoped injection in loaders and bump peer dependencies
* Allow custom naming of connection and edge

#### 0.3.0
* Replace `BatchLoader` with `DataLoaderFactory` to only load per request. Default key type changed to string

#### 0.2.2
* Update `Loader` decorator to work with Nest 7 changes to `createParamDecorator`

#### 0.2.1
* Fix `Connection.edges` field for Nest 7 support

#### 0.2.0
* Support for NestJS 7

#### 0.1.4
* Add `DataLoaderInterceptor` interceptor and `Loader` decorator to fix batch loading

#### 0.1.3
* Initial release
