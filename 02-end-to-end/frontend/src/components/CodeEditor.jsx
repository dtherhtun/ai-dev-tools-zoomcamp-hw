import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

const languageMap = {
  javascript: 'javascript',
  python: 'python',
  go: 'go',
};

const CodeEditor = ({ code, language, onChange, onMount }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Configure Monaco theme
    monaco.editor.defineTheme('interview-dark', {
      base: 'vs-dark',
      inherit: true,
      colors: {
        'editor.background': '#0f1419',
        'editor.foreground': '#e5e7eb',
        'editor.lineHighlightBackground': '#1f2937',
        'editor.selectionBackground': '#374151',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#9ca3af',
        'editorCursor.foreground': '#22d3ee',
        'editor.selectionHighlightBackground': '#374151',
        'editorBracketMatch.background': '#374151',
        'editorBracketMatch.border': '#22d3ee',
      },
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'operator', foreground: 'f472b6' },
        { token: 'string', foreground: 'fbbf24' },
        { token: 'number', foreground: '22d3ee' },
        { token: 'regexp', foreground: 'fca5a5' },

        // Identifiers and types
        { token: 'type', foreground: '34d399' },
        { token: 'class', foreground: '34d399' },
        { token: 'interface', foreground: '34d399' },
        { token: 'namespace', foreground: '34d399' },
        { token: 'function', foreground: '60a5fa' },
        { token: 'method', foreground: '60a5fa' },

        // Variables and Properties
        { token: 'variable', foreground: 'e5e7eb' },
        { token: 'variable.predefined', foreground: 'ef4444' },
        { token: 'property', foreground: 'bae6fd' },
        { token: 'parameter', foreground: 'fde047' },

        // Specifics
        { token: 'delimiter', foreground: '9ca3af' },
        { token: 'delimiter.bracket', foreground: '9ca3af' },
      ],
    });

    monaco.editor.setTheme('interview-dark');

    // Focus editor
    editor.focus();

    if (onMount) {
      onMount(editor, monaco);
    }
  }, [onMount]);

  const handleChange = useCallback((value) => {
    onChange?.(value || '');
  }, [onChange]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-panel-border">
      <Editor
        height="100%"
        language={languageMap[language] || 'javascript'}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full bg-editor-bg">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading editor...</span>
            </div>
          </div>
        }
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          automaticLayout: true,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16, bottom: 16 },
          folding: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </div>
  );
};

export default CodeEditor;
