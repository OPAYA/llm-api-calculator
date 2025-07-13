import React, { useState, useEffect } from 'react';
import pricingData from '../data/pricing.json';

const ModelSelector = ({ selectedModels, onModelSelect }) => {
  const [expandedVendors, setExpandedVendors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const allVendorsExpanded = {};
    Object.keys(pricingData.vendors).forEach(vendor => {
      allVendorsExpanded[vendor] = true;
    });
    setExpandedVendors(allVendorsExpanded);
  }, []);

  const toggleVendor = (vendor) => {
    setExpandedVendors(prev => ({
      ...prev,
      [vendor]: !prev[vendor]
    }));
  };

  const handleModelToggle = (vendorId, modelId) => {
    const key = `${vendorId}:${modelId}`;
    const newSelection = selectedModels.includes(key) 
      ? selectedModels.filter(m => m !== key)
      : [...selectedModels, key];
    onModelSelect(newSelection);
  };

  const selectAllVendorModels = (vendorId) => {
    const vendor = pricingData.vendors[vendorId];
    const vendorModelKeys = vendor.models.map(m => `${vendorId}:${m.id}`);
    const hasAllSelected = vendorModelKeys.every(key => selectedModels.includes(key));
    
    if (hasAllSelected) {
      onModelSelect(selectedModels.filter(key => !vendorModelKeys.includes(key)));
    } else {
      onModelSelect([...new Set([...selectedModels, ...vendorModelKeys])]);
    }
  };

  const filteredVendors = Object.entries(pricingData.vendors).filter(([vendorId, vendor]) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return vendor.name.toLowerCase().includes(term) ||
           vendor.models.some(m => m.name.toLowerCase().includes(term));
  });

  return (
    <div className="model-selector">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="vendors-list">
        {filteredVendors.map(([vendorId, vendor]) => {
          const vendorModelKeys = vendor.models.map(m => `${vendorId}:${m.id}`);
          const hasAllSelected = vendorModelKeys.every(key => selectedModels.includes(key));
          const hasSomeSelected = vendorModelKeys.some(key => selectedModels.includes(key));
          
          return (
            <div key={vendorId} className="vendor-section">
              <div className="vendor-header">
                <button
                  className="vendor-toggle"
                  onClick={() => toggleVendor(vendorId)}
                >
                  {expandedVendors[vendorId] ? '▼' : '▶'}
                </button>
                <label className="vendor-label">
                  <input
                    type="checkbox"
                    checked={hasAllSelected}
                    indeterminate={hasSomeSelected && !hasAllSelected}
                    onChange={() => selectAllVendorModels(vendorId)}
                  />
                  <span className="vendor-name">{vendor.name}</span>
                </label>
              </div>
              
              {expandedVendors[vendorId] && (
                <div className="models-list">
                  {vendor.models.map(model => {
                    const modelKey = `${vendorId}:${model.id}`;
                    const isSelected = selectedModels.includes(modelKey);
                    
                    return (
                      <label key={model.id} className="model-item">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleModelToggle(vendorId, model.id)}
                        />
                        <div className="model-info">
                          <span className="model-name">{model.name}</span>
                          <span className="model-pricing">
                            Input: ${model.input_per_1k}/1K | Output: ${model.output_per_1k}/1K
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelector;