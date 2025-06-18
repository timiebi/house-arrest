"use client"


import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";


const containerVariant = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.3,
        },
    },
};



export const FadeInOnScroll = ({ children }: { children: React.ReactNode }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

    return (
        <motion.div
            ref={ref}
            variants={containerVariant}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
        >
            {children}
        </motion.div>)
};
