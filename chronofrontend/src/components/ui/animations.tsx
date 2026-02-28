'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// Variantes d'animation pour les cartes
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

// Variantes pour les listes
export const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const listItemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Variantes pour les modales
export const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Variantes pour les boutons
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.1 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Variantes pour les tableaux
export const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.05
    }
  }
};

export const tableRowVariants = {
  hidden: { 
    opacity: 0, 
    x: -10 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Composant de carte animée
export const AnimatedCard = ({ 
  children, 
  className = "", 
  delay = 0,
  ...props 
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  [key: string]: any;
}) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover="hover"
    custom={delay}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

// Composant de liste animée
export const AnimatedList = ({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={listVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

// Composant d'élément de liste animé
export const AnimatedListItem = ({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={listItemVariants}
    className={className}
  >
    {children}
  </motion.div>
);

// Composant de tableau animé
export const AnimatedTable = ({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={tableVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

// Composant de ligne de tableau animée
export const AnimatedTableRow = ({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.tr
    variants={tableRowVariants}
    className={className}
  >
    {children}
  </motion.tr>
);

// Composant de bouton animé
export const AnimatedButton = ({ 
  children, 
  className = "", 
  onClick,
  disabled = false,
  ...props 
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: any;
}) => (
  <motion.button
    variants={buttonVariants}
    initial="idle"
    whileHover={disabled ? "idle" : "hover"}
    whileTap={disabled ? "idle" : "tap"}
    onClick={onClick}
    disabled={disabled}
    className={className}
    {...props}
  >
    {children}
  </motion.button>
);

// Composant de modale animée
export const AnimatedModal = ({ 
  children, 
  isOpen, 
  onClose,
  className = "" 
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Composant de statistiques animées
export const AnimatedStats = ({ 
  children, 
  className = "",
  delay = 0 
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.6,
      delay: delay * 0.1,
      ease: "easeOut"
    }}
    whileHover={{
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Composant de page avec animation d'entrée
export const AnimatedPage = ({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{
      duration: 0.5,
      ease: "easeOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Composant de chargement animé
export const AnimatedLoader = ({ 
  className = "" 
}: {
  className?: string;
}) => (
  <motion.div
    animate={{
      rotate: 360,
      scale: [1, 1.1, 1]
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  >
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
  </motion.div>
);

// Composant de notification animée
export const AnimatedNotification = ({ 
  children, 
  isVisible, 
  className = "" 
}: {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);


