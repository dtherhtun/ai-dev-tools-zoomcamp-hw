// Real API implementation
export const getTemplate = (language) => {
  // Keep templates locally or fetch from backend? Keeping locally for simplicity now
  const languageTemplates = {
    javascript: `// JavaScript Example\nconsole.log("Hello World");`,
    python: `# Python Example\nprint("Hello World")`,
    go: `// Go Example\npackage main\nimport "fmt"\nfunc main() {\n\tfmt.Println("Hello World")\n}`
  };
  return languageTemplates[language] || "";
};

export const runCode = async (code, language) => {
  try {
    const response = await fetch('http://localhost:8080/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`Execution failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Result format: { success, output, error, executionTime }
    // Frontend expects: { success, output, logs, error, executionTime }

    return {
      success: result.success,
      output: result.output,
      logs: [{ type: 'log', content: result.output }], // Simplification
      error: result.error,
      executionTime: result.executionTime,
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error.message,
      executionTime: 0,
    };
  }
};
