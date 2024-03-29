import { injectable } from 'inversify';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { BadRequest } from '../operation-result/http-status/BadRequest';
import { Forbidden } from '../operation-result/http-status/Forbidden';
import { NotFound } from '../operation-result/http-status/NotFound';
import { TokenError } from '../operation-result/http-status/TokenError';
import { Unauthorized } from '../operation-result/http-status/Unauthorized';

@Middleware({ type: 'after' })
@injectable()
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: any, response: any, next: (err?: any) => any) {
    const badRequestErrorHandler = (error: BadRequest<any>) => {
      const custom = response.status(error.HttpCode).send(error);
      next(custom);
    };

    const unauthorizedUser = (error: Unauthorized<string> | TokenError<string>) => {
      const custom = response.status(error.HttpCode).send(error);
      next(custom);
    };

    const forbiddenUser = (error: Forbidden<string>) => {
      const custom = response.status(error.HttpCode).send(error);
      next(custom);
    };

    const notFoundUser = (error: NotFound<string>) => {
      const custom = response.status(error.HttpCode).send(error);
      next(custom);
    };

    const objectErrorHandler = {
      400: (error: BadRequest<any>) => badRequestErrorHandler(error),
      401: (error: Unauthorized<string> | TokenError<string>) => unauthorizedUser(error),
      403: (error: Forbidden<string>) => forbiddenUser(error),
      404: (error: NotFound<string>) => notFoundUser(error),
    };

    error.HttpCode === undefined &&
      objectErrorHandler[400](
        new BadRequest<any>([error.message]),
      );
    objectErrorHandler[error.HttpCode](error);
  }
}
