import { Heart, Brain, Sparkles } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: Heart,
    title: "Mood Tracking",
    description: "Log your emotions daily and discover patterns in your mental well-being over time.",
  },
  {
    icon: Brain,
    title: "Mindful Journaling",
    description: "Express your thoughts freely with guided prompts designed for self-reflection.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Get personalized recommendations and insights from your AI wellness companion.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={`${0.4 + index * 0.1}s`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
