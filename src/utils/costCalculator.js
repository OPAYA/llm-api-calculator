export function calculateCost(tokens, pricePerThousand) {
  return (tokens / 1000) * pricePerThousand;
}

export function calculateTotalCost(promptTokens, outputTokens, model) {
  const inputCost = calculateCost(promptTokens, model.input_per_1k);
  const outputCost = calculateCost(outputTokens, model.output_per_1k);
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    inputTokens: promptTokens,
    outputTokens: outputTokens,
    totalTokens: promptTokens + outputTokens
  };
}

export function calculateConversationCost(turns, model) {
  let totalPromptTokens = 0;
  let totalOutputTokens = 0;
  let contextTokens = 0;
  
  const turnCosts = turns.map((turn, index) => {
    const effectivePromptTokens = turn.promptTokens + contextTokens;
    
    const cost = calculateTotalCost(effectivePromptTokens, turn.outputTokens, model);
    
    contextTokens += turn.promptTokens + turn.outputTokens;
    
    if (contextTokens > model.context_window) {
      contextTokens = model.context_window;
    }
    
    totalPromptTokens += effectivePromptTokens;
    totalOutputTokens += turn.outputTokens;
    
    return {
      ...cost,
      turnNumber: index + 1,
      contextTokens: contextTokens
    };
  });
  
  return {
    turnCosts,
    totalCost: turnCosts.reduce((sum, turn) => sum + turn.totalCost, 0),
    totalPromptTokens,
    totalOutputTokens,
    totalTokens: totalPromptTokens + totalOutputTokens,
    avgCostPerTurn: turnCosts.length > 0 ? 
      turnCosts.reduce((sum, turn) => sum + turn.totalCost, 0) / turnCosts.length : 0
  };
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}