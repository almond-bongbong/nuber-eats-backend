import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { META_AUTH_KEY } from '../common/constants';
import { AllowedRoles } from './auth.interface';
import User from '../users/entities/user.entity';
import { UserRole } from '../enums';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedRole = this.reflector.get<AllowedRoles>(
      META_AUTH_KEY,
      context.getHandler(),
    );
    if (allowedRole == null) return true;

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const currentUser: User = gqlContext.currentUser;

    if (currentUser == null) return false;
    if (allowedRole === 'ANY') return true;
    if (Array.isArray(allowedRole)) {
      return allowedRole.includes(currentUser.role);
    }
    return (allowedRole as UserRole) === currentUser.role;
  }
}
