import { Terminal, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConsolePanel = ({ output, isRunning, onClear }) => {
  const { success, logs = [], error, executionTime, note } = output || {};

  return (
    <div className="h-full flex flex-col bg-console-bg rounded-lg border border-panel-border overflow-hidden">
      {/* Console Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">Console Output</span>
        </div>
        <div className="flex items-center gap-3">
          {executionTime !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{executionTime}ms</span>
            </div>
          )}
          {output && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Console Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm scrollbar-thin">
        {isRunning ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Running code...</span>
          </div>
        ) : output ? (
          <div className="space-y-3">
            {/* Status indicator */}
            <div className={`flex items-center gap-2 ${success ? 'text-success' : 'text-destructive'}`}>
              {success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="font-medium">
                {success ? 'Execution successful' : 'Execution failed'}
              </span>
            </div>

            {/* Output logs */}
            {logs.length > 0 && (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`py-1 ${
                      log.type === 'error'
                        ? 'text-destructive'
                        : log.type === 'warn'
                        ? 'text-warning'
                        : 'text-foreground'
                    }`}
                  >
                    <span className="text-muted-foreground mr-2">{'>'}</span>
                    <span className="whitespace-pre-wrap">{log.content}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mt-3 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <pre className="text-destructive text-xs whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {/* Note for mock execution */}
            {note && (
              <div className="mt-3 text-xs text-muted-foreground italic">
                {note}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Terminal className="w-10 h-10 mb-3 opacity-30" />
            <p>Run your code to see output here</p>
            <p className="text-xs mt-1">Press Ctrl+Enter or click Run Code</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;
