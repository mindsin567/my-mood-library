import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="badge-wellness">
            <Sparkles className="w-4 h-4" />
            <span>Your mental wellness journey starts here</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Nurture your mind with{" "}
          <span className="text-gradient-primary">mindful journaling</span>
          {" "}and AI support
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Track your moods, reflect through journaling, and get personalized insights 
          from your AI companion. A safe space for your mental wellness journey.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button variant="hero" size="xl">
            Start Your Journey
          </Button>
          <Button variant="heroOutline" size="xl">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
