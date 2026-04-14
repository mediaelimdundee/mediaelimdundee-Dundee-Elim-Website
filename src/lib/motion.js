export const motionEase = [0.22, 1, 0.36, 1];

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.56, ease: motionEase },
};

export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.48, ease: motionEase },
};

export const fadeLeft = {
  initial: { opacity: 0, x: -24 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.58, ease: motionEase },
};

export const fadeRight = {
  initial: { opacity: 0, x: 24 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.58, ease: motionEase },
};

export const cardHover = {
  whileHover: { y: -4, transition: { duration: 0.18, ease: motionEase } },
  whileTap: { scale: 0.986 },
};

export const subtleTap = {
  whileTap: { scale: 0.985 },
};

export const navPillSpring = {
  type: 'spring',
  stiffness: 380,
  damping: 34,
  mass: 0.8,
};
