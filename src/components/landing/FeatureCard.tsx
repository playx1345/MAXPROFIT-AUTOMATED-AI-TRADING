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
        <Icon className="w-16 sm:w-24 h-16 sm:h-24 text-primary" />
      </div>
      
      <CardHeader className="relative z-10 p-4 sm:p-6">
        <Icon className="h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 text-primary group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
        <CardTitle className="text-xl sm:text-2xl font-serif">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 p-4 sm:p-6 pt-0">
        <CardDescription className="text-sm sm:text-base font-serif">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};
