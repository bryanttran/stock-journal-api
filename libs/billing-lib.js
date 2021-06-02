export function calculateCost(tier) {
    const rate = tier === "pro" ? 10 : 5;
    const description = rate === 10 ? "Pro account charge" : "Intermediate account charge";
    return [rate * 100, description];
  }