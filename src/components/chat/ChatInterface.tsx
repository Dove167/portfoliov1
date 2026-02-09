import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm Josh's AI assistant. Type / to see available commands, or ask me anything about Josh's projects, skills, or experience.",
    timestamp: new Date()
  }
];

const commands = [
  { id: 'projects', command: '/projects', description: 'View my projects' },
  { id: 'resume', command: '/resume', description: 'See my resume' },
  { id: 'about', command: '/about', description: 'Learn about me' },
  { id: 'contact', command: '/contact', description: 'Get in touch' },
  { id: 'skills', command: '/skills', description: 'View my skills' },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowCommands(false);
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I can help you with that! For now, I'm a demo. Type /projects to see Josh's work, or ask about his experience as a full-stack developer.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCommand = (command: string) => {
    setInput(command);
    setShowCommands(false);
    const inputElement = document.getElementById('chat-input');
    inputElement?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-[#1B2933] rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-[#898371] text-[#1B2933]'
                  : 'bg-[#D3CCB9] text-[#1B2933]'
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#D3CCB9] rounded-lg px-4 py-2">
              <p className="text-sm text-[#1B2933]">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showCommands && (
        <div className="bg-[#2A3A45] rounded-lg mx-4 mb-2 p-2">
          {commands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => handleCommand(cmd.command)}
              className="w-full text-left px-3 py-2 rounded hover:bg-[#3A4A55] text-[#D3CCB9] text-sm"
            >
              <span className="font-mono text-[#898371]">{cmd.command}</span>
              <span className="ml-2 opacity-70">- {cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      <div className="p-4 bg-[#2A3A45]">
        <div className="relative">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowCommands(e.target.value === '/');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type / for commands..."
            className="w-full bg-[#1B2933] text-[#D3CCB9] placeholder-[#898371] rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#898371]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#898371] hover:text-[#D3CCB9] disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
