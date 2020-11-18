import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<string | undefined> {
    try {
      const exists = await this.usersRepository.findOne({
        email: createAccountInput.email,
      });

      if (exists) {
        return 'There is a user with that email already';
      }

      const newUser = this.usersRepository.create(createAccountInput);
      await this.usersRepository.save(newUser);
    } catch (e) {
      console.log(e);
      return 'Couldn\'t create account';
    }
  }
}
