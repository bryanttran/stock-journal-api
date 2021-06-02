import { calculateCost } from "../libs/billing-lib";

test("Premium tier", () => {
  const storage = "premium";

  const cost = 500;
  const expectedCost = calculateCost(storage);

  expect(cost).toEqual(expectedCost[0]);
});

test("Pro tier", () => {
  const storage = "pro";

  const cost = 1000;
  const expectedCost = calculateCost(storage);

  expect(cost).toEqual(expectedCost[0]);
});