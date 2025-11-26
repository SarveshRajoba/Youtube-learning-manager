import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      // OAuth failed
      toast({
        title: "Authentication Failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (token) {
      // OAuth succeeded - store token
      localStorage.setItem("token", token);
      toast({
        title: "Success!",
        description: "Signed in with Google successfully",
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      // No token or error - something went wrong
      toast({
        title: "Authentication Failed",
        description: "No authentication token received",
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [searchParams, navigate, toast]);

  const error = searchParams.get("error");
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
            {error ? (
              <XCircle className="w-8 h-8 text-destructive" />
            ) : token ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {error ? "Authentication Failed" : token ? "Success!" : "Completing Sign In..."}
            </CardTitle>
            <CardDescription>
              {error
                ? "Redirecting to login page..."
                : token
                ? "Redirecting to dashboard..."
                : "Please wait while we complete your authentication"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          {!error && !token && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
