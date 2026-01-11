'use client';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardNavbar>{children}</DashboardNavbar>;
}
