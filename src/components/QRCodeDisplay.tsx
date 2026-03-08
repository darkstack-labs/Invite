import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  entryId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const QRCodeDisplay = ({ entryId, name, size = 'md' }: QRCodeDisplayProps) => {
  const sizes = {
    sm: { container: 'w-32 h-32', text: 'text-xs', qrSize: 80 },
    md: { container: 'w-48 h-48', text: 'text-sm', qrSize: 120 },
    lg: { container: 'w-64 h-64', text: 'text-base', qrSize: 160 },
  };

  const sizeConfig = sizes[size];

  // QR code value contains the entry pass info
  const qrValue = JSON.stringify({
    type: 'BATCH_PARTY_ENTRY',
    name,
    entryId,
    event: 'THE WORST BATCH Party',
    date: '2026-03-24',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <motion.div
        className={`${sizeConfig.container} relative rounded-xl overflow-hidden flex items-center justify-center`}
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.5)',
        }}
        whileHover={{
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
        }}
      >
        {/* Real QR Code */}
        <div className="bg-white rounded-lg p-2">
          <QRCodeSVG
            value={qrValue}
            size={sizeConfig.qrSize}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>

        {/* Corner decorations */}
        <motion.div
          className="absolute top-2 left-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-3 h-3 text-gold/60" />
        </motion.div>
        <motion.div
          className="absolute top-2 right-2"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-3 h-3 text-gold/60" />
        </motion.div>

        {/* Scan line animation */}
        <motion.div
          className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent"
          initial={{ top: '20%' }}
          animate={{ top: ['20%', '80%', '20%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Entry ID */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-3 text-center"
      >
        <p className="text-gold/60 text-xs uppercase tracking-wider">Entry Pass</p>
        <p className={`text-gold font-bold tracking-widest ${sizeConfig.text}`}>
          {entryId}
        </p>
        <p className="text-champagne/70 text-xs mt-1">{name}</p>
      </motion.div>
    </motion.div>
  );
};

export default QRCodeDisplay;
