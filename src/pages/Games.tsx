import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Crown,
  Loader2,
  Sparkles,
  Trophy,
  UserRoundCheck,
  Vote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import PageLayout from "@/components/PageLayout";
import PremiumHeading from "@/components/PremiumHeading";
import SearchableGuestSelect from "@/components/games/SearchableGuestSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import { listInviteGuests } from "@/invite/services/guestDirectory";
import type { UserProfile } from "@/invite/types";
import {
  getSelfNominationSubmission,
  getVoteSubmission,
  submitSelfNominationSubmission,
  submitVoteSubmission,
  type SelfNominationCategory,
  type SelfNominationSubmission,
  type VoteCollectionKey,
  type VoteSubmission,
  VOTE_COLLECTIONS,
} from "@/services/gamesService";

const selfNominationOptions: Array<{
  key: SelfNominationCategory;
  label: string;
  allowedGender: "Male" | "Female" | null;
  description: string;
}> = [
  {
    key: "mostPopularMale",
    label: "Most Popular Male",
    allowedGender: "Male",
    description: "Put yourself forward for the male popularity crown.",
  },
  {
    key: "mostPopularFemale",
    label: "Most Popular Female",
    allowedGender: "Female",
    description: "Put yourself forward for the female popularity crown.",
  },
  {
    key: "bestMaleDuo",
    label: "Best Male Duo",
    allowedGender: "Male",
    description: "Raise your hand if you belong in the strongest male duo.",
  },
  {
    key: "bestFemaleDuo",
    label: "Best Female Duo",
    allowedGender: "Female",
    description: "Raise your hand if you belong in the strongest female duo.",
  },
  {
    key: "bestDancer",
    label: "Best Dancer",
    allowedGender: null,
    description: "Claim your place on the dance-floor shortlist.",
  },
];

type VoteFormState = {
  cys: { male: string; female: string };
  mpm: { male: string };
  mpf: { female: string };
  bmd: { male1: string; male2: string };
  bfd: { female1: string; female2: string };
  swdbitp: { invitee: string };
};

type VoteSubmissionState = Record<VoteCollectionKey, VoteSubmission | null>;
type VoteLoadingState = Record<VoteCollectionKey, boolean>;

const emptyVoteForms: VoteFormState = {
  cys: { male: "", female: "" },
  mpm: { male: "" },
  mpf: { female: "" },
  bmd: { male1: "", male2: "" },
  bfd: { female1: "", female2: "" },
  swdbitp: { invitee: "" },
};

const emptyVoteSubmissions: VoteSubmissionState = {
  cys: null,
  mpm: null,
  mpf: null,
  bmd: null,
  bfd: null,
  swdbitp: null,
};

const emptyVoteLoadingState: VoteLoadingState = {
  cys: false,
  mpm: false,
  mpf: false,
  bmd: false,
  bfd: false,
  swdbitp: false,
};

const collator = new Intl.Collator("en", { sensitivity: "base" });

const voteTitles: Record<VoteCollectionKey, string> = {
  cys: "A Couple You Ship",
  mpm: "Most Popular Male",
  mpf: "Most Popular Female",
  bmd: "Best Male Duo",
  bfd: "Best Female Duo",
  swdbitp: "Someone Who Doesn't Belong In This Party",
};

const Games = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [pageLoading, setPageLoading] = useState(true);
  const [selfSelections, setSelfSelections] = useState<SelfNominationCategory[]>([]);
  const [savedSelfSubmission, setSavedSelfSubmission] =
    useState<SelfNominationSubmission | null>(null);
  const [guestDirectory, setGuestDirectory] = useState<UserProfile[]>([]);
  const [guestDirectoryError, setGuestDirectoryError] = useState<string | null>(null);
  const [isSubmittingSelf, setIsSubmittingSelf] = useState(false);
  const [voteForms, setVoteForms] = useState<VoteFormState>(emptyVoteForms);
  const [voteSubmissions, setVoteSubmissions] =
    useState<VoteSubmissionState>(emptyVoteSubmissions);
  const [voteLoading, setVoteLoading] =
    useState<VoteLoadingState>(emptyVoteLoadingState);

  const guestList = useMemo(
    () =>
      [...guestDirectory].sort((left, right) =>
        collator.compare(left.name, right.name)
      ),
    [guestDirectory]
  );

  const maleGuests = useMemo(
    () =>
      guestList
        .filter(
          (profile) =>
            profile.gender === "Male" && profile.entryId !== user?.entryId
        )
        .map((profile) => profile.name),
    [guestList, user?.entryId]
  );

  const femaleGuests = useMemo(
    () =>
      guestList
        .filter(
          (profile) =>
            profile.gender === "Female" && profile.entryId !== user?.entryId
        )
        .map((profile) => profile.name),
    [guestList, user?.entryId]
  );

  const allOtherGuests = useMemo(
    () =>
      guestList
        .filter((profile) => profile.entryId !== user?.entryId)
        .map((profile) => profile.name),
    [guestList, user?.entryId]
  );

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    let isActive = true;

    const loadGamesState = async () => {
      setPageLoading(true);

      try {
        const [
          directory,
          selfSubmission,
          cysSubmission,
          mpmSubmission,
          mpfSubmission,
          bmdSubmission,
          bfdSubmission,
          swdbitpSubmission,
        ] = await Promise.all([
          listInviteGuests(),
          getSelfNominationSubmission(user.entryId),
          getVoteSubmission(VOTE_COLLECTIONS.cys, user.entryId),
          getVoteSubmission(VOTE_COLLECTIONS.mpm, user.entryId),
          getVoteSubmission(VOTE_COLLECTIONS.mpf, user.entryId),
          getVoteSubmission(VOTE_COLLECTIONS.bmd, user.entryId),
          getVoteSubmission(VOTE_COLLECTIONS.bfd, user.entryId),
          getVoteSubmission(VOTE_COLLECTIONS.swdbitp, user.entryId),
        ]);

        if (!isActive) {
          return;
        }

        setGuestDirectory(directory);
        setGuestDirectoryError(
          directory.length
            ? null
            : "The guest directory is empty right now. Try again in a moment."
        );
        setSavedSelfSubmission(selfSubmission);
        setSelfSelections(selfSubmission?.categories ?? []);
        setVoteSubmissions({
          cys: cysSubmission,
          mpm: mpmSubmission,
          mpf: mpfSubmission,
          bmd: bmdSubmission,
          bfd: bfdSubmission,
          swdbitp: swdbitpSubmission,
        });
        setVoteForms({
          cys: {
            male: cysSubmission?.selections[0] ?? "",
            female: cysSubmission?.selections[1] ?? "",
          },
          mpm: {
            male: mpmSubmission?.selections[0] ?? "",
          },
          mpf: {
            female: mpfSubmission?.selections[0] ?? "",
          },
          bmd: {
            male1: bmdSubmission?.selections[0] ?? "",
            male2: bmdSubmission?.selections[1] ?? "",
          },
          bfd: {
            female1: bfdSubmission?.selections[0] ?? "",
            female2: bfdSubmission?.selections[1] ?? "",
          },
          swdbitp: {
            invitee: swdbitpSubmission?.selections[0] ?? "",
          },
        });
      } catch (error) {
        console.error(error);
        setGuestDirectoryError(
          "Unable to load the guest directory right now. Votes are temporarily unavailable."
        );
        toast.error("Failed to load the games page");
      } finally {
        if (isActive) {
          setPageLoading(false);
        }
      }
    };

    loadGamesState();

    return () => {
      isActive = false;
    };
  }, [isLoading, user]);

  const headingVariant = (() => {
    if (deviceType === "mobile") return "mobile";
    if (deviceType === "tablet") return "tablet";
    return "desktop";
  })();

  const isCategoryAllowed = (allowedGender: "Male" | "Female" | null) => {
    if (!allowedGender || !user) {
      return true;
    }

    return user.gender === allowedGender;
  };

  const toggleSelfCategory = (category: SelfNominationCategory) => {
    if (savedSelfSubmission) {
      return;
    }

    setSelfSelections((currentSelections) =>
      currentSelections.includes(category)
        ? currentSelections.filter((item) => item !== category)
        : [...currentSelections, category]
    );
  };

  const handleSelfSubmit = async () => {
    if (!user) {
      return;
    }

    if (!selfSelections.length) {
      toast.error("Pick at least one category before submitting");
      return;
    }

    setIsSubmittingSelf(true);

    try {
      const submission: SelfNominationSubmission = {
        name: user.name,
        entryId: user.entryId,
        gender: user.gender,
        categories: selfSelections,
      };

      await submitSelfNominationSubmission(submission);
      setSavedSelfSubmission(submission);
      toast.success("Your self-nomination choices are locked in");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not save your self nominations."
      );
    } finally {
      setIsSubmittingSelf(false);
    }
  };

  const handleVoteSubmit = async (voteKey: VoteCollectionKey) => {
    if (!user) {
      return;
    }

    let selections: string[] = [];

    switch (voteKey) {
      case "cys":
        selections = [voteForms.cys.male, voteForms.cys.female];
        if (selections.some((value) => !value)) {
          toast.error("Pick both names for A Couple You Ship");
          return;
        }
        break;
      case "mpm":
        selections = [voteForms.mpm.male];
        if (!selections[0]) {
          toast.error("Pick one name for Most Popular Male");
          return;
        }
        break;
      case "mpf":
        selections = [voteForms.mpf.female];
        if (!selections[0]) {
          toast.error("Pick one name for Most Popular Female");
          return;
        }
        break;
      case "bmd":
        selections = [voteForms.bmd.male1, voteForms.bmd.male2];
        if (selections.some((value) => !value)) {
          toast.error("Pick both names for Best Male Duo");
          return;
        }
        if (voteForms.bmd.male1 === voteForms.bmd.male2) {
          toast.error("Best Male Duo needs two different names");
          return;
        }
        break;
      case "bfd":
        selections = [voteForms.bfd.female1, voteForms.bfd.female2];
        if (selections.some((value) => !value)) {
          toast.error("Pick both names for Best Female Duo");
          return;
        }
        if (voteForms.bfd.female1 === voteForms.bfd.female2) {
          toast.error("Best Female Duo needs two different names");
          return;
        }
        break;
      case "swdbitp":
        selections = [voteForms.swdbitp.invitee];
        if (!selections[0]) {
          toast.error("Pick one invitee before submitting");
          return;
        }
        break;
    }

    setVoteLoading((current) => ({ ...current, [voteKey]: true }));

    try {
      const submission: VoteSubmission = {
        voteTitle: voteTitles[voteKey],
        submittedByName: user.name,
        submittedByEntryId: user.entryId,
        selections,
      };

      await submitVoteSubmission(VOTE_COLLECTIONS[voteKey], submission);
      setVoteSubmissions((current) => ({ ...current, [voteKey]: submission }));
      toast.success(`${voteTitles[voteKey]} submitted`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "We could not save that vote."
      );
    } finally {
      setVoteLoading((current) => ({ ...current, [voteKey]: false }));
    }
  };

  const renderSubmittedSummary = (submission: VoteSubmission) => (
    <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
      <div className="flex items-center gap-2 text-gold">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-sm font-medium">Submitted and locked</span>
      </div>

      <p className="mt-3 text-sm text-champagne/80">
        {submission.selections.join(" + ")}
      </p>
    </div>
  );

  if (isLoading || pageLoading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-gold">
          Loading...
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] items-center justify-center text-gold">
          Redirecting...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showNav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[calc(100dvh-5rem)] px-4 py-6 pb-24 md:px-8 lg:px-12"
      >
        <PremiumHeading
          title="Games Lounge"
          subtitle="Nominate yourself and lock in your votes"
          variant={headingVariant}
        />

        <div className="mx-auto max-w-5xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-shimmer rounded-2xl p-5 md:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-gold/70">
                  <Sparkles className="w-4 h-4" />
                  Games Mode
                </p>
                <h2 className="font-display text-2xl text-gradient-gold md:text-3xl">
                  Ready to make the rankings messy?
                </h2>
                <p className="max-w-2xl text-sm text-champagne/75 md:text-base">
                  Section one lets you nominate yourself. Section two lets you
                  vote for other people. Every submission is single-use and
                  stays locked once it is sent.
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
                <Crown className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="self" className="w-full">
            {guestDirectoryError && (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {guestDirectoryError}
              </div>
            )}

            <TabsList className="grid w-full grid-cols-2 border border-gold/30 bg-black/50">
              <TabsTrigger value="self" className="flex items-center gap-2">
                <UserRoundCheck className="w-4 h-4" />
                Self Nomination
              </TabsTrigger>

              <TabsTrigger value="vote" className="flex items-center gap-2">
                <Vote className="w-4 h-4" />
                Vote Others
              </TabsTrigger>
            </TabsList>

            <TabsContent value="self" className="mt-6">
              <Card className="card-shimmer border-gold/20 bg-black/25">
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gold">
                      <Award className="w-5 h-5" />
                      <h3 className="font-display text-xl">Pick your categories</h3>
                    </div>

                    <p className="text-sm text-champagne/75">
                      Choose the categories you want to nominate yourself for.
                      Male and female-only categories are unlocked automatically
                      using the guest directory attached to your invite session.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {selfNominationOptions.map((option) => {
                      const isAllowed = isCategoryAllowed(option.allowedGender);
                      const isSelected = selfSelections.includes(option.key);

                      return (
                        <motion.button
                          key={option.key}
                          type="button"
                          whileHover={
                            savedSelfSubmission || !isAllowed
                              ? undefined
                              : { y: -3, scale: 1.01 }
                          }
                          onClick={() => {
                            if (!isAllowed) {
                              return;
                            }

                            toggleSelfCategory(option.key);
                          }}
                          disabled={Boolean(savedSelfSubmission)}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-gold/60 bg-gold/12 shadow-[0_0_22px_rgba(212,175,55,0.12)]"
                              : "border-gold/15 bg-black/20"
                          } ${
                            !isAllowed
                              ? "cursor-not-allowed opacity-45"
                              : "hover:border-gold/35"
                          } ${
                            savedSelfSubmission ? "cursor-not-allowed" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              disabled={!isAllowed || Boolean(savedSelfSubmission)}
                              className="mt-0.5 border-gold/40 data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-black"
                            />

                            <div className="space-y-2">
                              <p className="font-medium text-gold">
                                {option.label}
                              </p>
                              <p className="text-sm text-champagne/70">
                                {isAllowed
                                  ? option.description
                                  : `${option.allowedGender} guests only`}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {savedSelfSubmission ? (
                    <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
                      <div className="flex items-center gap-2 text-gold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Self nominations submitted
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {savedSelfSubmission.categories.map((category) => {
                          const label = selfNominationOptions.find(
                            (option) => option.key === category
                          )?.label;

                          return (
                            <span
                              key={category}
                              className="rounded-full border border-gold/20 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-champagne/80"
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSelfSubmit}
                      disabled={isSubmittingSelf}
                      className="w-full rounded-full bg-gold text-black hover:bg-gold/90"
                    >
                      {isSubmittingSelf && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Self Nominations
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vote" className="mt-6">
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="card-shimmer border-gold/20 bg-black/25">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gold">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-display text-xl">
                          A Couple You Ship
                        </h3>
                      </div>
                      <p className="text-sm text-champagne/70">
                        Pick one male and one female from the guest list.
                      </p>
                    </div>

                    {voteSubmissions.cys ? (
                      renderSubmittedSummary(voteSubmissions.cys)
                    ) : (
                      <>
                        <SearchableGuestSelect
                          label="Male"
                          placeholder="Select a male guest"
                          options={maleGuests}
                          value={voteForms.cys.male}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              cys: { ...current.cys, male: value },
                            }))
                          }
                        />

                        <SearchableGuestSelect
                          label="Female"
                          placeholder="Select a female guest"
                          options={femaleGuests}
                          value={voteForms.cys.female}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              cys: { ...current.cys, female: value },
                            }))
                          }
                        />

                        <Button
                          type="button"
                          onClick={() => handleVoteSubmit("cys")}
                          disabled={voteLoading.cys}
                          className="w-full rounded-full bg-gold text-black hover:bg-gold/90"
                        >
                          {voteLoading.cys && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit CYS Vote
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-shimmer border-gold/20 bg-black/25">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gold">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-display text-xl">
                          Most Popular Male
                        </h3>
                      </div>
                      <p className="text-sm text-champagne/70">
                        Vote for one male guest from the batch list.
                      </p>
                    </div>

                    {voteSubmissions.mpm ? (
                      renderSubmittedSummary(voteSubmissions.mpm)
                    ) : (
                      <>
                        <SearchableGuestSelect
                          label="Male"
                          placeholder="Select a male guest"
                          options={maleGuests}
                          value={voteForms.mpm.male}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              mpm: { male: value },
                            }))
                          }
                        />

                        <Button
                          type="button"
                          onClick={() => handleVoteSubmit("mpm")}
                          disabled={voteLoading.mpm}
                          className="w-full rounded-full bg-gold text-black hover:bg-gold/90"
                        >
                          {voteLoading.mpm && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit MPM Vote
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-shimmer border-gold/20 bg-black/25">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gold">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-display text-xl">
                          Most Popular Female
                        </h3>
                      </div>
                      <p className="text-sm text-champagne/70">
                        Vote for one female guest from the batch list.
                      </p>
                    </div>

                    {voteSubmissions.mpf ? (
                      renderSubmittedSummary(voteSubmissions.mpf)
                    ) : (
                      <>
                        <SearchableGuestSelect
                          label="Female"
                          placeholder="Select a female guest"
                          options={femaleGuests}
                          value={voteForms.mpf.female}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              mpf: { female: value },
                            }))
                          }
                        />

                        <Button
                          type="button"
                          onClick={() => handleVoteSubmit("mpf")}
                          disabled={voteLoading.mpf}
                          className="w-full rounded-full bg-gold text-black hover:bg-gold/90"
                        >
                          {voteLoading.mpf && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit MPF Vote
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-shimmer border-gold/20 bg-black/25">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gold">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-display text-xl">Best Male Duo</h3>
                      </div>
                      <p className="text-sm text-champagne/70">
                        Pick two different male guests.
                      </p>
                    </div>

                    {voteSubmissions.bmd ? (
                      renderSubmittedSummary(voteSubmissions.bmd)
                    ) : (
                      <>
                        <SearchableGuestSelect
                          label="Male 1"
                          placeholder="Select the first male guest"
                          options={maleGuests}
                          value={voteForms.bmd.male1}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              bmd: { ...current.bmd, male1: value },
                            }))
                          }
                        />

                        <SearchableGuestSelect
                          label="Male 2"
                          placeholder="Select the second male guest"
                          options={maleGuests}
                          value={voteForms.bmd.male2}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              bmd: { ...current.bmd, male2: value },
                            }))
                          }
                        />

                        <Button
                          type="button"
                          onClick={() => handleVoteSubmit("bmd")}
                          disabled={voteLoading.bmd}
                          className="w-full rounded-full bg-gold text-black hover:bg-gold/90"
                        >
                          {voteLoading.bmd && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit BMD Vote
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-shimmer border-gold/20 bg-black/25">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gold">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-display text-xl">
                          Best Female Duo
                        </h3>
                      </div>
                      <p className="text-sm text-champagne/70">
                        Pick two different female guests.
                      </p>
                    </div>

                    {voteSubmissions.bfd ? (
                      renderSubmittedSummary(voteSubmissions.bfd)
                    ) : (
                      <>
                        <SearchableGuestSelect
                          label="Female 1"
                          placeholder="Select the first female guest"
                          options={femaleGuests}
                          value={voteForms.bfd.female1}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              bfd: { ...current.bfd, female1: value },
                            }))
                          }
                        />

                        <SearchableGuestSelect
                          label="Female 2"
                          placeholder="Select the second female guest"
                          options={femaleGuests}
                          value={voteForms.bfd.female2}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              bfd: { ...current.bfd, female2: value },
                            }))
                          }
                        />

                        <Button
                          type="button"
                          onClick={() => handleVoteSubmit("bfd")}
                          disabled={voteLoading.bfd}
                          className="w-full rounded-full bg-gold text-black hover:bg-gold/90"
                        >
                          {voteLoading.bfd && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit BFD Vote
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-shimmer border-gold/20 bg-black/25 lg:col-span-2">
                  <CardContent className="space-y-5 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gold">
                        <Trophy className="w-5 h-5" />
                        <h3 className="font-display text-xl">
                          Someone Who Doesn't Belong In This Party
                        </h3>
                      </div>
                      <p className="text-sm text-champagne/70">
                        Pick one name from the guest list.
                      </p>
                    </div>

                    {voteSubmissions.swdbitp ? (
                      renderSubmittedSummary(voteSubmissions.swdbitp)
                    ) : (
                      <>
                        <SearchableGuestSelect
                          label="Invitees"
                          placeholder="Select an invitee"
                          options={allOtherGuests}
                          value={voteForms.swdbitp.invitee}
                          onChange={(value) =>
                            setVoteForms((current) => ({
                              ...current,
                              swdbitp: { invitee: value },
                            }))
                          }
                        />

                        <Button
                          type="button"
                          onClick={() => handleVoteSubmit("swdbitp")}
                          disabled={voteLoading.swdbitp}
                          className="w-full rounded-full bg-gold text-black hover:bg-gold/90 lg:w-auto"
                        >
                          {voteLoading.swdbitp && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit SWDBITP Vote
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default Games;
