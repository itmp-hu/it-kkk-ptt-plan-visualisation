import { Card } from "@/components/ui/card";

interface TopicCardProps {
  topic: {
    id: number;
    name: string;
    hours: number;
    percentage: number;
    color: string;
  };
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-4 px-4 py-0.5">
        {/* Color Indicator */}
        <div
          className="w-4 h-4 rounded flex-shrink-0"
          style={{ backgroundColor: topic.color }}
        />
        {/* Topic Name */}
        <div className="flex-1 font-semibold text-white text-lg">
          {topic.name}
        </div>
        {/* Hours */}
        <div className="text-gray-400 text-sm">
          {topic.hours} óra
        </div>
        {/* Percentage */}
        <div
          className="font-bold text-lg min-w-[50px] text-right"
          style={{ color: topic.color }}
        >
          {topic.percentage}%
        </div>
      </div>
    </Card>
  );
}
