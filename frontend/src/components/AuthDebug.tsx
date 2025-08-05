import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AuthDebug = () => {
    const [token, setToken] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        setToken(storedToken);
    }, []);

    const clearToken = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    const testApi = async () => {
        try {
            const response = await fetch("http://localhost:3000/playlists", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            console.log("API Response:", response.status, response.statusText);
            const data = await response.json();
            console.log("API Data:", data);
        } catch (error) {
            console.error("API Error:", error);
        }
    };

    if (!isVisible) {
        return (
            <Button
                onClick={() => setIsVisible(true)}
                variant="outline"
                size="sm"
                className="fixed bottom-4 right-4 z-50"
            >
                Debug Auth
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-4 right-4 w-80 z-50">
            <CardHeader>
                <CardTitle className="text-sm">Auth Debug</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-xs">
                    <strong>Token:</strong> {token ? "Present" : "Missing"}
                </div>
                {token && (
                    <div className="text-xs break-all">
                        <strong>Token:</strong> {token.substring(0, 50)}...
                    </div>
                )}
                <div className="flex gap-2">
                    <Button onClick={testApi} size="sm">
                        Test API
                    </Button>
                    <Button onClick={clearToken} size="sm" variant="destructive">
                        Clear Token
                    </Button>
                    <Button onClick={() => setIsVisible(false)} size="sm" variant="outline">
                        Hide
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AuthDebug; 