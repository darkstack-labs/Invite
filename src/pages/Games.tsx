import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Crown,
  HeartHandshake,
  Search,
  Trophy,
  UserCheck,
  UserRound,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import PageLayout from "@/components/PageLayout";
import PremiumHeading from "@/components/PremiumHeading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth, guestProfiles } from "@/contexts/AuthContext";
import { useDeviceType } from "@/hooks/useDeviceType";
import {
  GAMES_EVENT_NAME,
  type NominationCategory,
  type VoteSubmissionStatus,
  getVoteSubmissionStatus,
  hasSubmittedSelfNominations,
  submitBfdVote,
  submitBmdVote,
  submitCysVote,
  submitMpfVote,
  submitMpmVote,
  submitSelfNominations,
  submitSwdbitpVote,
} from "@/services/gameService";

type Gender = "male" | "female";

type GuestOption = {
  name: string;
  entryId: string;
  gender: string;
};

type VoteKey = keyof VoteSubmissionStatus;

const MAX_SUBMISSIONS_PER_CATEGORY = 3;
const MAX_CHANGES_PER_CATEGORY = 2;

const initialVoteSubmissionStatus: VoteSubmissionStatus = {
  cys: 0,
  mpm: 0,
  mpf: 0,
  bmd: 0,
  bfd: 0,
  swdbitp: 0,
};

const nominationCategories: Array<{
  key: NominationCategory;
  label: string;
  gender: Gender | "all";
}> = [
  { key: "most_popular_male", label: "Most Popular Male", gender: "male" },
  { key: "most_popular_female", label: "Most Popular Female", gender: "female" },
  { key: "best_male_duo", label: "Best Male Duo", gender: "male" },
  { key: "best_female_duo", label: "Best Female Duo", gender: "female" },
  { key: "best_dancer", label: "Best Dancer", gender: "all" },
];

const getSubmitErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === "object" && err !== null) {
    const maybeCode = (err as { code?: string }).code;
    if (maybeCode === "permission-denied") {
      return "Permission denied by Firestore rules";
    }

    const maybeMessage = (err as { message?: string }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return fallback;
};

const normalizeGender = (value?: string) => value?.toLowerCase().trim();

const sortByName = (a: GuestOption, b: GuestOption) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

const voteLabelMap: Record<VoteKey, string> = {
  cys: "A Couple You Ship",
  mpm: "Most Popular Male",
  mpf: "Most Popular Female",
  bmd: "Best Male Duo",
  bfd: "Best Female Duo",
  swdbitp: "Someone Who Doesn't Belong",
};

const SearchableNameSelect = ({
  title,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  excludeEntryIds = [],
}: {
  title: string;
  placeholder: string;
  options: GuestOption[];
  value: string;
  onChange: (entryId: string) => void;
  disabled?: boolean;
  excludeEntryIds?: string[];
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.entryId === value);
  const blocked = new Set(excludeEntryIds);

  return (
    <div className="space-y-2">
      <p className="text-gold text-sm font-medium">{title}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between bg-black/30 border-gold/30 text-champagne hover:bg-black/40 hover:text-gold"
          >
            <span className="truncate">{selected ? selected.name : placeholder}</span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] bg-black border-gold/30">
          <Command className="bg-black">
            <div className="flex items-center border-b border-gold/20 px-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput placeholder="Search name..." className="text-champagne" />
            </div>
            <CommandList>
              <CommandEmpty>No name found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isBlocked = blocked.has(option.entryId);
                  return (
                    <CommandItem
                      key={option.entryId}
                      disabled={isBlocked}
                      value={`${option.name} ${option.entryId}`}
                      onSelect={() => {
                        if (isBlocked) return;
                        onChange(option.entryId);
                        setOpen(false);
                      }}
                      className="text-champagne"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          value === option.entryId ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {option.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const Games = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const { user } = useAuth();

  const [isLoadingState, setIsLoadingState] = useState(true);
  const [selfSubmitted, setSelfSubmitted] = useState(false);
  const [voteCounts, setVoteCounts] = useState<VoteSubmissionStatus>(initialVoteSubmissionStatus);

  const [selectedCategories, setSelectedCategories] = useState<NominationCategory[]>([]);
  const [isSelfSubmitting, setIsSelfSubmitting] = useState(false);

  const [cysMale, setCysMale] = useState("");
  const [cysFemale, setCysFemale] = useState("");
  const [isCysSubmitting, setIsCysSubmitting] = useState(false);

  const [mpmNominee, setMpmNominee] = useState("");
  const [isMpmSubmitting, setIsMpmSubmitting] = useState(false);

  const [mpfNominee, setMpfNominee] = useState("");
  const [isMpfSubmitting, setIsMpfSubmitting] = useState(false);

  const [bmdMale1, setBmdMale1] = useState("");
  const [bmdMale2, setBmdMale2] = useState("");
  const [isBmdSubmitting, setIsBmdSubmitting] = useState(false);

  const [bfdFemale1, setBfdFemale1] = useState("");
  const [bfdFemale2, setBfdFemale2] = useState("");
  const [isBfdSubmitting, setIsBfdSubmitting] = useState(false);

  const [swdbitpNominee, setSwdbitpNominee] = useState("");
  const [isSwdbitpSubmitting, setIsSwdbitpSubmitting] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      if (!user?.entryId) {
        setIsLoadingState(false);
        return;
      }

      try {
        const [self, votes] = await Promise.all([
          hasSubmittedSelfNominations(user.entryId),
          getVoteSubmissionStatus(user.entryId),
        ]);
        setSelfSubmitted(self);
        setVoteCounts(votes);
      } catch (err) {
        toast.error(getSubmitErrorMessage(err, "Failed to load games data"));
      } finally {
        setIsLoadingState(false);
      }
    };

    void loadStatus();
  }, [user?.entryId]);

  const allGuests = useMemo(
    () => Object.values(guestProfiles).sort(sortByName),
    []
  );

  const maleGuests = useMemo(
    () =>
      allGuests.filter((g) => normalizeGender(g.gender) === "male"),
    [allGuests]
  );

  const femaleGuests = useMemo(
    () =>
      allGuests.filter((g) => normalizeGender(g.gender) === "female"),
    [allGuests]
  );

  const allGuestsWithoutSelf = useMemo(
    () => allGuests.filter((g) => g.entryId !== user?.entryId),
    [allGuests, user?.entryId]
  );

  const maleGuestsWithoutSelf = useMemo(
    () => maleGuests.filter((g) => g.entryId !== user?.entryId),
    [maleGuests, user?.entryId]
  );

  const femaleGuestsWithoutSelf = useMemo(
    () => femaleGuests.filter((g) => g.entryId !== user?.entryId),
    [femaleGuests, user?.entryId]
  );

  const userGender = normalizeGender(user?.gender);
  const isMaleUser = userGender === "male";
  const isFemaleUser = userGender === "female";

  const getVariant = () => {
    if (deviceType === "mobile") return "mobile";
    if (deviceType === "tablet") return "tablet";
    return "desktop";
  };

  const getOption = (entryId: string) =>
    allGuests.find((g) => g.entryId === entryId);

  const toggleCategory = (key: NominationCategory) => {
    if (selfSubmitted) return;
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const canSelectCategory = (genderRule: Gender | "all") => {
    if (genderRule === "all") return true;
    if (genderRule === "male") return isMaleUser;
    return isFemaleUser;
  };

  const handleSelfSubmit = async () => {
    if (!user) return;
    if (selectedCategories.length === 0) {
      toast.error("Select at least one category");
      return;
    }

    setIsSelfSubmitting(true);
    try {
      await submitSelfNominations({
        eventName: GAMES_EVENT_NAME,
        entryId: user.entryId,
        name: user.name,
        gender: user.gender,
        selectedCategories: selectedCategories,
      });
      setSelfSubmitted(true);
      toast.success("Your nomination categories are locked");
    } catch (err) {
      toast.error(getSubmitErrorMessage(err, "Failed to submit categories"));
    } finally {
      setIsSelfSubmitting(false);
    }
  };

  const markVoteSubmitted = (key: VoteKey) => {
    setVoteCounts((prev) => ({
      ...prev,
      [key]: Math.min((prev[key] ?? 0) + 1, MAX_SUBMISSIONS_PER_CATEGORY),
    }));
  };

  const canSubmitVote = (key: VoteKey) => (voteCounts[key] ?? 0) < MAX_SUBMISSIONS_PER_CATEGORY;

  const getChangesLeft = (key: VoteKey) => {
    const submissionsUsed = voteCounts[key] ?? 0;
    const changesUsed = Math.max(submissionsUsed - 1, 0);
    return Math.max(MAX_CHANGES_PER_CATEGORY - changesUsed, 0);
  };

  const getSubmitButtonLabel = (key: VoteKey, submittingText: string, defaultText: string, isSubmitting: boolean) => {
    if (isSubmitting) return submittingText;
    if (!canSubmitVote(key)) return "Limit reached";
    return defaultText;
  };

  const handleCysSubmit = async () => {
    if (!user) return;
    if (!cysMale || !cysFemale) {
      toast.error("Select both names");
      return;
    }
    if (cysMale === cysFemale) {
      toast.error("Select two different people");
      return;
    }

    const male = getOption(cysMale);
    const female = getOption(cysFemale);
    if (!male || !female) {
      toast.error("Invalid selection");
      return;
    }

    setIsCysSubmitting(true);
    try {
      await submitCysVote({
        eventName: GAMES_EVENT_NAME,
        entryId: user.entryId,
        name: user.name,
        maleName: male.name,
        maleEntryId: male.entryId,
        femaleName: female.name,
        femaleEntryId: female.entryId,
      });
      markVoteSubmitted("cys");
      toast.success("CYS vote submitted");
    } catch (err) {
      toast.error(getSubmitErrorMessage(err, "Failed to submit CYS vote"));
    } finally {
      setIsCysSubmitting(false);
    }
  };

  const handleSingleVoteSubmit = async (
    key: VoteKey,
    nomineeEntryId: string,
    submitter: (payload: {
      eventName: string;
      entryId: string;
      name: string;
      nomineeName: string;
      nomineeEntryId: string;
    }) => Promise<void>,
    setSubmitting: (value: boolean) => void,
    successText: string
  ) => {
    if (!user) return;
    if (!nomineeEntryId) {
      toast.error("Please select a nominee");
      return;
    }
    if (nomineeEntryId === user.entryId) {
      toast.error("Self voting is not allowed");
      return;
    }

    const nominee = getOption(nomineeEntryId);
    if (!nominee) {
      toast.error("Invalid nominee");
      return;
    }

    setSubmitting(true);
    try {
      await submitter({
        eventName: GAMES_EVENT_NAME,
        entryId: user.entryId,
        name: user.name,
        nomineeName: nominee.name,
        nomineeEntryId: nominee.entryId,
      });
      markVoteSubmitted(key);
      toast.success(successText);
    } catch (err) {
      toast.error(getSubmitErrorMessage(err, "Failed to submit vote"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBmdSubmit = async () => {
    if (!user) return;
    if (!bmdMale1 || !bmdMale2) {
      toast.error("Select both names");
      return;
    }
    if (bmdMale1 === bmdMale2) {
      toast.error("Select two different people");
      return;
    }

    const male1 = getOption(bmdMale1);
    const male2 = getOption(bmdMale2);
    if (!male1 || !male2) {
      toast.error("Invalid selection");
      return;
    }

    setIsBmdSubmitting(true);
    try {
      await submitBmdVote({
        eventName: GAMES_EVENT_NAME,
        entryId: user.entryId,
        name: user.name,
        male1Name: male1.name,
        male1EntryId: male1.entryId,
        male2Name: male2.name,
        male2EntryId: male2.entryId,
      });
      markVoteSubmitted("bmd");
      toast.success("Best Male Duo vote submitted");
    } catch (err) {
      toast.error(getSubmitErrorMessage(err, "Failed to submit BMD vote"));
    } finally {
      setIsBmdSubmitting(false);
    }
  };

  const handleBfdSubmit = async () => {
    if (!user) return;
    if (!bfdFemale1 || !bfdFemale2) {
      toast.error("Select both names");
      return;
    }
    if (bfdFemale1 === bfdFemale2) {
      toast.error("Select two different people");
      return;
    }

    const female1 = getOption(bfdFemale1);
    const female2 = getOption(bfdFemale2);
    if (!female1 || !female2) {
      toast.error("Invalid selection");
      return;
    }

    setIsBfdSubmitting(true);
    try {
      await submitBfdVote({
        eventName: GAMES_EVENT_NAME,
        entryId: user.entryId,
        name: user.name,
        female1Name: female1.name,
        female1EntryId: female1.entryId,
        female2Name: female2.name,
        female2EntryId: female2.entryId,
      });
      markVoteSubmitted("bfd");
      toast.success("Best Female Duo vote submitted");
    } catch (err) {
      toast.error(getSubmitErrorMessage(err, "Failed to submit BFD vote"));
    } finally {
      setIsBfdSubmitting(false);
    }
  };

  if (isLoadingState) {
    return (
      <PageLayout showNav>
        <div className="min-h-[calc(100dvh-5rem)] flex items-center justify-center text-gold">
          Loading...
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showNav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[calc(100dvh-5rem)] px-4 md:px-8 lg:px-12 py-6"
      >
        <motion.button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-gold mb-6 hover:text-champagne transition-colors group"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="group-hover:underline">Back to Home</span>
        </motion.button>

        <PremiumHeading
          title="Games"
          subtitle="Nominate yourself and vote with up to 2 changes per category"
          variant={getVariant()}
        />

        <div className="max-w-4xl mx-auto space-y-8 pb-24">
          <Card className="border border-red-500/40 bg-red-950/40">
            <CardContent className="p-4 md:p-5">
              <div className="rounded-xl border border-red-400/60 bg-black/40 px-4 py-3">
                <p className="text-red-200 text-sm md:text-base font-semibold">
                  Vote change tracker: You can submit each vote once and change it 2 more times (total 3 submissions per category).
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                  {(Object.keys(voteLabelMap) as VoteKey[]).map((key) => (
                    <div key={key} className="rounded-md border border-red-300/30 bg-red-900/20 px-3 py-2 text-red-100">
                      <span className="font-medium">{voteLabelMap[key]}:</span>{" "}
                      <span>Vote changes left {getChangesLeft(key)} / {MAX_CHANGES_PER_CATEGORY}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-shimmer border border-gold/20">
            <CardContent className="p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-display text-gold">Section 1: Self Nomination</h3>
                  <p className="text-champagne/70 text-sm">
                    Pick your prize categories. After submitting, you cannot change it.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {nominationCategories.map((category) => {
                  const disabledForGender = !canSelectCategory(category.gender);
                  const checked = selectedCategories.includes(category.key);
                  const disabled = selfSubmitted || disabledForGender;
                  return (
                    <label
                      key={category.key}
                      className={`rounded-lg border px-4 py-3 flex items-center justify-between ${
                        disabled
                          ? "border-gold/10 bg-black/20 opacity-60"
                          : "border-gold/25 bg-black/30 cursor-pointer hover:border-gold/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => toggleCategory(category.key)}
                          className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-black"
                        />
                        <span className="text-champagne">{category.label}</span>
                      </div>
                      {disabledForGender && (
                        <span className="text-xs text-gold/60 uppercase tracking-wide">Locked</span>
                      )}
                    </label>
                  );
                })}
              </div>

              <Button
                type="button"
                disabled={selfSubmitted || isSelfSubmitting}
                onClick={handleSelfSubmit}
                className="w-full"
              >
                {selfSubmitted ? "Already submitted" : isSelfSubmitting ? "Submitting..." : "Submit Categories"}
              </Button>
            </CardContent>
          </Card>

          <Card className="card-shimmer border border-gold/20">
            <CardContent className="p-5 md:p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-display text-gold">Section 2: Vote for Others</h3>
                  <p className="text-champagne/70 text-sm">
                    Search and select nominees. You can submit once and change each vote 2 more times.
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <Card className="border border-gold/20 bg-black/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-gold" />
                      <h4 className="text-gold font-medium">A Couple You Ship</h4>
                    </div>
                    <SearchableNameSelect
                      title="Male"
                      placeholder="Select male"
                      options={maleGuestsWithoutSelf}
                      value={cysMale}
                      onChange={setCysMale}
                      disabled={!canSubmitVote("cys")}
                    />
                    <SearchableNameSelect
                      title="Female"
                      placeholder="Select female"
                      options={femaleGuestsWithoutSelf}
                      value={cysFemale}
                      onChange={setCysFemale}
                      disabled={!canSubmitVote("cys")}
                    />
                    <Button
                      type="button"
                      disabled={!canSubmitVote("cys") || isCysSubmitting}
                      onClick={handleCysSubmit}
                      className="w-full"
                    >
                      {getSubmitButtonLabel("cys", "Submitting...", "Submit CYS Vote", isCysSubmitting)}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-gold/20 bg-black/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-gold" />
                      <h4 className="text-gold font-medium">Most Popular Male</h4>
                    </div>
                    <SearchableNameSelect
                      title="Male"
                      placeholder="Select male nominee"
                      options={maleGuestsWithoutSelf}
                      value={mpmNominee}
                      onChange={setMpmNominee}
                      disabled={!canSubmitVote("mpm")}
                    />
                    <Button
                      type="button"
                      disabled={!canSubmitVote("mpm") || isMpmSubmitting}
                      onClick={() =>
                        void handleSingleVoteSubmit(
                          "mpm",
                          mpmNominee,
                          submitMpmVote,
                          setIsMpmSubmitting,
                          "Most Popular Male vote submitted"
                        )
                      }
                      className="w-full"
                    >
                      {getSubmitButtonLabel("mpm", "Submitting...", "Submit MPM Vote", isMpmSubmitting)}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-gold/20 bg-black/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-gold" />
                      <h4 className="text-gold font-medium">Most Popular Female</h4>
                    </div>
                    <SearchableNameSelect
                      title="Female"
                      placeholder="Select female nominee"
                      options={femaleGuestsWithoutSelf}
                      value={mpfNominee}
                      onChange={setMpfNominee}
                      disabled={!canSubmitVote("mpf")}
                    />
                    <Button
                      type="button"
                      disabled={!canSubmitVote("mpf") || isMpfSubmitting}
                      onClick={() =>
                        void handleSingleVoteSubmit(
                          "mpf",
                          mpfNominee,
                          submitMpfVote,
                          setIsMpfSubmitting,
                          "Most Popular Female vote submitted"
                        )
                      }
                      className="w-full"
                    >
                      {getSubmitButtonLabel("mpf", "Submitting...", "Submit MPF Vote", isMpfSubmitting)}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-gold/20 bg-black/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gold" />
                      <h4 className="text-gold font-medium">Best Male Duo</h4>
                    </div>
                    <SearchableNameSelect
                      title="Male 1"
                      placeholder="Select first male"
                      options={maleGuests}
                      value={bmdMale1}
                      onChange={setBmdMale1}
                      disabled={!canSubmitVote("bmd")}
                      excludeEntryIds={[bmdMale2]}
                    />
                    <SearchableNameSelect
                      title="Male 2"
                      placeholder="Select second male"
                      options={maleGuests}
                      value={bmdMale2}
                      onChange={setBmdMale2}
                      disabled={!canSubmitVote("bmd")}
                      excludeEntryIds={[bmdMale1]}
                    />
                    <Button
                      type="button"
                      disabled={!canSubmitVote("bmd") || isBmdSubmitting}
                      onClick={handleBmdSubmit}
                      className="w-full"
                    >
                      {getSubmitButtonLabel("bmd", "Submitting...", "Submit BMD Vote", isBmdSubmitting)}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-gold/20 bg-black/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gold" />
                      <h4 className="text-gold font-medium">Best Female Duo</h4>
                    </div>
                    <SearchableNameSelect
                      title="Female 1"
                      placeholder="Select first female"
                      options={femaleGuests}
                      value={bfdFemale1}
                      onChange={setBfdFemale1}
                      disabled={!canSubmitVote("bfd")}
                      excludeEntryIds={[bfdFemale2]}
                    />
                    <SearchableNameSelect
                      title="Female 2"
                      placeholder="Select second female"
                      options={femaleGuests}
                      value={bfdFemale2}
                      onChange={setBfdFemale2}
                      disabled={!canSubmitVote("bfd")}
                      excludeEntryIds={[bfdFemale1]}
                    />
                    <Button
                      type="button"
                      disabled={!canSubmitVote("bfd") || isBfdSubmitting}
                      onClick={handleBfdSubmit}
                      className="w-full"
                    >
                      {getSubmitButtonLabel("bfd", "Submitting...", "Submit BFD Vote", isBfdSubmitting)}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-gold/20 bg-black/20">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-gold" />
                      <h4 className="text-gold font-medium">Someone Who Doesn't Belong In This Party</h4>
                    </div>
                    <SearchableNameSelect
                      title="Invitees"
                      placeholder="Select invitee"
                      options={allGuestsWithoutSelf}
                      value={swdbitpNominee}
                      onChange={setSwdbitpNominee}
                      disabled={!canSubmitVote("swdbitp")}
                    />
                    <Button
                      type="button"
                      disabled={!canSubmitVote("swdbitp") || isSwdbitpSubmitting}
                      onClick={() =>
                        void handleSingleVoteSubmit(
                          "swdbitp",
                          swdbitpNominee,
                          submitSwdbitpVote,
                          setIsSwdbitpSubmitting,
                          "SWDBITP vote submitted"
                        )
                      }
                      className="w-full"
                    >
                      {getSubmitButtonLabel("swdbitp", "Submitting...", "Submit SWDBITP Vote", isSwdbitpSubmitting)}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default Games;
