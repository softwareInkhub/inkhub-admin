import { redirect } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';

export default function DesignLibraryIndexRedirect() {
  redirect('/design-library/designs');
  const { designs, totalDesigns } = useSelector((state: RootState) => state.designLibrary);
  return (
    <>
      <UniversalAnalyticsBar section="design library" tabKey="designs" total={totalDesigns} currentCount={designs.length} />
      {null}
    </>
  );
} 