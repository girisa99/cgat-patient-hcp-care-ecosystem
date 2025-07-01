
import { ReactNode } from 'react';

export interface NavItem {
  title: string;
  to: string;
  icon: ReactNode;
  page: ReactNode;
}
