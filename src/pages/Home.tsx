import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceType } from "@/hooks/useDeviceType";

import MobileHomeLayout from "@/components/home/MobileHomeLayout";
import TabletHomeLayout from "@/components/home/TabletHomeLayout";
import DesktopHomeLayout from "@/components/home/DesktopHomeLayout";

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const deviceType = useDeviceType();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Loading screen while auth state resolves
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-gold">
          Loading...
        </div>
      </PageLayout>
    );
  }

  // Safety fallback (prevents UI flash before redirect)
  if (!isAuthenticated || !user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-gold">
          Redirecting...
        </div>
      </PageLayout>
    );
  }

  let layout;

  switch (deviceType) {
    case "desktop":
      layout = <DesktopHomeLayout userName={user.name} />;
      break;

    case "tablet":
      layout = <TabletHomeLayout userName={user.name} />;
      break;

    default:
      layout = <MobileHomeLayout userName={user.name} />;
  }

  return (
    <PageLayout showNav>
      {layout}
    </PageLayout>
  );
};

export default Home;