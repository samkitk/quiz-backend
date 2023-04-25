import { AttemptQuestion, Quiz, RawQuizData } from "../helper/interfaces";
import { prisma } from "../helper/prisma_helper";

export async function createQuiz(quizData: RawQuizData, creator: number) {
  if (!quizData.title || quizData.questions.length === 0) {
    throw new Error("Invalid quiz data");
  }
  const newQuiz = await prisma.quiz.create({
    data: {
      title: quizData.title,
      creator: creator,
    },
  });

  const questionsOptions = await Promise.all(
    quizData.questions.map(
      async (questionData: {
        title: string;
        options: { text: string; is_correct: boolean }[];
      }) => {
        const newQuestion = await prisma.questions.create({
          data: {
            title: questionData.title,
            quiz: newQuiz.id,
          },
        });
        const newOptions = await Promise.all(
          questionData.options.map(
            async (option: { text: string; is_correct: boolean }) => {
              const newOption = await prisma.options.create({
                data: {
                  text: option.text,
                  is_correct: option.is_correct,
                  questions: newQuestion.id,
                },
              });
            }
          )
        );
      }
    )
  );

  console.log(`Created quiz with id ${newQuiz.id}`);
  return newQuiz;
}

export async function getQuiz(quizId: number) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      select: {
        id: true,
        title: true,
        questions_questions_quizToquiz: {
          select: {
            id: true,
            title: true,
            options_options_questionsToquestions: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });
    if (quiz) {
      return {
        id: quiz.id,
        title: quiz.title,
        questions: quiz.questions_questions_quizToquiz.map((question) => ({
          id: question.id,
          title: question.title,
          options: question.options_options_questionsToquestions.map(
            (option) => ({
              id: option.id,
              text: option.text,
            })
          ),
        })),
      };
    }
    return null;
  } catch (error) {
    console.error(error);
  }
}

export async function resumeQuiz(quizId: number, user_id: number) {
  let attempts: any[] = [];
  let totalQuestions = await getTotalQuestionsInQuiz(quizId);
  let quizTitle = await getQuizTitle(quizId);
  let score = await getScore(quizId, user_id);
  try {
    attempts = await prisma.logs.findMany({
      where: {
        quiz: quizId,
        participant: user_id,
      },
      select: {
        question_attempted: true,
        option_attempted: true,
      },
    });
  } catch (error) {
    console.log("Error in Getting Attempts", error);
  }

  console.log("attempts", attempts);
  console.log("attempts.length", attempts.length);
  console.log("totalQuestions", totalQuestions);

  let all_questions_attempted = attempts.map((attempt) => {
    return attempt.question_attempted;
  });
  let unique_questions_attempted = new Set(all_questions_attempted);
  console.log("unique_questions_attempted", unique_questions_attempted.size);

  if (attempts.length > 0 && unique_questions_attempted.size < totalQuestions) {
    try {
      const questions = await prisma.questions.findMany({
        where: {
          quiz: quizId,
          NOT: {
            id: {
              in: attempts.map((attempt) => attempt.question_attempted),
            },
          },
        },
        select: {
          id: true,
          title: true,
          options_options_questionsToquestions: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      });
      return {
        id: quizId,
        title: quizTitle,
        questions: questions.map((question) => ({
          id: question.id,
          title: question.title,
          options: question.options_options_questionsToquestions.map(
            (option) => ({
              id: option.id,
              text: option.text,
            })
          ),
        })),
      };
    } catch (error) {
      console.error(error);
    }
  } else if (unique_questions_attempted.size === totalQuestions) {
    return {
      id: quizId,
      title: quizTitle,
      score: score + "/" + totalQuestions,
    };
  } else {
    let get_quiz = await getQuiz(quizId);
    return get_quiz;
  }
}

export async function logAttempt(
  quizId: number,
  attempt_data: AttemptQuestion[],
  participant: number
) {
  let dataCheck = await checkAttemptDataBelongsToQuiz(quizId, attempt_data);
  if (!dataCheck) {
    console.log("Data does not belong to quiz");
    return null;
  }

  const oldAttempts = await prisma.logs.findMany({
    where: {
      quiz: quizId,
      participant: participant,
    },
    select: {
      question_attempted: true,
    },
  });
  if (oldAttempts.length > 0) {
    attempt_data = attempt_data.filter((attempt) => {
      for (let i = 0; i < oldAttempts.length; i++) {
        if (oldAttempts[i].question_attempted === attempt.question_id) {
          return false;
        }
      }
      return true;
    });
  }

  if (attempt_data.length === 0) {
    return null;
  }

  const newAttempt = await prisma.logs.createMany({
    data: await Promise.all(
      attempt_data.map(async (attempt) => {
        return {
          participant: participant,
          quiz: quizId,
          question_attempted: attempt.question_id,
          option_attempted: attempt.option_id,
          score: await isAnswerCorrect_v2(
            quizId,
            attempt.question_id,
            attempt.option_id
          ),
        };
      })
    ),
  });
  console.log("newAttempt", newAttempt);
  return newAttempt;
}

export async function isAnswerCorrect(optionId: number) {
  const option = await prisma.options.findUnique({
    where: {
      id: optionId,
    },
    select: {
      is_correct: true,
    },
  });
  if (option) {
    return option.is_correct ? 1 : 0;
  }
  return 0;
}

export async function isAnswerCorrect_v2(
  quizId: number,
  question_id: number,
  option_id: number
) {
  const allOptions = await prisma.options.findMany({
    where: {
      questions_options_questionsToquestions: {
        quiz: quizId,
      },
      questions: question_id,
    },
    select: {
      id: true,
      is_correct: true,
    },
  });
  if (allOptions) {
    let correct_options = allOptions.filter((option) => option.is_correct);
    let correct_answers = correct_options.filter(
      (option) => option.id === option_id
    );

    let per_correct_attempt_score =
      correct_options.length > 0 ? 1 / correct_options.length : 0;
    return correct_answers.length * per_correct_attempt_score;
  }
  return 0;
}

export async function getQuizTitle(quizId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    select: {
      title: true,
    },
  });
  if (quiz) {
    return quiz.title;
  }
  return null;
}

export async function getTotalQuestionsInQuiz(quizId: number) {
  const questions = await prisma.questions.findMany({
    where: {
      quiz: quizId,
    },
    select: {
      id: true,
    },
  });
  return questions.length;
}

export async function getScore(quizId: number, participant: number) {
  const score = await prisma.logs.aggregate({
    where: {
      quiz: quizId,
      participant: participant,
    },
    _sum: {
      score: true,
    },
  });
  return score._sum.score;
}

export async function getLeaderboard(quizId: number) {
  const groupedData = await prisma.logs.groupBy({
    where: {
      quiz: quizId,
    },
    by: ["participant"],
    _sum: {
      score: true,
    },
    _count: {
      score: true,
    },
    _avg: {
      score: true,
    },
  });

  const participantIds = groupedData.map((group) => group.participant);
  const users = await prisma.user.findMany({
    where: {
      id: { in: participantIds },
    },
    select: {
      id: true,
      email: true,
    },
  });

  const leaderboard = groupedData.map((group) => {
    const user = users.find((user) => user.id === group.participant);
    return {
      ...group,
      email: user?.email,
    };
  });

  return leaderboard;
}

export async function checkAttemptDataBelongsToQuiz(
  quizId: number,
  attempt_data: AttemptQuestion[]
) {
  const questionIds = attempt_data.map((attempt) => attempt.question_id);
  const optionIds = attempt_data.map((attempt) => attempt.option_id);

  const questions = await prisma.questions.findMany({
    where: {
      quiz: quizId,
      id: { in: questionIds },
    },
    select: {
      id: true,
    },
  });

  if (questions.length === 0) {
    console.log("questions if", questions.length);
    return false;
  }

  const options = await prisma.options.findMany({
    where: {
      questions: { in: questionIds },
      id: { in: optionIds },
    },
    select: {
      id: true,
    },
  });

  if (questions.length === 0 || options.length === 0) {
    return false;
  }
  return true;
}
