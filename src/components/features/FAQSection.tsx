"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqData } from "@/data/faqs";
import parse from 'html-react-parser';

export default function FAQSection() {
    const [openItem, setOpenItem] = useState<number | null>(null);

    const toggleItem = (id: number) => {
        setOpenItem(openItem === id ? null : id);
    };

    const parsedFaqData = useMemo(() => {
        return faqData.map((item) => ({
            ...item,
            answer: parse(item.answer)
        }));
    }, []);

    return (
        <motion.section
            className="py-16 md:py-24"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            <div className="max-w-4xl mx-auto">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <h1 className="text-4xl font-bold uppercase tracking-tight text-white">
                        Frequently Asked Questions
                    </h1>
                    <motion.div
                        className="h-1 bg-white w-24 mt-4 mx-auto"
                        initial={{ width: 0 }}
                        animate={{ width: "6rem" }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    ></motion.div>
                    <p className="mt-6 text-lg text-white/80 max-w-3xl mx-auto">
                        Curious about our past, what kind of events do we organize and how you can
                        join Astronautics Club? Find all your answers here!
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {parsedFaqData.map((item, index) => (
                        <motion.div
                            key={item.id}
                            className="border-2 border-white/20 bg-background/20 backdrop-blur-sm shadow-lg overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.8 + index * 0.1,
                                duration: 0.5,
                                ease: "easeOut",
                            }}
                        >
                            <motion.button
                                className={`w-full flex justify-between items-center p-6 text-left ${
                                    openItem === item.id ? "cursor-close" : "cursor-open"
                                }`}
                                onClick={() => toggleItem(item.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="text-xl font-semibold text-white">
                                    {item.question}
                                </span>
                                <motion.div
                                    animate={{
                                        rotate: openItem === item.id ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <ChevronDown className="w-6 h-6 text-white" />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {openItem === item.id && (
                                    <motion.div
                                        className="overflow-hidden"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{
                                            height: "auto",
                                            opacity: 1,
                                        }}
                                        exit={{
                                            height: 0,
                                            opacity: 0,
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <div className="p-6 pt-0 text-white/80 leading-relaxed">
                                            { item.answer }
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
