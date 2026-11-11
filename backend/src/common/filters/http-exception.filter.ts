import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      message =
        typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse
          ? (errorResponse as any).message
          : errorResponse;
    } else if ((exception as any)?.code === '23505') {
      // Código de error PostgreSQL para restricción de unicidad (unique_violation)
      status = HttpStatus.CONFLICT;
      message =
        (exception as any)?.detail ||
        'Conflicto de unicidad: ya existe un registro con estos datos en la base de datos.';
    } else {
      message = (exception as Error)?.message || 'Error interno del servidor';
    }

    this.logger.error(
      `HTTP ${status} Error en ${request.method} ${request.url}: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
