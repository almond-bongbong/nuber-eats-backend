import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  @Length(5, 10)
  name: string;

  @Column()
  @Field(() => Boolean, { nullable: true })
  isGood?: boolean;

  @Column({ default: true })
  @Field(() => Boolean, { nullable: true })
  isVegan: boolean;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => String)
  ownerName: string;
}
