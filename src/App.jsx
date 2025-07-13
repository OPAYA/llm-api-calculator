import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ModelSelector from './components/ModelSelector';
import Calculator from './components/Calculator';
import ConversationSimulator from './components/ConversationSimulator';
import './App.css';

function AppContent() {
  const [selectedModels, setSelectedModels] = useState([]);
  const [activeTab, setActiveTab] = useState('calculator');
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const defaultModels = ['openai:gpt-4o-mini', 'anthropic:claude-3-haiku'];
    setSelectedModels(defaultModels);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>LLM API Cost Calculator</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <h2>Select Models</h2>
          <ModelSelector 
            selectedModels={selectedModels}
            onModelSelect={setSelectedModels}
          />
        </aside>

        <main className="main-content">
          <div className="page-intro">
            <p>Compare API costs across major LLM providers in real-time. Calculate token usage and optimize your AI spending.</p>
          </div>
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
            >
              Token Calculator
            </button>
            <button 
              className={`tab ${activeTab === 'conversation' ? 'active' : ''}`}
              onClick={() => setActiveTab('conversation')}
            >
              Conversation Simulator
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'calculator' && (
              <Calculator selectedModels={selectedModels} />
            )}
            {activeTab === 'conversation' && (
              <ConversationSimulator selectedModels={selectedModels} />
            )}
          </div>
        </main>
      </div>

      <footer className="app-footer">
        <p>All data processed locally | <a href="https://github.com/OPAYA/llm-api-calculator" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;