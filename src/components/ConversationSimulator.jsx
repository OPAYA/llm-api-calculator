import React, { useState, useEffect, useCallback } from 'react';
import { countTokens } from '../utils/tokenizer';
import { calculateConversationCost, formatCurrency, formatNumber } from '../utils/costCalculator';
import pricingData from '../data/pricing.json';
import CostChart from './CostChart';

const ConversationSimulator = ({ selectedModels }) => {
  const [turns, setTurns] = useState([
    { id: 1, prompt: '', output: '', promptTokens: 0, outputTokens: 0 }
  ]);
  const [conversationCosts, setConversationCosts] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const addTurn = () => {
    const newTurn = {
      id: turns.length + 1,
      prompt: '',
      output: '',
      promptTokens: 0,
      outputTokens: 0
    };
    setTurns([...turns, newTurn]);
  };

  const removeTurn = (id) => {
    if (turns.length > 1) {
      setTurns(turns.filter(turn => turn.id !== id));
    }
  };

  const updateTurn = (id, field, value) => {
    setTurns(turns.map(turn => 
      turn.id === id ? { ...turn, [field]: value } : turn
    ));
  };

  const calculateAllCosts = useCallback(async () => {
    if (selectedModels.length === 0) {
      setConversationCosts([]);
      return;
    }

    setIsCalculating(true);
    
    try {
      const turnsWithTokens = await Promise.all(
        turns.map(async (turn) => {
          if (!turn.prompt && !turn.output) {
            return { ...turn, promptTokens: 0, outputTokens: 0 };
          }
          
          const pTokens = await countTokens(turn.prompt, selectedModels[0].split(':')[1]);
          const oTokens = await countTokens(turn.output, selectedModels[0].split(':')[1]);
          
          return {
            ...turn,
            promptTokens: pTokens,
            outputTokens: oTokens
          };
        })
      );

      setTurns(turnsWithTokens);

      const costs = await Promise.all(
        selectedModels.map(async (modelKey) => {
          const [vendorId, modelId] = modelKey.split(':');
          const vendor = pricingData.vendors[vendorId];
          const model = vendor.models.find(m => m.id === modelId);
          
          if (!model) return null;
          
          const conversationCost = calculateConversationCost(turnsWithTokens, model);
          
          return {
            vendorName: vendor.name,
            modelName: model.name,
            modelId: modelId,
            contextWindow: model.context_window,
            ...conversationCost
          };
        })
      );
      
      setConversationCosts(costs.filter(c => c !== null));
    } catch (error) {
      console.error('Error calculating conversation costs:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [turns, selectedModels]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateAllCosts();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [turns, selectedModels, calculateAllCosts]);

  return (
    <div className="conversation-simulator">
      <h3>Conversation Simulator</h3>
      
      <div className="turns-container">
        {turns.map((turn, index) => (
          <div key={turn.id} className="turn-item">
            <div className="turn-header">
              <h4>Turn {index + 1}</h4>
              {turns.length > 1 && (
                <button 
                  className="remove-turn-btn"
                  onClick={() => removeTurn(turn.id)}
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="turn-inputs">
              <div className="input-group">
                <label>Prompt</label>
                <textarea
                  value={turn.prompt}
                  onChange={(e) => updateTurn(turn.id, 'prompt', e.target.value)}
                  placeholder="Enter prompt..."
                  rows={3}
                />
                <div className="token-badge">
                  {formatNumber(turn.promptTokens)} tokens
                </div>
              </div>
              
              <div className="input-group">
                <label>Output</label>
                <textarea
                  value={turn.output}
                  onChange={(e) => updateTurn(turn.id, 'output', e.target.value)}
                  placeholder="Enter expected output..."
                  rows={3}
                />
                <div className="token-badge">
                  {formatNumber(turn.outputTokens)} tokens
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button className="add-turn-btn" onClick={addTurn}>
          + Add Turn
        </button>
      </div>
      
      {conversationCosts.length > 0 && (
        <>
          <div className="conversation-summary">
            <h3>Conversation Cost Summary</h3>
            <div className="summary-table">
              <div className="table-header">
                <div>Provider</div>
                <div>Model</div>
                <div>Total Cost</div>
                <div>Avg Cost/Turn</div>
                <div>Total Tokens</div>
                <div>Context Usage</div>
              </div>
              {conversationCosts.map((cost, index) => {
                const lastTurn = cost.turnCosts[cost.turnCosts.length - 1];
                const contextUsage = lastTurn ? 
                  (lastTurn.contextTokens / cost.contextWindow * 100).toFixed(1) : 0;
                
                return (
                  <div key={index} className="table-row">
                    <div>{cost.vendorName}</div>
                    <div>{cost.modelName}</div>
                    <div className="total-cost">{formatCurrency(cost.totalCost)}</div>
                    <div>{formatCurrency(cost.avgCostPerTurn)}</div>
                    <div>{formatNumber(cost.totalTokens)}</div>
                    <div>{contextUsage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <CostChart conversationCosts={conversationCosts} />
        </>
      )}
    </div>
  );
};

export default ConversationSimulator;