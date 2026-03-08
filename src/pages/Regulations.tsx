import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load layouts (improves performance on slower devices)
const MobileRegulationsLayout = lazy(() =>
  import("@/components/regulations/MobileRegulationsLayout")
);
const TabletRegulationsLayout = lazy(() =>
  import("@/components/regulations/TabletRegulationsLayout")
);
const DesktopRegulationsLayout = lazy(() =>
  import("@/components/regulations/DesktopRegulationsLayout")
);

const Regulations = () => {
  const deviceType = useDeviceType();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Protect page: redirect if user not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  let layout;

  switch (deviceType) {
    case "desktop":
      layout = <DesktopRegulationsLayout />;
      break;
    case "tablet":
      layout = <TabletRegulationsLayout />;
      break;
    default:
      layout = <MobileRegulationsLayout />;
  }

  return (
    <PageLayout>
      <Suspense fallback={<div className="text-center text-gold">Loading...</div>}>
        {layout}
      </Suspense>
    </PageLayout>
  );
};

export default Regulations;