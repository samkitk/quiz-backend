import { RawQuizData } from "../helper/interfaces";
import { prisma } from "../helper/prisma_helper";

export async function createQuiz(quizData: RawQuizData) {
  const newQuiz = await prisma.quiz.create({
    data: {
      title: quizData.title,
      creator: quizData.creator,
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
