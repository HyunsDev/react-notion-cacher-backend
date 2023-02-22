import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { RoleGuard } from '../guard/auth.guard';

type Role = undefined;
export const Auth = (...roles: Role[]) => {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RoleGuard));
};
