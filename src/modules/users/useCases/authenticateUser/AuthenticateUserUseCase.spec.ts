import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate a user", async () => {
    const user = {
      name: "User test",
      email: "user@test.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    const authentication = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authentication).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existant user", async () => {
    const userLoginData = {
      email: "user@test.com",
      password: "123",
    };

    expect(async () => {
      await authenticateUserUseCase.execute(userLoginData);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    const user = {
      name: "User test",
      email: "user@test.com",
      password: "123",
    };

    await createUserUseCase.execute(user);

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorret password",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
