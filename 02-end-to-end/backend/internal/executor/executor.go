package executor

import (
	"bytes"
	"context"
	"fmt"
	"os"

	"github.com/tetratelabs/wazero"
	"github.com/tetratelabs/wazero/imports/wasi_snapshot_preview1"
)

// Executor defines the interface for running code
type Executor interface {
	Run(ctx context.Context, code string) (string, error)
}

// Engine manages different language executors
type Engine struct {
	runtimes map[string]Executor
}

func NewEngine() *Engine {
	return &Engine{
		runtimes: map[string]Executor{
			"javascript": &WasmExecutor{BinaryPath: "wasm/quickjs.wasm", Name: "javascript"},
			"python":     &WasmExecutor{BinaryPath: "wasm/python.wasm", Name: "python"}, // Placeholder
			"go":         &MockGoExecutor{},                                             // Placeholder for now
		},
	}
}

func (e *Engine) Execute(ctx context.Context, code, language string) (string, error) {
	runner, ok := e.runtimes[language]
	if !ok {
		return "", fmt.Errorf("unsupported language: %s", language)
	}
	return runner.Run(ctx, code)
}

// WasmExecutor runs code using a WASM binary (e.g. QuickJS)
type WasmExecutor struct {
	BinaryPath string
	Name       string
}

func (w *WasmExecutor) Run(ctx context.Context, code string) (string, error) {
	// Check if binary exists
	if _, err := os.Stat(w.BinaryPath); os.IsNotExist(err) {
		return fmt.Sprintf("Mock Output for %s:\n%s\n(WASM binary not found at %s)", w.Name, code, w.BinaryPath), nil
	}

	// Initialize wazero runtime
	r := wazero.NewRuntime(ctx)
	defer r.Close(ctx)

	wasi_snapshot_preview1.MustInstantiate(ctx, r)

	// Load binary
	wasmBytes, err := os.ReadFile(w.BinaryPath)
	if err != nil {
		return "", fmt.Errorf("failed to read wasm binary: %w", err)
	}

	// Capture stdout/stderr
	var stdout, stderr bytes.Buffer

	// QuickJS/Python WASM usually take code as an argument or stdin
	// Here we assume stdin for simplicity or a specific argument pattern
	// For QuickJS standalone, usually `qjs -e 'code'` or stdin.

	config := wazero.NewModuleConfig().
		WithStdout(&stdout).
		WithStderr(&stderr).
		WithStdin(bytes.NewBufferString(code)) // Feed code to stdin

		// Enforce limits? wazero supports it with ctx, or memory limits
		// .WithMemoryLimitPages(256) (16MB)

	_, err = r.InstantiateWithConfig(ctx, wasmBytes, config)
	if err != nil {
		return stderr.String(), fmt.Errorf("runtime error: %w", err)
	}

	return stdout.String(), nil
}

// MockGoExecutor simulates Go execution since compiling Go to WASM on the fly is heavy
type MockGoExecutor struct{}

func (m *MockGoExecutor) Run(ctx context.Context, code string) (string, error) {
	// In a real generic executor, we'd run `go run` or compile to WASM
	return fmt.Sprintf("Mock Go Output:\nRun: %s\n(Server-side compilation mocked)", code), nil
}
