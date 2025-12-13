import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CodeEditor from '@/components/CodeEditor';
import ConsolePanel from '@/components/ConsolePanel';
import UserList from '@/components/UserList';
import LanguageSelector from '@/components/LanguageSelector';
import SessionHeader from '@/components/SessionHeader';
import { connectToSession, disconnect } from '@/lib/websocket';
import { runCode, getTemplate } from '@/lib/codeRunner';
import { useToast } from '@/hooks/use-toast';

const Session = () => {
  const { sessionId } = useParams();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(getTemplate('javascript'));
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [users, setUsers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(true);

  // Connect to WebSocket on mount
  useEffect(() => {
    const ws = connectToSession(sessionId);

    ws.on('connected', () => {
      setIsConnecting(false);
      toast({
        title: 'Connected',
        description: 'You have joined the session.',
      });
    });

    ws.on('user-joined', (user) => {
      if (!user.isCurrentUser) {
        toast({
          title: 'User joined',
          description: `${user.name} has joined the session.`,
        });
      }
    });

    ws.on('users-updated', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    ws.on('language-changed', ({ language: newLang }) => {
      setLanguage(newLang);
      setCode(getTemplate(newLang));
    });

    return () => {
      disconnect();
    };
  }, [sessionId, toast]);

  // Handle language change
  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    setCode(getTemplate(newLanguage));
    setOutput(null);
  }, []);

  // Handle code change
  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  // Run code
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setOutput(null);
    
    try {
      const result = await runCode(code, language);
      setOutput(result);
    } catch (error) {
      setOutput({
        success: false,
        output: '',
        error: error.message,
        logs: [],
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  // Clear output
  const handleClearOutput = useCallback(() => {
    setOutput(null);
  }, []);

  // Keyboard shortcut for running code
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunCode]);

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Connecting to session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <SessionHeader sessionId={sessionId} />
      
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border bg-card/50">
        <div className="flex items-center gap-4">
          <LanguageSelector value={language} onChange={handleLanguageChange} />
        </div>
        
        <Button
          variant="success"
          onClick={handleRunCode}
          disabled={isRunning}
          className="gap-2"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-xs bg-success-foreground/20 rounded">
            Ctrl+↵
          </kbd>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4">
            <CodeEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
            />
          </div>
        </div>

        {/* Right Panel - Console & Users */}
        <div className="w-96 border-l border-panel-border flex flex-col bg-card/30">
          {/* Users list */}
          <div className="p-4">
            <UserList users={users} />
          </div>
          
          {/* Console */}
          <div className="flex-1 p-4 pt-0">
            <ConsolePanel
              output={output}
              isRunning={isRunning}
              onClear={handleClearOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Session;
