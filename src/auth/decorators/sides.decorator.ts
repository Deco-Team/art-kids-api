import { SetMetadata } from '@nestjs/common';
import { UserSide } from '@common/contracts/constant';

export const SIDES_KEY = 'sides';
export const Sides = (...sides: UserSide[]) => SetMetadata(SIDES_KEY, sides);