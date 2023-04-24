"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = void 0;
function sum(a, b) {
  return a + b;
}
exports.sum = sum;
describe("sum function", () => {
  it("should add two numbers", () => {
    expect(sum(1, 2)).toBe(3);
    expect(sum(-1, 2)).toBe(1);
    expect(sum(0, 0)).toBe(0);
  });
});
