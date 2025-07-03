declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  // Wildcard export for all icons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon: React.FC<LucideProps>;
  export default Icon;
}