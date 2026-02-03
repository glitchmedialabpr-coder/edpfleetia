import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function TechnicalSupportChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeAgent();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeAgent = async () => {
    try {
      setInitializing(true);
      const conv = await base44.agents.createConversation({
        agent_name: 'Glitch',
        metadata: {
          name: 'Soporte Técnico',
          description: 'Sesión de soporte técnico para resolver problemas'
        }
      });
      
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch (error) {
      console.error('Error initializing agent:', error);
      toast.error('Error al inicializar el agente técnico');
    } finally {
      setInitializing(false);
    }
  };

  const subscribeToUpdates = (convId) => {
    return base44.agents.subscribeToConversation(convId, (data) => {
      setMessages(data.messages || []);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversation) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const unsubscribe = subscribeToUpdates(conversation.id);

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: userMessage
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar mensaje');
      setInput(userMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
          <p className="text-slate-600">Inicializando agente técnico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Glitch - Agente Técnico</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={initializeAgent}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Nueva Sesión
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 text-slate-500">
              <p className="text-lg font-medium">¡Bienvenido!</p>
              <p className="text-sm">Describe cualquier problema técnico que necesites resolver</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe el problema técnico..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}