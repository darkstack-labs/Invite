import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import PremiumHeading from '@/components/PremiumHeading';
import {
  Send, ArrowLeft, ArrowRight, User, Calendar, Check, UtensilsCrossed, IdCard, Sparkles, Music, MessageSquare, Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useDeviceType } from '@/hooks/useDeviceType';
import ConfettiEffect from '@/components/ConfettiEffect';
import { db } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const getRSVPStorageKey = (entryId: string) => `rsvp_submitted_${entryId}`;

const steps = [
  { id: 1, title: 'Details', icon: User },
  { id: 2, title: 'Attendance', icon: Calendar },
  { id: 3, title: 'Preferences', icon: UtensilsCrossed },
];

const RSVP = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const deviceType = useDeviceType();

  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'song' | 'suggestion'>('song');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    entryId: user?.entryId || '',
    attendance: '',
    mealPreference: '',
    dietary: '',
  });

  const [songData, setSongData] = useState({
    name: user?.name || '',
    entryId: user?.entryId || '',
    songName: '',
    artist: '',
  });

  const [suggestionData, setSuggestionData] = useState({
    name: user?.name || '',
    entryId: user?.entryId || '',
    suggestion: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(getRSVPStorageKey(user.entryId));
    if (saved) {
      setIsSubmitted(true);
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep === 1 && (!formData.name || !formData.entryId)) {
      toast.error('Please fill in your name and entry ID');
      return;
    }
    if (currentStep === 2 && !formData.attendance) {
      toast.error('Please select your attendance status');
      return;
    }
    if (currentStep === 2 && formData.attendance === "no") {
      setCurrentStep(3);
      return;
    }
    if (currentStep === 3 && formData.attendance === "yes" && !formData.mealPreference) {
      toast.error('Please select your meal preference');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication error. Please login again.");
      return;
    }
    if (isSubmitted) {
      toast.error("RSVP already submitted.");
      return;
    }
    if (formData.attendance === "yes" && !formData.mealPreference) {
      toast.error("Please select your meal preference");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: user.name,
        entryId: user.entryId.trim(),
        attendance: formData.attendance,
        mealPreference: formData.mealPreference,
        dietary: formData.dietary || "",
        submittedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "rsvps", user.entryId), payload);
      localStorage.setItem(getRSVPStorageKey(user.entryId), JSON.stringify(payload));
      setShowConfetti(true);
      setIsSubmitted(true);
      toast.success("RSVP submitted successfully! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSongSubmit = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!songData.songName || !songData.artist) {
      toast.error("Song name and artist are required");
      return;
    }
    try {
      await setDoc(
        doc(db, "songRequests", `${songData.entryId}_${Date.now()}`),
        {
          name: songData.name,
          entryId: songData.entryId,
          songName: songData.songName,
          artist: songData.artist,
          submittedAt: serverTimestamp(),
        }
      );
      toast.success("Song request submitted! 🎵");
      setSongData({ name: user?.name || "", entryId: user?.entryId || "", songName: "", artist: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit song request.");
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionData.suggestion) {
      toast.error("Suggestion cannot be empty");
      return;
    }
    try {
      await setDoc(
        doc(db, "suggestions", `${suggestionData.entryId}_${Date.now()}`),
        {
          name: suggestionData.name,
          entryId: suggestionData.entryId,
          suggestion: suggestionData.suggestion,
          submittedAt: serverTimestamp(),
        }
      );
      toast.success("Suggestion submitted! 💡");
      setSuggestionData({ name: user?.name || "", entryId: user?.entryId || "", suggestion: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit suggestion.");
    }
  };

  const getVariant = () => {
    if (deviceType === 'mobile') return 'mobile';
    if (deviceType === 'tablet') return 'tablet';
    return 'desktop';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Name and Entry ID (disabled) */}
            <div className="space-y-2">
              <label className="text-gold text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Name *
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                disabled
                className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gold text-sm font-medium flex items-center gap-2">
                <IdCard className="w-4 h-4" />
                Entry ID *
              </label>
              <Input
                type="text"
                placeholder="Enter your entry ID"
                value={formData.entryId}
                disabled
                className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Attendance */}
            <div className="space-y-2">
              <label className="text-gold text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Will you attend? *
              </label>
              <Select
                value={formData.attendance}
                onValueChange={(value) => setFormData({ ...formData, attendance: value })}
              >
                <SelectTrigger className="bg-black/30 border-gold/30 text-champagne focus:border-gold focus:ring-gold/20">
                  <SelectValue placeholder="Select your response" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-gold/30">
                  <SelectItem value="yes" className="text-champagne hover:bg-gold/20 focus:bg-gold/20">
                    Yes, I'll be there! 🎉
                  </SelectItem>
                  <SelectItem value="no" className="text-champagne hover:bg-gold/20 focus:bg-gold/20">
                    No, I can't make it 😢
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );
      case 3:
        if (formData.attendance === "no") {
          return (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center text-champagne/70"
            >
              Thanks for letting us know. We'll miss you at the event!
            </motion.div>
          );
        }
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Meal Preference */}
            <div className="space-y-2">
              <label className="text-gold text-sm font-medium flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Meal Preference *
              </label>
              <Select
                value={formData.mealPreference}
                onValueChange={(value) =>
                  setFormData({ ...formData, mealPreference: value })
                }
              >
                <SelectTrigger className="bg-black/30 border-gold/30 text-champagne focus:border-gold focus:ring-gold/20">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-gold/30">
                  <SelectItem
                    value="veg"
                    className="text-champagne hover:bg-gold/20 focus:bg-gold/20"
                  >
                    Vegetarian 🥗
                  </SelectItem>
                  <SelectItem
                    value="nonveg"
                    className="text-champagne hover:bg-gold/20 focus:bg-gold/20"
                  >
                    Non-Vegetarian 🍖
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Dietary Restrictions */}
            <div className="space-y-2">
              <label className="text-gold text-sm font-medium">
                Dietary Restrictions / Allergies
              </label>
              <Input
                type="text"
                placeholder="E.g., Gluten-free, Nut allergy..."
                value={formData.dietary}
                onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
              />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <PageLayout showNav>
        <ConfettiEffect isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[calc(100dvh-5rem)] flex flex-col items-center px-4 pt-6 pb-24"
        >
          {/* Success Card */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="card-shimmer p-8 max-w-md w-full text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(30 76% 40%))',
                    boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
                  }}
                >
                  <Check className="w-10 h-10 text-black" />
                </div>
              </motion.div>
            </motion.div>
            <h2 className="text-2xl font-display text-gold mb-2">You're All Set!</h2>
            <p className="text-champagne/70">
              Thank you for your RSVP. We can't wait to celebrate with you!
            </p>
          </motion.div>
          {/* Song Request & Suggestions Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-md w-full"
          >
            {/* Tabs Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('song')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'song' ? 'text-black' : 'text-gold/60 hover:text-gold'
                }`}
                style={{
                  background: activeTab === 'song'
                    ? 'linear-gradient(135deg, hsl(45 100% 50%), hsl(43 74% 49%))'
                    : 'rgba(0,0,0,0.3)',
                  border: activeTab === 'song' ? 'none' : '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <Music className="w-4 h-4" />
                Song Request
              </button>
              <button
                onClick={() => setActiveTab('suggestion')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === 'suggestion' ? 'text-black' : 'text-gold/60 hover:text-gold'
                }`}
                style={{
                  background: activeTab === 'suggestion'
                    ? 'linear-gradient(135deg, hsl(45 100% 50%), hsl(43 74% 49%))'
                    : 'rgba(0,0,0,0.3)',
                  border: activeTab === 'suggestion' ? 'none' : '1px solid rgba(212,175,55,0.2)',
                }}
              >
                <Lightbulb className="w-4 h-4" />
                Suggestions
              </button>
            </div>
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'song' ? (
                <motion.div
                  key="song"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="card-shimmer">
                    <CardContent className="p-5">
                      {/* Song Request Form */}
                      <div className="flex items-center gap-2 mb-4">
                        <Music className="w-4 h-4 text-gold" />
                        <h3 className="text-gold font-display text-base">Request a Song</h3>
                      </div>
                      <form onSubmit={handleSongSubmit} className="space-y-3">
                        <Input
                          placeholder="Your Name *"
                          value={songData.name}
                          onChange={(e) => setSongData({ ...songData, name: e.target.value })}
                          className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
                        />
                        <Input
                          placeholder="Entry ID *"
                          value={songData.entryId}
                          onChange={(e) => setSongData({ ...songData, entryId: e.target.value })}
                          className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
                        />
                        <Input
                          placeholder="Song Name *"
                          value={songData.songName}
                          onChange={(e) => setSongData({ ...songData, songName: e.target.value })}
                          className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
                        />
                        <Input
                          placeholder="Artist *"
                          value={songData.artist}
                          onChange={(e) => setSongData({ ...songData, artist: e.target.value })}
                          className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
                        />
                        <Button
                          type="submit"
                          className="w-full text-black font-semibold"
                          style={{ background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(43 74% 49%))' }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Song Request
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="suggestion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="card-shimmer">
                    <CardContent className="p-5">
                      {/* Suggestion Form */}
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-4 h-4 text-gold" />
                        <h3 className="text-gold font-display text-base">Share a Suggestion</h3>
                      </div>
                      <form onSubmit={handleSuggestionSubmit} className="space-y-3">
                        <Input
                          placeholder="Your Name *"
                          value={suggestionData.name}
                          onChange={(e) => setSuggestionData({ ...suggestionData, name: e.target.value })}
                          className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
                        />
                        <Input
                          placeholder="Entry ID *"
                          value={suggestionData.entryId}
                          onChange={(e) => setSuggestionData({ ...suggestionData, entryId: e.target.value })}
                          className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20"
                        />
                        <Textarea
                          placeholder="Your suggestion... *"
                          value={suggestionData.suggestion}
                          onChange={(e) => setSuggestionData({ ...suggestionData, suggestion: e.target.value })}
                          className="bg-black/30 border-gold/30 text-champagne placeholder:text-gold/40 focus:border-gold focus:ring-gold/20 min-h-[100px]"
                        />
                        <Button
                          type="submit"
                          className="w-full text-black font-semibold"
                          style={{ background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(43 74% 49%))' }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Suggestion
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          {/* Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex items-center gap-2"
          >
            <Sparkles className="w-3 h-3 text-gold/30" />
            <p className="text-gold/40 text-xs italic">You can submit multiple song requests & suggestions</p>
            <Sparkles className="w-3 h-3 text-gold/30" />
          </motion.div>
        </motion.div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showNav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-[calc(100dvh-5rem)] px-4 md:px-8 lg:px-12 py-6"
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/regulations')}
          className="flex items-center gap-2 text-gold mb-6 hover:text-champagne transition-colors group"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="group-hover:underline">Back to Activities</span>
        </motion.button>

        {/* Heading */}
        <PremiumHeading
          title="RSVP & Request"
          subtitle="Your presence would make the evening complete"
          variant={getVariant()}
        />

        {/* Step Indicator */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gold/20">
              <motion.div
                className="h-full"
                style={{ background: 'linear-gradient(90deg, hsl(45 100% 50%), hsl(43 74% 49%))' }}
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {/* Steps */}
            {steps.map((step) => (
              <motion.div
                key={step.id}
                className="relative z-10 flex flex-col items-center"
                animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: currentStep >= step.id
                      ? 'linear-gradient(135deg, hsl(45 100% 50%), hsl(30 76% 40%))'
                      : 'rgba(0,0,0,0.5)',
                    border: currentStep >= step.id ? 'none' : '1px solid rgba(212, 175, 55, 0.3)',
                    color: currentStep >= step.id ? 'black' : 'rgba(212, 175, 55, 0.5)',
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </motion.div>
                <span className={`text-xs mt-2 ${currentStep >= step.id ? 'text-gold' : 'text-gold/40'}`}>
                  {step.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-lg mx-auto"
        >
          <Card className="card-shimmer overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-8">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 text-black font-semibold"
                      style={{ background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(43 74% 49%))' }}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 text-black font-semibold"
                      style={{ background: 'linear-gradient(135deg, hsl(45 100% 50%), hsl(43 74% 49%))' }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3 h-3 text-gold/30" />
          <p className="text-gold/50 text-sm">
            Step {currentStep} of {steps.length}
          </p>
          <Sparkles className="w-3 h-3 text-gold/30" />
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default RSVP;