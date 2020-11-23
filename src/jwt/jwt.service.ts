import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtPayload } from './jwt.interface';
import { CONFIG_OPTIONS } from './jwt.constants';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
    private readonly configService: ConfigService,
  ) {}

  sign(userId: string): string {
    return jwt.sign({ id: userId }, this.configService.get('PRIVATE_KEY'));
  }

  verify(token: string): JwtPayload {
    return jwt.verify(
      token,
      this.configService.get('PRIVATE_KEY'),
    ) as JwtPayload;
  }
}
