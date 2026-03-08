import PageLayout from '@/components/PageLayout';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileDressCodeLayout from '@/components/dresscode/MobileDressCodeLayout';
import TabletDressCodeLayout from '@/components/dresscode/TabletDressCodeLayout';
import DesktopDressCodeLayout from '@/components/dresscode/DesktopDressCodeLayout';

const DressCode = () => {
  const deviceType = useDeviceType();

  return (
    <PageLayout showNav>
      {deviceType === 'mobile' && <MobileDressCodeLayout />}
      {deviceType === 'tablet' && <TabletDressCodeLayout />}
      {deviceType === 'desktop' && <DesktopDressCodeLayout />}
    </PageLayout>
  );
};

export default DressCode;
