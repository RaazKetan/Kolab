import React, { useEffect, useRef, useState } from 'react';

export const ChatView = ({
  selectedProject,
  chatMessages,
  chatInput,
  setChatInput,
  onSend,
  onBack,
  currentUser,
  otherPerson
}) => {
  const messagesEndRef = useRef(null);
  const [isSending, setIsSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (chatInput.trim() && !isSending) {
      setIsSending(true);
      try {
        await onSend();
      } finally {
        // Re-enable button after 1 second
        setTimeout(() => setIsSending(false), 1000);
      }
    }
  };

  const isCurrentUserMessage = (message) => {
    return message.from_user_id === currentUser?.id;
  };

  // Use the otherPerson prop directly since it's now properly fetched in App.jsx
  const otherPersonInChat = otherPerson;

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-blue-500 rounded-full transition-colors"
            >
              ←
            </button>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                {otherPersonInChat?.avatar_url ? (
                  <img 
                    src={otherPersonInChat.avatar_url} 
                    alt={otherPersonInChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold">
                    {otherPersonInChat?.name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{otherPersonInChat?.name || `User #${selectedProject.owner_id}`}</h2>
                <p className="text-blue-100 text-sm">@{otherPersonInChat?.username || 'unknown'}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Project: {selectedProject.title}</p>
            <p className="text-xs text-blue-200">Chat about collaboration</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium">Start the conversation!</p>
            <p className="text-sm">Send a message to begin chatting about this project.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-xs lg:max-w-md ${isCurrentUserMessage(message) ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isCurrentUserMessage(message) 
                      ? 'ml-2 bg-blue-500 text-white' 
                      : 'mr-2 bg-gray-300 text-gray-600'
                  }`}>
                    {isCurrentUserMessage(message) 
                      ? currentUser?.name?.charAt(0) || 'U'
                      : otherPersonInChat?.name?.charAt(0) || 'O'
                    }
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isCurrentUserMessage(message)
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isCurrentUserMessage(message) 
                        ? 'text-blue-100' 
                        : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isSending}
            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>{isSending ? 'Sending...' : 'Send'}</span>
            <span>{isSending ? '⏳' : '📤'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};