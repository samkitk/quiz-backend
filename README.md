# Quiz Backend

## Task

Fibr Quiz: Create API for a quiz app

- A user (creator)should be able to log in and create multiple quizzes. Questions in the quiz are multiple choice questions with one or more correct answers. User should be able to share the quiz with other.
- Others (participants)can take the quiz, using the link shared by the creator and will be awarded score based one the results. The creator should be able to view the list of participants and their scores.

The objective is to create a restful API for a quiz app. For authentication, you can use any third party like autho or cognito if needed.

## Task Board

| To Do                                      | In Progress    | Done                             |
| ------------------------------------------ | -------------- | -------------------------------- |
|                                            |                | Database Schema                  |
|                                            |                | Auth0 Integration                |
| CI/CD Pipelines (Subject to more changes?) |                | Data Population                  |
|                                            | Add more tests | Custom User Routes               |
|                                            |                | Quiz routes                      |
|                                            |                | Deployed                         |
|                                            |                | Think of edge cases in endpoints |

## Local Development/Setup

### Prerequisites

- Node.js
- PostgreSQL
- Auth0 Account
- Postman
- Redis
- Yarn/NPM

### Setup

- Clone the repository
- Run `yarn install` to install dependencies
- Create a `.env` file in the root directory following `.env.sample`
- Run `yarn dev` to start the server locally.
- Import the postman collection and environment variables for the collection from `docs` folder to test the endpoints.
