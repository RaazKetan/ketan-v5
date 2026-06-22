import React from "react";
import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  /* Stagger between successive items, ms. */
  stagger?: number;
  className?: string;
};

/* Magic UI flavor: each direct child fades + slides up in sequence
   when the list mounts. */
export const AnimatedList: React.FC<Props> = ({
  children,
  stagger = 60,
  className = "",
}) => {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (i * stagger) / 1000, duration: 0.35, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedList;
