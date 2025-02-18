import ChatContainer from './components/chat/ChatContainer';
import { OllamaStatus } from './components/OllamaStatus';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-chat-bg text-white">
      {/* Status Bar */}
      <div className="w-full border-b border-white/10">
        <OllamaStatus />
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Half */}
        <div className="w-1/2 border-r border-white/10">
          {/* Left half content will go here */}
        </div>
        
        {/* Right Half - Chat Interface */}
        <div className="w-1/2">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default App;
