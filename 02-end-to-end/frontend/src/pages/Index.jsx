import { useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Code2, Users, Zap, Play, ArrowRight, Sparkles, LogIn, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const features = [
  {
    icon: Code2,
    title: 'Professional Editor',
    description: 'Monaco-powered editor with syntax highlighting for JavaScript, Python, and Go.',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'Multiple users can edit code simultaneously with live presence indicators.',
  },
  {
    icon: Play,
    title: 'Instant Execution',
    description: 'Run code directly in the browser and see output in real-time.',
  },
  {
    icon: Zap,
    title: 'Zero Setup',
    description: 'No installation required. Just create a session and share the link.',
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const createSession = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ language: 'javascript' }) // Default language
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/session/${data.sessionId}`);
      } else {
        console.error('Failed to create session');
      }
    } catch (e) {
      console.error('Error creating session:', e);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">CodeInterview</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">Hi, {user.username}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-6 pt-16 pb-24 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Collaborative Coding Made Simple</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Real-time{' '}
              <span className="text-primary">Coding Interviews</span>
              <br />
              Without the Hassle
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              Create a collaborative coding session in seconds. No signup required.
              Just share the link and start coding together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button
                variant="hero"
                size="xl"
                onClick={createSession}
                className="group"
              >
                <span>{user ? 'Create New Session' : 'Login to Create Session'}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card/50 border border-panel-border hover:border-primary/30 transition-all duration-300 hover:bg-card animate-fade-in"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Code Preview Mock */}
          <div className="mt-24 relative animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-panel-border overflow-hidden bg-card/50 backdrop-blur-sm shadow-2xl">
              {/* Mock editor header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-panel-border bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <span className="ml-4 text-xs text-muted-foreground font-mono">interview-session.js</span>
              </div>

              {/* Mock code */}
              <div className="p-6 font-mono text-sm">
                <pre className="text-muted-foreground">
                  <code>
                    <span className="text-purple-400">function</span>{' '}
                    <span className="text-blue-400">solveProblem</span>
                    <span className="text-foreground">(</span>
                    <span className="text-orange-300">input</span>
                    <span className="text-foreground">) {'{'}</span>
                    {'\n'}
                    {'  '}
                    <span className="text-gray-500">// Your collaborative code here</span>
                    {'\n'}
                    {'  '}
                    <span className="text-purple-400">return</span>{' '}
                    <span className="text-green-400">solution</span>
                    <span className="text-foreground">;</span>
                    {'\n'}
                    <span className="text-foreground">{'}'}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-panel-border py-8 px-6">
          <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
            <p>Built for seamless technical interviews</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
