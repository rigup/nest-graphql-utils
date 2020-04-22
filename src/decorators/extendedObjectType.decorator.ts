import { Directive, ObjectType } from '@nestjs/graphql';
import { applyDecorators } from '@nestjs/common';

export const ExtendedObjectType = ({ keyFields, name }: { keyFields: string; name?: string }) => {
  return applyDecorators(
    Directive('@extends'),
    Directive(`@key(fields: "${keyFields}")`),
    ObjectType(name),
  );
};
