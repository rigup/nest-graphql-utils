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

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const ctx: any = graphqlExecutionContext.getContext();

    if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
      ctx[NEST_LOADER_CONTEXT_KEY] = async (
        type: string,
      ): Promise<BatchLoader<any, any>> => {
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
