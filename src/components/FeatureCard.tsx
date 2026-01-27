import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard = ({ icon: Icon, title, description, delay = "0s" }: FeatureCardProps) => {
  return (
    <div 
      className="card-feature animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="icon-circle mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
