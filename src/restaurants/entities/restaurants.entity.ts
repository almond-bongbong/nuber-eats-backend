import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => Boolean, { nullable: true })
  isGood?: boolean;

  @Column()
  @Field(() => Boolean)
  isVegan: boolean;

  @Column()
  @Field(() => String)
  address: string;

  @Column()
  @Field(() => String)
  ownerName: string;
}
