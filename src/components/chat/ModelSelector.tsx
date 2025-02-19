import { ModelSelectorProps } from '../../types/chat';

const ModelSelector = ({ selectedModel, onModelChange, models }: ModelSelectorProps) => {
  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="text-white text-sm px-3 py-1.5 rounded-full
               appearance-none cursor-pointer hover:text-gray-300 transition-colors"
      style={{ 
        WebkitAppearance: 'none', 
        MozAppearance: 'none',
        borderRadius: '9999px',
        border: 'none',
        background: 'transparent',
        outline: 'none'
      }}
    >
      {models.map((model) => (
        <option 
          key={model} 
          value={model} 
          className="text-white"
          style={{ 
            background: '#26252a'
          }}
        >
          {model}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector; 