"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const quiz_1 = require("../src/quiz/quiz");
describe("createQuiz", () => {
  test("should create a new quiz successfully", async () => {
    const quizData = {
      title: "Test Quiz",
      questions: [
        {
          title: "Question 1",
          options: [
            { text: "Option 1", is_correct: true },
            { text: "Option 2", is_correct: false },
            { text: "Option 3", is_correct: false },
          ],
        },
        {
          title: "Question 2",
          options: [
            { text: "Option 1", is_correct: false },
            { text: "Option 2", is_correct: true },
            { text: "Option 3", is_correct: false },
          ],
        },
      ],
    };
    const newQuiz = await (0, quiz_1.createQuiz)(quizData, 1);
    expect(newQuiz).toHaveProperty("id");
    expect(newQuiz).toHaveProperty("title", "Test Quiz");
  });
  test("should throw an error if quiz data is invalid", async () => {
    const quizData = {
      title: "",
      questions: [],
    };
    await expect((0, quiz_1.createQuiz)(quizData, 1)).rejects.toThrow();
  });
});
