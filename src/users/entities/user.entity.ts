import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import CoreEntity from '../../common/entities/core.entity';
import { UserRole } from '../../enums';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsEnum } from 'class-validator';

@Entity()
@ObjectType()
export default class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column()
  @Field(() => String)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  verified: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(targetPassword: string): Promise<boolean> {
    try {
      return bcrypt.compare(targetPassword, this.password);
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
