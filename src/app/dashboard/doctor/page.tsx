import { getSession } from '@/lib/auth';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import ProfileTab from '@/components/doctor/ProfileTab';
import AppointmentsTab from '@/components/doctor/AppointmentsTab';
import SettingsTab from '@/components/doctor/SettingsTab';
import { redirect } from 'next/navigation';

export default async function DoctorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== 'DOCTOR') redirect('/auth/login');

  const { tab } = await searchParams;
  const currentTab = tab || 'profile';

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="DOCTOR" />
      <main className="flex-1 flex flex-col">
        <Navbar userName={session.name || 'Doctor'} role="DOCTOR" />
        <div className="p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'profile' && <ProfileTab />}
          {currentTab === 'appointments' && <AppointmentsTab />}
          {currentTab === 'availability' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
}
