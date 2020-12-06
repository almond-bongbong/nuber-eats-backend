import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { META_AUTH_KEY } from '../common/constants';
import { UserRole } from '../enums';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    return gqlContext.currentUser;
  },
);

export const Auth = (roles?: UserRole | UserRole[]) =>
  SetMetadata(META_AUTH_KEY, roles || 'ANY');
