import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useAuth } from "@/contexts/AuthContext";

import MobileSneakLayout from "@/components/sneak/MobileSneakLayout";
import TabletSneakLayout from "@/components/sneak/TabletSneakLayout";
import DesktopSneakLayout from "@/components/sneak/DesktopSneakLayout";

const Sneak = () => {
  const deviceType = useDeviceType();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  let layout;

  switch (deviceType) {
    case "desktop":
      layout = <DesktopSneakLayout />;
      break;

    case "tablet":
      layout = <TabletSneakLayout />;
      break;

    default:
      layout = <MobileSneakLayout />;
  }

  return <PageLayout>{layout}</PageLayout>;
};

export default Sneak;