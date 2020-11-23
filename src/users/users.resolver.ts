import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import User from './entities/user.entity';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account-dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  findUser() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('data') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      await this.usersService.createAccount(createAccountInput);
      return { ok: true };
    } catch (error) {
      console.log(error.name, error.type);
      return {
        ok: false,
        error: error.message || "Couldn't create account",
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const token = await this.usersService.login(loginInput);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || 'Some Error',
      };
    }
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@CurrentUser() currentUser: User) {
    return currentUser;
  }
}
