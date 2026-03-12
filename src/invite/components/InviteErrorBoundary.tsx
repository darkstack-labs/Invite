import React from "react";

type InviteErrorBoundaryProps = {
  children: React.ReactNode;
};

type InviteErrorBoundaryState = {
  hasError: boolean;
};

class InviteErrorBoundary extends React.Component<
  InviteErrorBoundaryProps,
  InviteErrorBoundaryState
> {
  public constructor(props: InviteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromError(): InviteErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  public componentDidCatch(error: unknown) {
    console.error("Invite UI crashed", error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background bg-hero-pattern bg-cover bg-center bg-fixed px-4">
          <div className="fixed inset-0 bg-black/70" />
          <div className="relative z-10 mx-auto flex min-h-screen max-w-md items-center justify-center">
            <div className="card-shimmer w-full rounded-2xl p-8 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-gold/60">
                Invite System Error
              </p>
              <h1 className="mt-3 font-display text-3xl text-gradient-gold">
                Something went wrong
              </h1>
              <p className="mt-4 text-sm text-champagne/75">
                Reload the page or go back to the login screen to restore your
                session.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="btn-gold w-full rounded-xl py-3 font-semibold"
                >
                  Reload
                </button>
                <button
                  type="button"
                  onClick={() => window.location.assign("/login")}
                  className="w-full rounded-xl border border-gold/30 py-3 text-gold"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default InviteErrorBoundary;
