import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  Check,
  UtensilsCrossed,
  IdCard,
  Music,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import PageLayout from '@/components/PageLayout';
import PremiumHeading from '@/components/PremiumHeading';
import ConfettiEffect from '@/components/ConfettiEffect';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { checkRSVP, submitRSVP } from '@/services/rspvService';
import { submitSongRequest } from '@/services/songService';
import { submitSuggestion } from '@/services/suggestionService';

type Attendance = 'yes' | 'no';
type Meal = 'veg' | 'nonveg';

type RSVPFormData = {
  attendance: Attendance | '';
  mealPreference: Meal | '';
  dietary: string;
};

type SongRequestForm = {
  songName: string;
  artist: string;
};

const RSVP = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const deviceType = useDeviceType();

  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [activeTab, setActiveTab] = useState<'song' | 'suggestion'>('song');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingSong, setIsSubmittingSong] = useState(false);
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  const [formData, setFormData] = useState<RSVPFormData>({
    attendance: '',
    mealPreference: '',
    dietary: ''
  });
  const [songData, setSongData] = useState<SongRequestForm>({
    songName: '',
    artist: ''
  });
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    let isActive = true;

    const runCheck = async () => {
      if (isLoading) {
        return;
      }

      if (!user?.entryId) {
        if (isActive) {
          setIsCheckingStatus(false);
        }
        return;
      }

      setIsCheckingStatus(true);

      try {
        const exists = await checkRSVP(user.entryId);

        if (isActive) {
          setIsSubmitted(exists);
        }
      } catch (error) {
        console.error(error);

        if (isActive) {
          toast.error('Unable to load your RSVP status right now.');
        }
      } finally {
        if (isActive) {
          setIsCheckingStatus(false);
        }
      }
    };

    runCheck();

    return () => {
      isActive = false;
    };
  }, [isLoading, user?.entryId]);

  const handleNext = () => {
    if (currentStep === 1 && !user?.name) {
      toast.error('Your invite session is missing. Please sign in again.');
      return;
    }

    if (currentStep === 2 && !formData.attendance) {
      toast.error('Please select your attendance status');
      return;
    }

    setCurrentStep((previousStep) => Math.min(previousStep + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((previousStep) => Math.max(previousStep - 1, 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Your invite session expired. Please sign in again.');
      return;
    }

    if (!formData.attendance) {
      toast.error('Please complete the form');
      return;
    }

    if (formData.attendance === 'yes' && !formData.mealPreference) {
      toast.error('Please select your meal preference');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRSVP({
        name: user.name,
        entryId: user.entryId,
        attendance: formData.attendance,
        mealPreference:
          formData.attendance === 'yes' ? formData.mealPreference : null,
        dietary: formData.dietary
      });

      setShowConfetti(true);
      setIsSubmitted(true);
      toast.success('RSVP submitted successfully');
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.message === 'RSVP_ALREADY_SUBMITTED') {
        setIsSubmitted(true);
        toast.error('Your RSVP has already been submitted.');
      } else {
        toast.error('Failed to submit RSVP');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSongSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Your invite session expired. Please sign in again.');
      return;
    }

    if (!songData.songName.trim() || !songData.artist.trim()) {
      toast.error('Please fill all song fields');
      return;
    }

    setIsSubmittingSong(true);

    try {
      await submitSongRequest({
        name: user.name,
        entryId: user.entryId,
        songName: songData.songName,
        artist: songData.artist
      });

      toast.success('Song request submitted');
      setSongData({
        songName: '',
        artist: ''
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit song request');
    } finally {
      setIsSubmittingSong(false);
    }
  };

  const handleSuggestionSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      toast.error('Your invite session expired. Please sign in again.');
      return;
    }

    if (!suggestion.trim()) {
      toast.error('Suggestion cannot be empty');
      return;
    }

    setIsSubmittingSuggestion(true);

    try {
      await submitSuggestion({
        name: user.name,
        entryId: user.entryId,
        suggestion
      });

      toast.success('Suggestion submitted');
      setSuggestion('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit suggestion');
    } finally {
      setIsSubmittingSuggestion(false);
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
            key='step1'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-5'
          >
            <div className='space-y-2'>
              <label className='text-gold text-sm font-medium flex items-center gap-2'>
                <User className='w-4 h-4' /> Name *
              </label>
              <Input
                value={user?.name ?? ''}
                readOnly
                disabled
                className='bg-black/30 border-gold/30 text-champagne opacity-80 cursor-not-allowed'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-gold text-sm font-medium flex items-center gap-2'>
                <IdCard className='w-4 h-4' /> Entry ID *
              </label>
              <Input
                value={user?.entryId ?? ''}
                readOnly
                disabled
                className='bg-black/30 border-gold/30 text-champagne opacity-80 cursor-not-allowed'
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key='step2'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-5'
          >
            <label className='text-gold text-sm font-medium flex items-center gap-2'>
              <Calendar className='w-4 h-4' /> Will you attend? *
            </label>

            <Select
              value={formData.attendance}
              onValueChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  attendance: value as Attendance,
                  mealPreference:
                    value === 'no' ? '' : current.mealPreference
                }))
              }
            >
              <SelectTrigger className='bg-black/30 border-gold/30 text-champagne'>
                <SelectValue placeholder='Select response' />
              </SelectTrigger>
              <SelectContent className='bg-black border-gold/30'>
                <SelectItem value='yes'>Yes, I&apos;ll be there</SelectItem>
                <SelectItem value='no'>No, I can&apos;t make it</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key='step3'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-5'
          >
            <label className='text-gold text-sm font-medium flex items-center gap-2'>
              <UtensilsCrossed className='w-4 h-4' /> Meal Preference
              {formData.attendance === 'yes' ? ' *' : ' (optional)'}
            </label>

            <Select
              value={formData.mealPreference}
              onValueChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  mealPreference: value as Meal
                }))
              }
            >
              <SelectTrigger className='bg-black/30 border-gold/30 text-champagne'>
                <SelectValue placeholder='Select preference' />
              </SelectTrigger>
              <SelectContent className='bg-black border-gold/30'>
                <SelectItem value='veg'>Vegetarian</SelectItem>
                <SelectItem value='nonveg'>Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder='Dietary restrictions (optional)'
              value={formData.dietary}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  dietary: event.target.value
                }))
              }
              className='bg-black/30 border-gold/30 text-champagne'
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (isLoading || isCheckingStatus) {
    return (
      <PageLayout showNav>
        <div className='flex min-h-[calc(100dvh-5rem)] items-center justify-center px-4 py-6 text-gold'>
          Loading your RSVP...
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout showNav>
        <div className='flex min-h-[calc(100dvh-5rem)] items-center justify-center px-4 py-6 text-gold'>
          Redirecting to login...
        </div>
      </PageLayout>
    );
  }

  if (isSubmitted) {
    return (
      <PageLayout showNav>
        <ConfettiEffect
          isActive={showConfetti}
          onComplete={() => setShowConfetti(false)}
        />

        <div className='min-h-[calc(100dvh-5rem)] flex flex-col items-center px-4 pt-6 pb-24 space-y-6'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='card-shimmer p-8 max-w-md w-full text-center'
          >
            <div className='w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gold'>
              <Check className='w-10 h-10 text-black' />
            </div>

            <h2 className='text-2xl font-display text-gold mt-4'>You&apos;re All Set</h2>
            <p className='text-champagne/70'>Thank you for your RSVP</p>
          </motion.div>

          <Card className='card-shimmer max-w-md w-full'>
            <CardContent className='p-6 space-y-4'>
              <div className='flex gap-2'>
                <Button
                  variant={activeTab === 'song' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('song')}
                  className='flex-1'
                >
                  <Music className='w-4 h-4 mr-2' /> Song Request
                </Button>

                <Button
                  variant={activeTab === 'suggestion' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('suggestion')}
                  className='flex-1'
                >
                  <MessageSquare className='w-4 h-4 mr-2' /> Suggestion
                </Button>
              </div>

              {activeTab === 'song' && (
                <form onSubmit={handleSongSubmit} className='space-y-3'>
                  <Input
                    placeholder='Song name'
                    value={songData.songName}
                    onChange={(event) =>
                      setSongData((current) => ({
                        ...current,
                        songName: event.target.value
                      }))
                    }
                  />

                  <Input
                    placeholder='Artist'
                    value={songData.artist}
                    onChange={(event) =>
                      setSongData((current) => ({
                        ...current,
                        artist: event.target.value
                      }))
                    }
                  />

                  <Button type='submit' className='w-full' disabled={isSubmittingSong}>
                    {isSubmittingSong ? 'Submitting...' : 'Submit Song'}
                  </Button>
                </form>
              )}

              {activeTab === 'suggestion' && (
                <form onSubmit={handleSuggestionSubmit} className='space-y-3'>
                  <Textarea
                    placeholder='Your suggestion for the event'
                    value={suggestion}
                    onChange={(event) => setSuggestion(event.target.value)}
                  />

                  <Button
                    type='submit'
                    className='w-full'
                    disabled={isSubmittingSuggestion}
                  >
                    {isSubmittingSuggestion ? 'Submitting...' : 'Submit Suggestion'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showNav>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='min-h-[calc(100dvh-5rem)] px-4 py-6'
      >
        <motion.button
          onClick={() => navigate('/regulations')}
          className='flex items-center gap-2 text-gold mb-6'
        >
          <ArrowLeft className='w-5 h-5' /> Back to Activities
        </motion.button>

        <PremiumHeading
          title='RSVP & Request'
          subtitle='Your presence would make the evening complete'
          variant={getVariant()}
        />

        <div className='max-w-lg mx-auto'>
          <Card className='card-shimmer'>
            <CardContent className='p-6'>
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode='wait'>
                  {renderStepContent()}
                </AnimatePresence>

                <div className='flex gap-3 mt-8'>
                  {currentStep > 1 && (
                    <Button
                      type='button'
                      onClick={handleBack}
                      variant='outline'
                    >
                      <ArrowLeft className='w-4 h-4 mr-2' /> Back
                    </Button>
                  )}

                  {currentStep < 3 ? (
                    <Button type='button' onClick={handleNext}>
                      Next <ArrowRight className='w-4 h-4 ml-2' />
                    </Button>
                  ) : (
                    <Button type='submit' disabled={isSubmitting}>
                      <Send className='w-4 h-4 mr-2' />
                      {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </PageLayout>
  );
};

export default RSVP;
