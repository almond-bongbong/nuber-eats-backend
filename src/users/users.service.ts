import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from './dtos/create-account-dto';
import {
  AlreadyUsedEmailError,
  UserNotFoundError,
  WrongPasswordError,
} from '../errors';
import { LoginInput } from './dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(createAccountInput: CreateAccountInput): Promise<void> {
    const exists = await this.usersRepository.findOne({
      email: createAccountInput.email,
    });

    if (exists) {
      throw new AlreadyUsedEmailError();
    }

    const newUser = this.usersRepository.create(createAccountInput);
    await this.usersRepository.save(newUser);
  }

  async login(loginInput: LoginInput) {
    const user = await this.usersRepository.findOne({
      email: loginInput.email,
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    const correctPassword = await user.checkPassword(loginInput.password);
    if (correctPassword) {
      this.jwtService.hello();
      return jwt.sign({ id: user.id }, this.configService.get('PRIVATE_KEY'));
    }

    throw new WrongPasswordError();
  }
}
