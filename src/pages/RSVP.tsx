import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageLayout from '@/components/PageLayout'
import PremiumHeading from '@/components/PremiumHeading'
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
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { useDeviceType } from '@/hooks/useDeviceType'
import ConfettiEffect from '@/components/ConfettiEffect'

import { submitRSVP, checkRSVP } from '@/services/rspvService'
import { submitSongRequest } from '@/services/songService'
import { submitSuggestion } from '@/services/suggestionService'

type Attendance = 'yes' | 'no'
type Meal = 'veg' | 'nonveg'

type FormData = {
  name: string
  entryId: string
  attendance: Attendance | ''
  mealPreference: Meal | ''
  dietary: string
}

const getSubmitErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err !== null) {
    const maybeCode = (err as { code?: string }).code
    if (maybeCode === 'permission-denied') {
      return 'Permission denied by Firestore rules'
    }

    const maybeMessage = (err as { message?: string }).message
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage
    }
  }

  return fallback
}

const RSVP = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const deviceType = useDeviceType()

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'song' | 'suggestion'>('song')

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    entryId: user?.entryId || '',
    attendance: '',
    mealPreference: '',
    dietary: ''
  })

  const [songData, setSongData] = useState({
    name: user?.name || '',
    entryId: user?.entryId || '',
    songName: '',
    artist: ''
  })

  const [suggestionData, setSuggestionData] = useState({
    name: user?.name || '',
    entryId: user?.entryId || '',
    suggestion: ''
  })

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    const runCheck = async () => {
      if (!user?.entryId) return

      try {
        const exists = await checkRSVP(user.entryId)
        if (exists) setIsSubmitted(true)
      } catch (err) {
        console.error(err)
      }
    }

    runCheck()
  }, [user])

  const handleNext = () => {
    if (currentStep === 1 && (!formData.name || !formData.entryId)) {
      toast.error('Please fill in your name and entry ID')
      return
    }

    if (currentStep === 2 && !formData.attendance) {
      toast.error('Please select your attendance status')
      return
    }

    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.mealPreference || !formData.attendance) {
      toast.error('Please complete the form')
      return
    }

    setIsSubmitting(true)

    try {
      await submitRSVP({
        name: formData.name,
        entryId: formData.entryId,
        attendance: formData.attendance as Attendance,
        mealPreference: formData.mealPreference as Meal,
        dietary: formData.dietary ?? ''
      })

      setShowConfetti(true)
      setIsSubmitted(true)

      toast.success('RSVP submitted successfully')
    } catch (err) {
      console.error(err)
      toast.error(getSubmitErrorMessage(err, 'Failed to submit RSVP'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!songData.songName || !songData.artist) {
      toast.error('Please fill all song fields')
      return
    }

    try {
      await submitSongRequest(songData)

      toast.success('Song request submitted')

      setSongData({
        name: user?.name || '',
        entryId: user?.entryId || '',
        songName: '',
        artist: ''
      })
    } catch (err) {
      console.error(err)
      toast.error(getSubmitErrorMessage(err, 'Failed to submit song request'))
    }
  }

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!suggestionData.suggestion) {
      toast.error('Suggestion cannot be empty')
      return
    }

    try {
      await submitSuggestion(suggestionData)

      toast.success('Suggestion submitted')

      setSuggestionData({
        name: user?.name || '',
        entryId: user?.entryId || '',
        suggestion: ''
      })
    } catch (err) {
      console.error(err)
      toast.error(getSubmitErrorMessage(err, 'Failed to submit suggestion'))
    }
  }

  const getVariant = () => {
    if (deviceType === 'mobile') return 'mobile'
    if (deviceType === 'tablet') return 'tablet'
    return 'desktop'
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key='step1' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className='space-y-5'>
            <div className='space-y-2'>
              <label className='text-gold text-sm font-medium flex items-center gap-2'>
                <User className='w-4 h-4' /> Name *
              </label>
              <Input
                value={formData.name}
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
                value={formData.entryId}
                readOnly
                disabled
                className='bg-black/30 border-gold/30 text-champagne opacity-80 cursor-not-allowed'
              />
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div key='step2' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className='space-y-5'>
            <label className='text-gold text-sm font-medium flex items-center gap-2'>
              <Calendar className='w-4 h-4' /> Will you attend? *
            </label>

            <Select
              value={formData.attendance}
              onValueChange={v => setFormData({ ...formData, attendance: v as Attendance })}
            >
              <SelectTrigger className='bg-black/30 border-gold/30 text-champagne'>
                <SelectValue placeholder='Select response' />
              </SelectTrigger>
              <SelectContent className='bg-black border-gold/30'>
                <SelectItem value='yes'>Yes, I'll be there</SelectItem>
                <SelectItem value='no'>No, I can't make it</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        )

      case 3:
        return (
          <motion.div key='step3' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className='space-y-5'>
            <label className='text-gold text-sm font-medium flex items-center gap-2'>
              <UtensilsCrossed className='w-4 h-4' /> Meal Preference *
            </label>

            <Select
              value={formData.mealPreference}
              onValueChange={v => setFormData({ ...formData, mealPreference: v as Meal })}
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
              onChange={e => setFormData({ ...formData, dietary: e.target.value })}
              className='bg-black/30 border-gold/30 text-champagne'
            />
          </motion.div>
        )

      default:
        return null
    }
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

            <h2 className='text-2xl font-display text-gold mt-4'>You're All Set</h2>
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
                    onChange={e =>
                      setSongData({ ...songData, songName: e.target.value })
                    }
                  />

                  <Input
                    placeholder='Artist'
                    value={songData.artist}
                    onChange={e =>
                      setSongData({ ...songData, artist: e.target.value })
                    }
                  />

                  <Button type='submit' className='w-full'>
                    Submit Song
                  </Button>
                </form>
              )}

              {activeTab === 'suggestion' && (
                <form onSubmit={handleSuggestionSubmit} className='space-y-3'>
                  <Textarea
                    placeholder='Your suggestion for the event'
                    value={suggestionData.suggestion}
                    onChange={e =>
                      setSuggestionData({
                        ...suggestionData,
                        suggestion: e.target.value
                      })
                    }
                  />

                  <Button type='submit' className='w-full'>
                    Submit Suggestion
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
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
  )
}

export default RSVP
