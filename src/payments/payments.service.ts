import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Payment from './entities/payment.entity';
import { LessThan, Repository } from 'typeorm';
import { CreatePaymentInput } from './dtos/create-payment.dto';
import Restaurant from '../restaurants/entities/restaurants.entity';
import { NotFoundError, UnAuthorizedError } from '../errors';
import User from '../users/entities/user.entity';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepository: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.checkPromotedRestaurant();
  }

  async createPayment(
    owner: User,
    createPaymentInput: CreatePaymentInput,
  ): Promise<Payment> {
    const findRestaurant = await this.restaurantsRepository.findOne(
      createPaymentInput.restaurantId,
    );

    if (!findRestaurant) throw new NotFoundError();
    if (findRestaurant.ownerId !== owner.id) throw new UnAuthorizedError();

    const newPayment = this.paymentsRepository.create({
      restaurant: findRestaurant,
      user: owner,
      transactionId: createPaymentInput.transactionId,
    });

    const promotedUntilDate = new Date();
    promotedUntilDate.setDate(promotedUntilDate.getDate() + 7);
    await this.restaurantsRepository.update(findRestaurant.id, {
      isPromoted: true,
      promotedUntil: promotedUntilDate,
    });
    return this.paymentsRepository.save(newPayment);
  }

  async getPayments(me: User) {
    return this.paymentsRepository.find({
      user: me,
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkPromotedRestaurant() {
    const restaurants = await this.restaurantsRepository.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    const jobs = restaurants.map(r =>
      this.restaurantsRepository.update(r.id, {
        isPromoted: false,
        promotedUntil: null,
      }),
    );
    await Promise.all(jobs);
  }
}
