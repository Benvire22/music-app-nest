import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserDocument } from '../schemas/user.schema';
import { Request } from 'express';

@Injectable()
export class PermitAuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const roles = ['admin', 'user'];

    const user = request.user as UserDocument;

    if (!user || !roles.includes(user.role)) {
      return false;
    }

    request.user = user;
    return true;
  }
}
