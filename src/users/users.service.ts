import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account-dto';
import {
  AlreadyUsedEmailError,
  NotFoundVerification,
  UserNotFoundError,
  WrongPasswordError,
} from '../errors';
import { LoginInput } from './dtos/login.dto';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
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
    const savedUser = await this.usersRepository.save(newUser);
    const newVerification = this.verificationRepository.create({
      user: savedUser,
    });
    await this.verificationRepository.save(newVerification);
  }

  async login(loginInput: LoginInput) {
    const user = await this.usersRepository.findOne(
      {
        email: loginInput.email,
      },
      {
        select: ['id', 'password'],
      },
    );

    if (!user) {
      throw new UserNotFoundError();
    }

    const correctPassword = await user.checkPassword(loginInput.password);
    if (correctPassword) {
      return this.jwtService.sign(user.id);
    }

    throw new WrongPasswordError();
  }

  async findById(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  async editProfile(userId: string, editProfileInput: EditProfileInput) {
    const findUser = await this.findById(userId);
    if (editProfileInput.email) {
      findUser.email = editProfileInput.email;
      findUser.verified = false;
      await this.verificationRepository.save(
        this.verificationRepository.create({ user: findUser }),
      );
    }
    if (editProfileInput.password) {
      findUser.password = editProfileInput.password;
    }
    return this.usersRepository.save(findUser);
  }

  async verifyEmail(code: string): Promise<void> {
    const findVerification = await this.verificationRepository.findOne(
      {
        code,
      },
      {
        relations: ['user'],
      },
    );

    if (!findVerification) {
      throw new NotFoundVerification();
    }

    findVerification.user.verified = true;
    await this.usersRepository.save(findVerification.user);
    await this.verificationRepository.delete(findVerification.id);
  }
}
