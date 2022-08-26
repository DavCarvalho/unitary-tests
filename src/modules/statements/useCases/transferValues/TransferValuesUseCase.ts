import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";



interface IRequest {
  amount: number;
  sender_id: string;
  receiver_id: string;
  description: string;
}

@injectable()
class TransferValuesUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ amount, sender_id, receiver_id, description }: IRequest): Promise<void> {
    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new AppError("User does not exist!");
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new AppError("User does not exist!");
    }

    const sender_amount = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    });

    if (amount > sender_amount.balance) {
      throw new AppError("Insufficient funds");
    }

    await this.statementsRepository.create({
      user_id: sender_id,
      type: OperationType.TRANSFER,
      amount: amount * -1,
      description,
    });

    await this.statementsRepository.create({
      user_id: receiver_id,
      type: OperationType.TRANSFER,
      amount,
      description
    });

  }
}

export { TransferValuesUseCase };
