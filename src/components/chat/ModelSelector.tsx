import { ModelSelectorProps } from '../../types/chat';

const ModelSelector = ({ selectedModel, onModelChange, models }: ModelSelectorProps) => {
  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="bg-gray-800/95 text-white text-sm px-3 py-1.5 rounded-full border border-white/10 
               appearance-none cursor-pointer hover:bg-gray-700/95 transition-colors
               focus:outline-none focus:ring-2 focus:ring-white/20"
      style={{ 
        WebkitAppearance: 'none', 
        MozAppearance: 'none',
        borderRadius: '9999px'
      }}
    >
      {models.map((model) => (
        <option 
          key={model} 
          value={model} 
          className="bg-gray-800 rounded-lg"
          style={{ borderRadius: '0.5rem' }}
        >
          {model}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector; 