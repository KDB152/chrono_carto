import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id || request.body.userId;

    // Allow if user is admin
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check if user owns the resource
    return user.userId === parseInt(resourceId);
  }
}
