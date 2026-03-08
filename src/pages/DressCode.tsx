import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useAuth } from "@/contexts/AuthContext";

import MobileDressCodeLayout from "@/components/dresscode/MobileDressCodeLayout";
import TabletDressCodeLayout from "@/components/dresscode/TabletDressCodeLayout";
import DesktopDressCodeLayout from "@/components/dresscode/DesktopDressCodeLayout";

const DressCode = () => {
  const deviceType = useDeviceType();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  let layout;

  switch (deviceType) {
    case "desktop":
      layout = <DesktopDressCodeLayout />;
      break;

    case "tablet":
      layout = <TabletDressCodeLayout />;
      break;

    default:
      layout = <MobileDressCodeLayout />;
  }

  return <PageLayout showNav>{layout}</PageLayout>;
};

export default DressCode;