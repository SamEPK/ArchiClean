'use client';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardNavbar>{children}</DashboardNavbar>;
}
