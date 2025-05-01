import { Container } from "inversify"
import "reflect-metadata"
import { ErrorHandlerService } from "../services/errorHandlerService"
import type { IErrorHandlerService } from "../services/interfaces/errorHandlerServiceInterface"
import type { IUserService } from "../services/interfaces/userServiceInterface"
import { UserService } from "../services/userService"

const container = new Container()

// サービスの登録
container.bind<IUserService>("IUserService").to(UserService).inSingletonScope()
container
  .bind<IErrorHandlerService>("IErrorHandlerService")
  .to(ErrorHandlerService)
  .inSingletonScope()

export { container }
