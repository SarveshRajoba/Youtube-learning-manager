import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const OAuthFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get("error") || "Authentication failed";

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => navigate("/login"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Authentication Failed</CardTitle>
            <CardDescription className="mt-2">
              {decodeURIComponent(error)}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Redirecting to login page in 5 seconds...
          </p>
          <Button 
            onClick={() => navigate("/login")} 
            className="w-full"
            variant="outline"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthFailure;
