import { learningRecommendations } from "@/data/mockData";
import { BookOpen, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-primary/10 text-primary border-primary/20",
  Intermediate: "bg-warning/10 text-warning border-warning/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

const LearningPanel = () => {
  return (
    <div className="p-4 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Recommendations</span>
      </div>
      {learningRecommendations.map((rec) => (
        <div key={rec.id} className="bg-surface rounded-lg p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-accent shrink-0" />
              <span className="text-xs font-semibold text-foreground">{rec.title}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">{rec.category}</Badge>
            <span className={`text-[10px] px-1.5 py-0 rounded border ${difficultyColors[rec.difficulty]}`}>
              {rec.difficulty}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.content}</p>
        </div>
      ))}
    </div>
  );
};

export default LearningPanel;
