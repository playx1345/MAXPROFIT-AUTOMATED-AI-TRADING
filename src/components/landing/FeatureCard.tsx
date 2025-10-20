import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="group relative overflow-hidden glass-card hover:scale-105 hover:shadow-glow hover:border-primary/40 transition-all duration-300">

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Bitcoin watermark */}
      <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 text-primary" />
      </div>
      
      <CardHeader className="relative z-10">
        <Icon className="h-12 w-12 mb-4 text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};
