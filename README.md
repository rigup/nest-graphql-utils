![CircleCI](https://img.shields.io/circleci/build/github/rigup/nest-graphql-utils?token=a201964cfcb6eb73e62992f87532be1c1090c924)
![NPM version](https://img.shields.io/npm/v/nest-graphql-utils)
![License](https://img.shields.io/npm/l/nest-graphql-utils)

# NestJS GraphQL Utils

A collection of utilities for building real-world GraphQL apps using [NestJS](https://nestjs.com/).

## Features

- "Relay-style" pagination using connections, edges, and nodes that follows the [Cursor Connections Specification](https://facebook.github.io/relay/graphql/connections.htm).
- Batch loading of records using [DataLoader](https://github.com/graphql/dataloader).

## Usage

Assume we have the following GraphQL schema

```typescript
@ObjectType()
class TodoList {
  @Field(type => Int)
  public id: number;

  @Field()
  public name: string;

  @Field(type => [TodoItem])
  public items: TodoItem[];
}

@ObjectType()
class TodoItem {
  @Field(type => Int)
  public id: number;

  @Field()
  public description: string;

  @Field(type => TodoList)
  public list: TodoList;
}

@Resolver(TodoItem)
class TodoItemResolver {
  constructor(private readonly service: TodoService) {}

  @Query(returns => [TodoItem], { name: 'items' })
  public async queryItems() {
    return await this.service.getAllItems();
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
  @Field(type => Int)
  public id: number;

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

  @Query(returns => [TodoItem], { name: 'items' })
  public async queryItems(@Args() paginationArgs: PaginationArgs) {
    return await createConnection({
      paginationArgs,
      connectionClass: TodoItemConnection,
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

Let's add a property resolver to our `TodoItemResolver`

```typescript
@ResolveProperty('list', returns => TodoList)
public async resolveList(@Parent() item: TodoItem) {
  return await this.service.getListById(item.listId);
}
```

We can use batch loading to avoid the N+1 query problem here. First, we need to define a new loader by extending `BatchLoader` and overriding the `load` method

```typescript
import { BatchLoader } from 'nest-graphql-utils';

@Injectable({ scope: Scope.REQUEST })
class TodoListLoader extends BatchLoader<TodoList> {
  constructor(private readonly service: TodoService) {}

  public async load(keys: number[]) {
    return await this.service.getListsByIds(keys);
  }
}
```

We can then update the `TodoItemResolver` to use the new loader (injected via the constructor)

```typescript
@ResolveProperty('list', returns => TodoList)
public async resolveList(@Parent() item: TodoItem) {
  return await this.loader.loadOne(item.listId);
}
```
