import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import User from '../entities/user.entity';
import { MutationOutput } from '../../common/dtos/output.dto';

@InputType()
export class CreateAccountInput extends PickType(
  User,
  ['email', 'password', 'role'],
  InputType,
) {}

@ObjectType()
export class CreateAccountOutput extends MutationOutput {}