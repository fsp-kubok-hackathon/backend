import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const ListFilter = (
  ...decorators: (ClassDecorator | MethodDecorator | PropertyDecorator)[]
) =>
  applyDecorators(
    ApiQuery({ name: 'limit', required: false }),
    ApiQuery({ name: 'offset', required: false }),
    ...decorators,
  );
