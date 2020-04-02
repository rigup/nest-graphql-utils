import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ModuleRef, APP_INTERCEPTOR } from '@nestjs/core';
import { Observable } from 'rxjs';

import { BatchLoader } from '../utilities/batchLoader';

export const NEST_LOADER_CONTEXT_KEY = 'NEST_LOADER_CONTEXT_KEY';

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
    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      ctx[NEST_LOADER_CONTEXT_KEY] = async (type: string): Promise<BatchLoader<any, any>> => {
        if (ctx[type] === undefined) {
          try {
            ctx[type] = this.moduleRef.get<BatchLoader<any, any>>(type, {
              strict: false,
            });
          } catch (e) {
            throw new InternalServerErrorException(
              `The loader ${type} is not provided: ${e.message}`,
            );
          }
        }

        return ctx[type];
      };
    }

    return next.handle();
  }
}

export const DataLoaderInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  useClass: DataLoaderInterceptor,
};
