import PageLayout from '@/components/PageLayout';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileSneakLayout from '@/components/sneak/MobileSneakLayout';
import TabletSneakLayout from '@/components/sneak/TabletSneakLayout';
import DesktopSneakLayout from '@/components/sneak/DesktopSneakLayout';

const Sneak = () => {
  const deviceType = useDeviceType();

  const renderLayout = () => {
    switch (deviceType) {
      case 'desktop':
        return <DesktopSneakLayout />;
      case 'tablet':
        return <TabletSneakLayout />;
      default:
        return <MobileSneakLayout />;
    }
  };

  return (
    <PageLayout>
      {renderLayout()}
    </PageLayout>
  );
};

export default Sneak;
