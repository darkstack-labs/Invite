import { motion } from 'framer-motion';
import { Calendar, Download } from 'lucide-react';

interface AddToCalendarProps {
  eventTitle?: string;
  eventDate?: Date;
  eventLocation?: string;
  className?: string;
}

const AddToCalendar = ({ 
  eventTitle = "THE WORST BATCH - Signing Off",
  eventDate = new Date('2026-03-24T16:00:00'),
  eventLocation = "Secret Location, TBD",
  className = ""
}: AddToCalendarProps) => {
  
  const formatDateForCal = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, '');
  };

  const handleAddToCalendar = () => {
    const startDate = formatDateForCal(eventDate);
    const endDate = formatDateForCal(new Date(eventDate.getTime() + 5 * 60 * 60 * 1000)); // 5 hours later
    
    const googleCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&location=${encodeURIComponent(eventLocation)}&details=${encodeURIComponent("You're invited to the most epic batch party! Don't miss it. 🎉")}`;
    
    window.open(googleCalUrl, '_blank');
  };

  const handleDownloadICS = () => {
    const startDate = formatDateForCal(eventDate);
    const endDate = formatDateForCal(new Date(eventDate.getTime() + 5 * 60 * 60 * 1000));
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//THE WORST BATCH//Party//EN
BEGIN:VEVENT
UID:${Date.now()}@worstbatch.party
DTSTAMP:${formatDateForCal(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${eventTitle}
LOCATION:${eventLocation}
DESCRIPTION:You're invited to the most epic batch party! Don't miss it. 🎉
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'worst-batch-party.ics';
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col sm:flex-row gap-3 ${className}`}
    >
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCalendar}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(0, 0, 0, 0.8) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
        }}
      >
        <Calendar className="w-4 h-4 text-gold" />
        <span className="text-gold">Add to Google Calendar</span>
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownloadICS}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0.6) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <Download className="w-4 h-4 text-champagne" />
        <span className="text-champagne">Download .ics</span>
      </motion.button>
    </motion.div>
  );
};

export default AddToCalendar;
