import React, { useState, useEffect, useCallback } from 'react';
import { countTokens } from '../utils/tokenizer';
import { calculateTotalCost, formatCurrency, formatNumber } from '../utils/costCalculator';
import pricingData from '../data/pricing.json';

const Calculator = ({ selectedModels }) => {
  const [promptText, setPromptText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [promptTokens, setPromptTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const [costs, setCosts] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const calculateTokensAndCosts = useCallback(async () => {
    if (!promptText && !outputText) {
      setPromptTokens(0);
      setOutputTokens(0);
      setCosts([]);
      return;
    }

    setIsCalculating(true);
    
    try {
      const modelCosts = await Promise.all(
        selectedModels.map(async (modelKey) => {
          const [vendorId, modelId] = modelKey.split(':');
          const vendor = pricingData.vendors[vendorId];
          const model = vendor.models.find(m => m.id === modelId);
          
          if (!model) return null;
          
          const pTokens = await countTokens(promptText, modelId);
          const oTokens = await countTokens(outputText, modelId);
          
          const cost = calculateTotalCost(pTokens, oTokens, model);
          
          return {
            vendorName: vendor.name,
            modelName: model.name,
            modelId: modelId,
            ...cost
          };
        })
      );
      
      const validCosts = modelCosts.filter(c => c !== null);
      setCosts(validCosts);
      
      if (validCosts.length > 0) {
        setPromptTokens(validCosts[0].inputTokens);
        setOutputTokens(validCosts[0].outputTokens);
      }
    } catch (error) {
      console.error('Error calculating costs:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [promptText, outputText, selectedModels]);

  const debouncedCalculate = useCallback(
    debounce(calculateTokensAndCosts, 300),
    [calculateTokensAndCosts]
  );

  useEffect(() => {
    debouncedCalculate();
  }, [promptText, outputText, selectedModels, debouncedCalculate]);

  return (
    <div className="calculator">
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={6}
          />
          <div className="token-badge">
            {isCalculating ? '...' : formatNumber(promptTokens)} tokens
          </div>
        </div>
        
        <div className="input-group">
          <label htmlFor="output">Expected Output</label>
          <textarea
            id="output"
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            placeholder="Enter expected output here..."
            rows={6}
          />
          <div className="token-badge">
            {isCalculating ? '...' : formatNumber(outputTokens)} tokens
          </div>
        </div>
      </div>
      
      {costs.length > 0 && (
        <div className="results-section">
          <h2>Cost Comparison</h2>
          <div className="cost-table">
            <div className="table-header">
              <div>Provider</div>
              <div>Model</div>
              <div>Input Cost</div>
              <div>Output Cost</div>
              <div>Total Cost</div>
              <div>Per 1K Tokens</div>
            </div>
            {costs.map((cost, index) => (
              <div key={index} className="table-row">
                <div>{cost.vendorName}</div>
                <div>{cost.modelName}</div>
                <div>{formatCurrency(cost.inputCost)}</div>
                <div>{formatCurrency(cost.outputCost)}</div>
                <div className="total-cost">{formatCurrency(cost.totalCost)}</div>
                <div>
                  {formatCurrency(cost.totalCost / (cost.totalTokens / 1000))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;