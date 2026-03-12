import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import ParticleBackground from "@/components/ParticleBackground";
import { useAuth } from "@/contexts/AuthContext";

const InviteEntryRoute = () => {
  const navigate = useNavigate();
  const { entryId = "" } = useParams();
  const { login } = useAuth();

  const [status, setStatus] = useState<"checking" | "error">("checking");
  const [message, setMessage] = useState("Verifying your invite...");

  useEffect(() => {
    let isActive = true;

    const resolveInvite = async () => {
      try {
        const result = await login(entryId);

        if (!isActive) {
          return;
        }

        if (result.ok === true) {
          navigate("/home", { replace: true });
          return;
        }

        setStatus("error");
        setMessage(result.message);
      } catch (error) {
        console.error("Invite route failed", error);

        if (!isActive) {
          return;
        }

        setStatus("error");
        setMessage("We could not open your invite right now. Please try again.");
      }
    };

    void resolveInvite();

    return () => {
      isActive = false;
    };
  }, [entryId, login, navigate]);

  return (
    <div className="min-h-screen bg-background bg-hero-pattern bg-cover bg-center bg-fixed px-4">
      <div className="fixed inset-0 bg-black/70" />
      <ParticleBackground count={40} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="card-shimmer w-full rounded-2xl p-8 text-center"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-gold/60">
            Invite Link
          </p>
          <h1 className="mt-3 font-display text-3xl text-gradient-gold">
            {status === "checking" ? "Opening Invite" : "Invite Not Found"}
          </h1>
          <p className="mt-4 text-sm text-champagne/75">{message}</p>

          <div className="mt-6 flex flex-col gap-3">
            {status === "checking" ? (
              <div className="w-full rounded-xl border border-gold/30 py-3 text-gold">
                Please wait...
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/login?entryId=${encodeURIComponent(entryId)}`, {
                      replace: true,
                    })
                  }
                  className="btn-gold w-full rounded-xl py-3 font-semibold"
                >
                  Continue to Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/", { replace: true })}
                  className="w-full rounded-xl border border-gold/30 py-3 text-gold"
                >
                  Back to Invite Check
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InviteEntryRoute;

