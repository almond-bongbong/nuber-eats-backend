import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import CoreEntity from '../../common/entities/core.entity';
import { UserRole } from '../../enums';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import Restaurant from '../../restaurants/entities/restaurants.entity';
import Order from '../../orders/entities/order.entity';
import Payment from '../../payments/entities/payment.entity';

@Entity()
@ObjectType()
export default class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  @IsBoolean()
  verified: boolean;

  @OneToMany(
    () => Restaurant,
    restaurant => restaurant.owner,
  )
  @Field(() => [Restaurant])
  restaurants: Restaurant[];

  @OneToMany(
    () => Order,
    order => order.customer,
    { nullable: true },
  )
  @Field(() => [Order], { nullable: true })
  orders?: Order[];

  @OneToMany(
    () => Payment,
    payment => payment.user,
    { nullable: true, lazy: true },
  )
  @Field(() => [Payment], { nullable: true })
  payments?: Payment[];

  @OneToMany(
    () => Order,
    order => order.driver,
    { nullable: true },
  )
  @Field(() => [Order], { nullable: true })
  rides?: Order[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
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
