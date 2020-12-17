import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { META_AUTH_KEY } from '../common/constants';
import { AllowedRoles } from './auth.interface';
import User from '../users/entities/user.entity';
import { UserRole } from '../enums';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const allowedRole = this.reflector.get<AllowedRoles>(
      META_AUTH_KEY,
      context.getHandler(),
    );

    const token = gqlContext.token;
    let currentUser: User = null;

    if (token) {
      try {
        const verified = this.jwtService.verify(token);

        if (verified.id) {
          currentUser = await this.usersService.findById(verified.id);
          gqlContext.currentUser = currentUser;
        }
      } catch (error) {
        console.log(error);
      }
    }

    if (allowedRole == null) return true;
    if (currentUser == null) return false;
    if (allowedRole === 'ANY') return true;
    if (Array.isArray(allowedRole)) {
      return allowedRole.includes(currentUser.role);
    }

    return (allowedRole as UserRole) === currentUser.role;
  }
}
