import { APP_INTERCEPTOR } from '@nestjs/core';
import { createParamDecorator, InternalServerErrorException } from '@nestjs/common';

import {
  DataLoaderInterceptor,
  NEST_LOADER_CONTEXT_KEY,
} from '../interceptors/dataLoader.interceptor';
import { BatchLoader } from '../utilities/batchLoader';

interface LoaderClass {
  new (...args: any[]): BatchLoader<any, any>;
}

/**
 * Use the loader accessor to obtain a BatchLoader instance based on type.
 * For more info on loader accessor, see dataLoader.interceptor.ts
 */
export const Loader = createParamDecorator(async (data: LoaderClass, [_, __, ctx]) => {
  if (ctx[NEST_LOADER_CONTEXT_KEY] === undefined) {
    throw new InternalServerErrorException(`
            You should provide interceptor ${DataLoaderInterceptor.name} globally with ${APP_INTERCEPTOR}
          `);
  }

  return await ctx[NEST_LOADER_CONTEXT_KEY](data.name);
});
