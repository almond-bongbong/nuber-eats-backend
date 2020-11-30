import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import CoreEntity from '../../common/entities/core.entity';
import User from './user.entity';

@Entity()
@ObjectType()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
