import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { 
  Brain, 
  Search, 
  Calendar,
  Clock,
  PlayCircle,
  Bookmark,
  Share,
  Edit,
  Trash2,
  Plus,
  Filter,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mock data
const summariesData = [
  {
    id: 1,
    title: "React Hooks Deep Dive - Key Concepts",
    videoTitle: "Understanding useEffect and useState",
    playlist: "React Masterclass",
    summary: "This video covers the fundamental React hooks including useState for state management and useEffect for side effects. Key points include: dependency arrays control when effects run, cleanup functions prevent memory leaks, useState can hold any type of data, and effects run after render by default.",
    keyPoints: [
      "useState manages component state and triggers re-renders",
      "useEffect handles side effects like API calls and subscriptions",
      "Dependency arrays optimize performance by controlling effect execution",
      "Cleanup functions in useEffect prevent memory leaks"
    ],
    tags: ["React", "Hooks", "useState", "useEffect"],
    generatedAt: "2024-01-21T14:30:00Z",
    videoDuration: "25:30",
    confidence: 95,
    isBookmarked: true
  },
  {
    id: 2,
    title: "Node.js Authentication Strategies",
    videoTitle: "JWT vs Session-based Authentication",
    playlist: "Backend Development",
    summary: "Comprehensive comparison of JWT and session-based authentication in Node.js applications. Covers security considerations, scalability implications, and implementation patterns for both approaches.",
    keyPoints: [
      "JWT tokens are stateless and enable distributed authentication",
      "Session-based auth requires server-side storage but easier to revoke",
      "Security considerations differ between approaches",
      "Hybrid approaches can combine benefits of both methods"
    ],
    tags: ["Node.js", "Authentication", "JWT", "Sessions", "Security"],
    generatedAt: "2024-01-20T10:15:00Z",
    videoDuration: "32:15",
    confidence: 88,
    isBookmarked: false
  },
  {
    id: 3,
    title: "CSS Grid Layout Fundamentals",
    videoTitle: "Mastering CSS Grid for Modern Layouts",
    playlist: "Frontend Mastery",
    summary: "Introduction to CSS Grid system for creating complex, responsive layouts. Covers grid container properties, grid item positioning, and practical layout patterns.",
    keyPoints: [
      "Grid containers define the grid structure with rows and columns",
      "Grid items can span multiple cells using grid-column and grid-row",
      "Auto-placement algorithm handles items without explicit positioning",
      "Grid is ideal for two-dimensional layouts unlike Flexbox"
    ],
    tags: ["CSS", "Grid", "Layout", "Responsive Design"],
    generatedAt: "2024-01-19T16:20:00Z",
    videoDuration: "18:45",
    confidence: 92,
    isBookmarked: true
  }
];

const Summaries = () => {
  const [summaries, setSummaries] = useState(summariesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredSummaries = summaries.filter(summary =>
    summary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBookmark = (summaryId: number) => {
    setSummaries(summaries.map(summary => 
      summary.id === summaryId 
        ? { ...summary, isBookmarked: !summary.isBookmarked }
        : summary
    ));
    
    const summary = summaries.find(s => s.id === summaryId);
    toast({
      title: summary?.isBookmarked ? "Bookmark removed" : "Bookmark added",
      description: summary?.isBookmarked ? 
        "Summary removed from bookmarks" : 
        "Summary saved to bookmarks",
    });
  };

  const handleDelete = (summaryId: number) => {
    setSummaries(summaries.filter(summary => summary.id !== summaryId));
    toast({
      title: "Summary deleted",
      description: "The AI summary has been permanently deleted.",
    });
  };

  const handleViewSummary = (summary: any) => {
    setSelectedSummary(summary);
    setIsViewDialogOpen(true);
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Summaries</h1>
            <p className="text-muted-foreground mt-2">
              AI-generated summaries of your learning videos
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Summary
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search summaries, videos, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarked
            </Button>
          </div>
        </div>

        {/* Summaries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSummaries.map((summary) => (
            <Card key={summary.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight cursor-pointer hover:text-primary transition-colors line-clamp-2">
                      <button onClick={() => handleViewSummary(summary)} className="text-left">
                        {summary.title}
                      </button>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getConfidenceColor(summary.confidence)}`}
                      >
                        {summary.confidence}% confident
                      </Badge>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewSummary(summary)}>
                        <Edit className="mr-2 h-4 w-4" />
                        View Full Summary
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBookmark(summary.id)}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        {summary.isBookmarked ? "Remove Bookmark" : "Bookmark"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="mr-2 h-4 w-4" />
                        Share Summary
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(summary.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Video Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">From Video:</h4>
                  <p className="font-medium">{summary.videoTitle}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{summary.playlist}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {summary.videoDuration}
                    </span>
                  </div>
                </div>
                
                {/* Summary Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Summary:</h4>
                  <p className="text-sm text-foreground line-clamp-3">
                    {summary.summary}
                  </p>
                </div>
                
                {/* Key Points Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Key Points:</h4>
                  <div className="space-y-1">
                    {summary.keyPoints.slice(0, 2).map((point, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <p className="text-muted-foreground">{point}</p>
                      </div>
                    ))}
                    {summary.keyPoints.length > 2 && (
                      <p className="text-xs text-muted-foreground pl-3">
                        +{summary.keyPoints.length - 2} more points
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {summary.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {summary.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{summary.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatTimeAgo(summary.generatedAt)}
                    </span>
                    {summary.isBookmarked && (
                      <Bookmark className="h-3 w-3 text-primary fill-current" />
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewSummary(summary)}>
                    View Full
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSummaries.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No summaries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Generate your first AI summary from a video"}
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Generate First Summary
            </Button>
          </div>
        )}

        {/* View Summary Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedSummary && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedSummary.title}</DialogTitle>
                  <DialogDescription className="space-y-2">
                    <div>From: <span className="font-medium">{selectedSummary.videoTitle}</span></div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{selectedSummary.playlist}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedSummary.videoDuration}
                      </span>
                      <Badge className={getConfidenceColor(selectedSummary.confidence)}>
                        {selectedSummary.confidence}% confident
                      </Badge>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Full Summary */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedSummary.summary}
                    </p>
                  </div>
                  
                  {/* Key Points */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Key Learning Points</h3>
                    <div className="space-y-3">
                      {selectedSummary.keyPoints.map((point: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <p className="text-muted-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSummary.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      onClick={() => handleBookmark(selectedSummary.id)}
                      variant={selectedSummary.isBookmarked ? "default" : "outline"}
                      className="gap-2"
                    >
                      <Bookmark className="h-4 w-4" />
                      {selectedSummary.isBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Watch Video
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Summaries;