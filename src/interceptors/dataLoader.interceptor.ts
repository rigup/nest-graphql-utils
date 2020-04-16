import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ContextId, ContextIdFactory, ModuleRef, APP_INTERCEPTOR } from '@nestjs/core';
import { Observable } from 'rxjs';

import { BatchLoader } from '../utilities/batchLoader';

export const LOADER_ACCESSOR_CONTEXT_KEY = 'LOADER_ACCESSOR_CONTEXT_KEY';

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Uses a loader accessor to obtain a BatchLoader based on type.
   *
   * The loader accessor is a function that takes a loader type (as a string) and returns a
   * BatchLoader from the context if it exists. If it doesn't exist yet, it resolves the loader
   * using Nest's provider resolution and stores it in the context, using the loader type as the key.
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx: any = graphqlExecutionContext.getContext();

    // If loader accessor does not already exist on context, create it
    if (!ctx[LOADER_ACCESSOR_CONTEXT_KEY]) {
      ctx[LOADER_ACCESSOR_CONTEXT_KEY] = {
        contextId: this.getContextId(ctx),
        getLoader: async (type: string): Promise<BatchLoader<any, any>> => {
          if (ctx[type] === undefined) {
            try {
              ctx[type] = (
                await this.moduleRef.resolve<BatchLoader<any, any>>(
                  type,
                  ctx[LOADER_ACCESSOR_CONTEXT_KEY].contextId,
                  {
                    strict: false,
                  },
                )
              ).generateDataLoader();
            } catch (e) {
              throw new InternalServerErrorException(
                `The loader ${type} is not provided: ${e.message}`,
              );
            }
          }

          return ctx[type];
        },
      };
    }

    return next.handle();
  }

  private getContextId(ctx: any): ContextId {
    const GQL_CONTEXT_ID = Object.getOwnPropertySymbols(ctx).find(
      sym => sym.toString() === 'Symbol(GQL_CONTEXT_ID)',
    );

    if (GQL_CONTEXT_ID && ctx[GQL_CONTEXT_ID]) {
      return ctx[GQL_CONTEXT_ID];
    }

    return ContextIdFactory.create();
  }
}

export const DataLoaderInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useClass: DataLoaderInterceptor,
};
