import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if ('authorization' in req.headers) {
      try {
        const token = req.headers['authorization'];
        const verified = this.jwtService.verify(token);

        if (verified.id) {
          console.log(verified);
          req['currentUser'] = await this.usersService.findById(verified.id);
        }
      } catch (error) {
        console.log(error);
      }
    }

    next();
  }
}
