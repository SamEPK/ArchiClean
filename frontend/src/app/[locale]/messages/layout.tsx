'use client';

import DashboardNavbar from '@/components/DashboardNavbar';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardNavbar>{children}</DashboardNavbar>;
}
