import { Field, Directive } from '@nestjs/graphql';
import { applyDecorators } from '@nestjs/common';

export const ExternalField = (...args: Parameters<typeof Field>) => {
  return applyDecorators(Directive('@external'), Field(...args));
};
