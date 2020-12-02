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
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';

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

  @UseGuards(AuthGuard)
  @Query(() => UserProfileOutput, { nullable: true })
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const findUser = await this.usersService.findById(
        userProfileInput.userId,
      );
      return findUser
        ? {
            ok: true,
            user: findUser,
          }
        : {
            ok: false,
            error: 'User Not Found',
          };
    } catch (e) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @CurrentUser() currentUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      await this.usersService.editProfile(currentUser.id, editProfileInput);
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    try {
      const result = await this.usersService.verifyEmail(verifyEmailInput.code);
      return {
        ok: result,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Error',
      };
    }
  }
}
