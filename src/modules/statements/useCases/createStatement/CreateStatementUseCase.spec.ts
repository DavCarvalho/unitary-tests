import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"



let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a statement", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "123",
    });

    if (user.id) {
      const depositStatement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 1500,
        description: "Deposit",
      });

      const withdrawStatement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 500,
        description: "Withdraw"
      });

      expect(withdrawStatement).toHaveProperty("id");
      expect(withdrawStatement).toHaveProperty("type", "withdraw");

      expect(depositStatement).toHaveProperty("id");
      expect(depositStatement).toHaveProperty("type", "deposit")
    }

  });

  it("should not be able to withdraw with insufficent founds", async () => {
    const user = await createUserUseCase.execute({
      name: "User Test",
      email: "user@test.com",
      password: "123",
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 2000,
        description: "Withdraw"
      })
    }).rejects.toBeInstanceOf(AppError)
  });

  it("should not be able to create a statement to a nonexits user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "nonexist user",
        type: OperationType.WITHDRAW,
        amount: 2000,
        description: "Withdraw"
      })
    }).rejects.toBeInstanceOf(AppError);

  })

})
