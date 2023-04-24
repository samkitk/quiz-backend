import { Quiz, RawQuizData } from "../helper/interfaces";
import { prisma } from "../helper/prisma_helper";

export async function createQuiz(quizData: RawQuizData, creator: number) {
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
  return newQuiz.id;
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
