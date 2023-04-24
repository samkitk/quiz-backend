import { Request } from "express";

export interface CreateUserResponse {
  created_at?: string;
  email: string;
  email_verified?: boolean;
  identities?: [
    {
      connection?: string;
      user_id?: string;
      provider?: string;
      isSocial?: boolean;
    }
  ];
  name: string;
  nickname?: string;
  picture?: string;
  user_id?: string;
  updated_at?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export interface DecodedToken {
  iss?: string;
  sub?: string;
  aud?: string;
  iat?: number;
  exp?: number;
  azp?: string;
  scope?: string;
  gty?: string;
}
