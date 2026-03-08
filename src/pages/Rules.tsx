import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useAuth } from "@/contexts/AuthContext";

import MobileRulesLayout from "@/components/rules/MobileRulesLayout";
import TabletRulesLayout from "@/components/rules/TabletRulesLayout";
import DesktopRulesLayout from "@/components/rules/DesktopRulesLayout";

const rules = [
  "No inappropriate behaviour allowed.",
  "No requesting alcohol or substances. Any such activity will result in being kicked out of the venue.",
  "Any form of violent behaviour is strictly restricted.",
  "Shouting loudly is not allowed except while singing & dancing — even then, within sensible limits.",
  "Any orders for food and drinks are strictly restricted.",
  "In case food/drinks are needed, do not order directly. Inform the **Organisers**.",
  "Failure to follow the dress code may result in denied entry.",
  "All guests must exit the venue by **9:00 PM**.",
  "Everyone is responsible for their own belongings.",
  "Submit the contribution via QR by **15th Feb**, or by **13th Jan** for cash.",
  "If not attending, inform by **15th Feb** — or payment is still required. No exceptions.",
  "**No refunds** under any circumstances.",
];

const Rules = () => {
  const deviceType = useDeviceType();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  const formatRule = (rule: string) => {
    return rule.split("**").map((part, index) =>
      index % 2 === 1 ? (
        <strong key={index} className="text-gold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  let layout;

  switch (deviceType) {
    case "desktop":
      layout = <DesktopRulesLayout rules={rules} formatRule={formatRule} />;
      break;

    case "tablet":
      layout = <TabletRulesLayout rules={rules} formatRule={formatRule} />;
      break;

    default:
      layout = <MobileRulesLayout rules={rules} formatRule={formatRule} />;
  }

  return <PageLayout>{layout}</PageLayout>;
};

export default Rules;