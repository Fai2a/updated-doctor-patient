import { getSession } from '@/lib/auth';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import BookingTab from '@/components/patient/BookingTab';
import MyAppointmentsTab from '@/components/patient/MyAppointmentsTab';
import { redirect } from 'next/navigation';

export default async function PatientDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'PATIENT') redirect('/auth/login');

  const { tab } = await searchParams;
  const currentTab = tab || 'find';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="PATIENT" />
      <main className="flex-1 flex flex-col">
        <Navbar userName={session.name || 'Patient'} role="PATIENT" />
        <div className="p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'find' && <BookingTab />}
          {currentTab === 'bookings' && <MyAppointmentsTab />}
        </div>
      </main>
    </div>
  );
}
