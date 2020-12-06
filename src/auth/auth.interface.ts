import { UserRole } from '../enums';

export type AllowedRoles = keyof typeof UserRole | 'ANY';