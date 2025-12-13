import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="default">
            <Link to="/" className="gap-2">
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
          </Button>
          <Button asChild variant="outline" onClick={() => window.history.back()}>
            <button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
