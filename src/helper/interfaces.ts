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

export interface CombinedQuizInterface {
  title: string;
  creator: number;
  questions: QuestionInterface[];
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

// {
//   "title": "Math Quiz",
//   "creator": 1,
//   "questions": [
//     {
//       "title": "What is 2 + 2?",
//       "options": [
//         {
//           "text": "3",
//           "is_correct": false
//         },
//         {
//           "text": "4",
//           "is_correct": true
//         },
//         {
//           "text": "5",
//           "is_correct": false
//         }
//       ]
//     },
//     {
//       "title": "What is 3 + 3?",
//       "options": [
//         {
//           "text": "4",
//           "is_correct": false
//         },
//         {
//           "text": "5",
//           "is_correct": false
//         },
//         {
//           "text": "6",
//           "is_correct": true
//         }
//       ]
//     }
//   ]
// }
