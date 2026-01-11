import DashboardNavbar from '@/components/DashboardNavbar';

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardNavbar>
      {children}
    </DashboardNavbar>
  );
}
