'use client';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function AccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardNavbar>{children}</DashboardNavbar>;
}
