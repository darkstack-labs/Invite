import PageLayout from '@/components/PageLayout';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileRegulationsLayout from '@/components/regulations/MobileRegulationsLayout';
import TabletRegulationsLayout from '@/components/regulations/TabletRegulationsLayout';
import DesktopRegulationsLayout from '@/components/regulations/DesktopRegulationsLayout';

const Regulations = () => {
  const deviceType = useDeviceType();

  const renderLayout = () => {
    switch (deviceType) {
      case 'desktop':
        return <DesktopRegulationsLayout />;
      case 'tablet':
        return <TabletRegulationsLayout />;
      default:
        return <MobileRegulationsLayout />;
    }
  };

  return (
    <PageLayout>
      {renderLayout()}
    </PageLayout>
  );
};

export default Regulations;
