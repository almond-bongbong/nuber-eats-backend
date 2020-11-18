import { Column, Entity } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import CoreEntity from '../../common/entities/core.entity';
import { UserRole } from '../../enums';

@Entity()
@ObjectType()
export default class User extends CoreEntity {
  @Column()
  @Field(() => String)
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  role: UserRole;
}
