import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferValuesUseCase } from "./TransferValuesUseCase";



class TransferValuesController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { amount, description } = request.body;
    const { receiver_id } = request.params

    const transferValuesUseCase = container.resolve(TransferValuesUseCase);

    const transfer = await transferValuesUseCase.execute({
      amount,
      description,
      receiver_id,
      sender_id: request.user.id
    });

    return response.status(201).json(transfer);
  }
}

export { TransferValuesController };
