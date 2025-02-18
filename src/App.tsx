import ChatContainer from './components/chat/ChatContainer';

const App = () => {
  return (
    <div className="flex min-h-screen bg-chat-bg text-white">
      {/* Left Half */}
      <div className="w-1/2 border-r border-white/10">
        {/* Left half content will go here */}
      </div>
      
      {/* Right Half - Chat Interface */}
      <div className="w-1/2">
        <ChatContainer />
      </div>
    </div>
  );
};

export default App;
