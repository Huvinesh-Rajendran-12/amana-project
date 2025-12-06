import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group p-12 bg-black hover:bg-cream/2 transition-colors duration-500">
      <div className="mb-8 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
        {icon}
      </div>
      <h3 className="text-lg font-normal mb-4 text-cream">{title}</h3>
      <p className="text-sm font-light text-cream/40 leading-relaxed group-hover:text-cream/50 transition-colors duration-500">
        {description}
      </p>
    </div>
  );
}
