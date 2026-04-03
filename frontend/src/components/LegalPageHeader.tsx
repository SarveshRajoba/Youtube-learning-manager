import { Link } from "react-router-dom";
import { PlayCircle, ArrowLeft } from "lucide-react";

const LegalPageHeader = () => {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b max-w-4xl mx-auto w-full">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-foreground">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                YT Learning Manager
            </Link>
            <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
            </Link>
        </header>
    );
};

export default LegalPageHeader;
