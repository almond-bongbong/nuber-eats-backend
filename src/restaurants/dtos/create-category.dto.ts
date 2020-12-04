import { InputType, PickType } from '@nestjs/graphql';
import { Category } from '../entities/category.entity';

export class CreateCategoryInput extends PickType(
  Category,
  ['name', 'coverImage'],
  InputType,
) {}
