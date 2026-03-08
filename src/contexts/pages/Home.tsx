import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileHomeLayout from '@/components/home/MobileHomeLayout';
import TabletHomeLayout from '@/components/home/TabletHomeLayout';
import DesktopHomeLayout from '@/components/home/DesktopHomeLayout';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const deviceType = useDeviceType();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const renderLayout = () => {
    switch (deviceType) {
      case 'desktop':
        return <DesktopHomeLayout userName={user?.name} />;
      case 'tablet':
        return <TabletHomeLayout userName={user?.name} />;
      default:
        return <MobileHomeLayout userName={user?.name} />;
    }
  };

  return (
    <PageLayout>
      {renderLayout()}
    </PageLayout>
  );
};

export default Home;
