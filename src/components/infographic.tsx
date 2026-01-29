import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { TopicCard } from "@/components/topic-card";

interface Topic {
  id: number;
  name: string;
  shortName: string;
  hours: number;
  percentage: number;
  color: string;
  icon: string;
  category: string;
  subtopicsFile: string;
  keywords: string[];
}

interface Profession {
  name: string;
  slug: string;
  totalHours: number;
  description: string;
}

interface TopicsData {
  profession: Profession;
  topics: Topic[];
}

type DataSource = "uzemelteto" | "szoftverfejleszto";

export function Infographic() {
  const [dataSource, setDataSource] = useState<DataSource>("uzemelteto");
  const [data, setData] = useState<TopicsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const jsonFile = dataSource === "uzemelteto" 
      ? "/topics-uzemelteto.json" 
      : "/topics-szoftverfejleszto.json";
    
    let cancelled = false;
    
    // Use setTimeout to defer setState to next tick
    const loadingTimeout = setTimeout(() => {
      if (!cancelled) {
        setIsLoading(true);
      }
    }, 0);
    
    fetch(jsonFile)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error loading topics.json:", err);
          setIsLoading(false);
        }
      });
    
    return () => {
      cancelled = true;
      clearTimeout(loadingTimeout);
    };
  }, [dataSource]);

  const loading = isLoading || !data;

  const toggleDataSource = () => {
    setDataSource((prev) => prev === "uzemelteto" ? "szoftverfejleszto" : "uzemelteto");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1B26] flex items-center justify-center text-white">
        <div>Betöltés...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#1A1B26] flex items-center justify-center text-white">
        <div>Hiba az adatok betöltésekor</div>
      </div>
    );
  }

  // Calculate hours from percentage and sort topics by hours descending
  const sortedTopics = [...data.topics]
    .map((topic) => ({
      ...topic,
      hours: Math.round((data.profession.totalHours * topic.percentage) / 100),
    }))
    .sort((a, b) => b.hours - a.hours);

  // Calculate arc paths for donut chart
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  const innerRadius = 50;

  const createArcPath = (startAngle: number, endAngle: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const arcs = sortedTopics.reduce((acc, topic, index) => {
    const previousEndAngle = index === 0 ? 0 : acc[index - 1].endAngle;
    const startAngle = previousEndAngle;
    const endAngle = startAngle + (topic.percentage / 100) * 360;
    const midAngle = (startAngle + endAngle) / 2;

    // Calculate label position (on the outer edge of the donut)
    const labelRadius = radius - 10; // Slightly inside the outer edge
    const labelX = centerX + labelRadius * Math.cos(((midAngle - 90) * Math.PI) / 180);
    const labelY = centerY + labelRadius * Math.sin(((midAngle - 90) * Math.PI) / 180);

    acc.push({
      ...topic,
      startAngle,
      endAngle,
      midAngle,
      path: createArcPath(startAngle, endAngle),
      labelX,
      labelY,
    });

    return acc;
  }, [] as Array<{
    id: number;
    name: string;
    shortName: string;
    hours: number;
    percentage: number;
    color: string;
    startAngle: number;
    endAngle: number;
    midAngle: number;
    path: string;
    labelX: number;
    labelY: number;
  }>);

  return (
    <div className="min-h-screen bg-[#1A1B26] text-white relative">
      {/* Close button */}
      <button className="absolute top-6 left-6 z-10 p-2 rounded-lg hover:bg-white/10 transition-colors">
        <X className="w-5 h-5" />
      </button>
      
      {/* Data source toggle button */}
      <button
        onClick={toggleDataSource}
        className="absolute top-6 right-6 z-10 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
        title={`Váltás: ${dataSource === "uzemelteto" ? "Szoftverfejlesztő" : "Üzemeltető"}`}
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">
          {dataSource === "uzemelteto" ? "Üzemeltető" : "Fejlesztő"}
        </span>
      </button>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            {(() => {
              const parts = data.profession.name.split(/\s+(?=technikus)/i);
              return parts.map((part, index) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {part}
                </span>
              ));
            })()}
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Szakmai képzési struktúra - 2026
          </p>
          <div className="inline-block px-6 py-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-gray-300">Összes óraszám: </span>
            <span className="text-2xl font-bold text-white">
              {data.profession.totalHours} óra
            </span>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Donut Chart */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-square">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
              >
                {arcs.map((arc) => (
                  <g key={arc.id}>
                    <path
                      d={arc.path}
                      fill={arc.color}
                      className="transition-opacity hover:opacity-80"
                    />
                    {arc.percentage >= 3 && (
                      <text
                        x={arc.labelX}
                        y={arc.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="7"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {arc.percentage}%
                      </text>
                    )}
                  </g>
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-5xl font-bold text-white">
                  {data.profession.totalHours}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wider mt-1">
                  ÓRA
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Topic List */}
          <div className="flex flex-col gap-1.5">
            {sortedTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
