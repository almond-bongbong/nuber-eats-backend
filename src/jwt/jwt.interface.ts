export interface JwtModuleOptions {
  privateKey?: string;
}

export interface JwtPayload {
  id: string;
  iat: number;
}
