import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import Payment from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Auth, CurrentUser } from '../auth/auth.decorator';
import { UserRole } from '../enums';
import User from '../users/entities/user.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Auth(UserRole.OWNER)
  @Mutation(() => CreatePaymentOutput)
  async createPayment(
    @CurrentUser() currentUser: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      await this.paymentsService.createPayment(currentUser, createPaymentInput);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  @Auth(UserRole.OWNER)
  @Query(() => GetPaymentsOutput)
  async getPayments(
    @CurrentUser() currentUser: User,
  ): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.paymentsService.getPayments(currentUser);
      return {
        ok: true,
        payments,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
