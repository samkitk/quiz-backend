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

export interface QuizInterface {
  title: string;
  creator: number;
}

export interface QuestionInterface {
  title: string;
  quiz: number;
}
export interface OptionInterface {
  text: string;
  is_correct: boolean;
  question: number;
}
export interface RawQuizData {
  title: string;
  creator: number;
  questions: {
    title: string;
    options: {
      text: string;
      is_correct: boolean;
    }[];
  }[];
}

interface QuizOption {
  id: number;
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: number;
  title: string;
  options: QuizOption[];
}

export interface Quiz {
  id: number;
  title: string;
  questions: QuizQuestion[];
}

export interface AttemptQuestion {
  question_id: number;
  option_id: number;
}
