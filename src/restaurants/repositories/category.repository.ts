import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreateCategory(name: string): Promise<Category> {
    const categorySlug = name
      .trim()
      .toLowerCase()
      .replace(/ /g, '-');
    let findCategory = await this.findOne({
      slug: categorySlug,
    });

    if (!findCategory) {
      findCategory = await this.save(
        this.create({
          name,
          slug: categorySlug,
        }),
      );
    }

    return findCategory;
  }
}
