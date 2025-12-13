import { Link, Copy, Check, Home, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const SessionHeader = ({ sessionId }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const sessionUrl = `${window.location.origin}/session/${sessionId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Session link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-panel-border">
      <div className="flex items-center gap-4">
        <a href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Home className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold hidden sm:inline">CodeInterview</span>
        </a>
        
        <div className="h-6 w-px bg-border hidden sm:block" />
        
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-panel-border">
            <Link className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground hidden md:inline">
              Session:
            </span>
            <span className="font-mono text-xs text-primary">
              {sessionId.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="editor"
          size="sm"
          onClick={copyToClipboard}
          className="gap-2"
        >
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </Button>
        
        <Button
          variant="editor"
          size="sm"
          onClick={copyToClipboard}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>
    </header>
  );
};

export default SessionHeader;
