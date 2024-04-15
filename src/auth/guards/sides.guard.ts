import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@auth/decorators/roles.decorator';
import { UserSide } from '@common/contracts/constant';

@Injectable()
export class SidesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredSides = this.reflector.getAllAndOverride<UserSide[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredSides) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return user.side && requiredSides.includes(user.side);
  }
}