"use client";

import { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: number;
  question: string;
  answer: string | JSX.Element;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "History behind the club",
    answer: (
      <div>
        The idea of starting an Astronomy club struck one of the founders on Himalaya block terrace
        where{" "}
        <a
          className="custom-link"
          href="https://sites.google.com/view/praveen-paruchuri/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Prof. Praveen Paruchuri
        </a>{" "}
        had invited everyone to witness the &quot;Super Blue Blood Moon&quot; - the lunar eclipse on
        31st January 2018. Six freshmen:{" "}
        <a
          className="custom-link"
          href="https://www.linkedin.com/in/yash~chaurasia/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Yash Chaurasia
        </a>
        ,{" "}
        <a
          className="custom-link"
          href="https://www.linkedin.com/in/jayadev-naram-468764167/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jayadev Naram
        </a>
        ,{" "}
        <a
          className="custom-link"
          href="https://www.instagram.com/its_pk.s1210/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Prajwal Krishna Maitin
        </a>
        ,{" "}
        <a
          className="custom-link"
          href="https://www.linkedin.com/in/tanmay-sinha-b747171b3/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tanmay Kumar Sinha
        </a>
        ,{" "}
        <a
          className="custom-link"
          href="https://www.linkedin.com/in/siddharth--jain/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Siddharth Jain
        </a>{" "}
        and{" "}
        <a
          className="custom-link"
          href="https://www.linkedin.com/in/jainam-khakhra-94ab2b146/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jainam Khakhra
        </a>{" "}
        decided to take this idea seriously and mailed{" "}
        <a
          className="custom-link"
          href="https://sites.google.com/site/subhadipmitra/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Prof. Subhadip Mitra
        </a>{" "}
        for support/mentorship. His reply? He was waiting for someone in the college to take
        interest in this field. <br />
        <br />
        With a lot of efforts and support from{" "}
        <a
          className="custom-link"
          href="https://sites.google.com/site/radhika41"
          target="_blank"
          rel="noopener noreferrer"
        >
          Prof. Radhika Mamidi
        </a>
        , then the SLC chair, an 8 inch Dobosonian reflector telescope was procured in our first
        year. We formally started our Club by holding a total lunar eclipse viewing session on 27
        <sup>th</sup> July 2018 – the start of the new academic year and our club as well! Further
        equipments like binoculars, different eyepieces, tripods etc. were procured in the following
        year enhancing observational capabilities. A special mention goes to{" "}
        <a
          className="custom-link"
          href="https://www.linkedin.com/in/ansh-puvvada-9071a2191/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ansh Puvvada
        </a>{" "}
        and{" "}
        <a
          className="custom-link"
          href="https://www.instagram.com/shreyasbadami/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shreyas Badami
        </a>
        , who were critical in managing the club in the following years, despite the halt in the
        club&apos;s expansion due to COVID-19. <br />
        <br />
        The club expanded its focus to include SpaceTech, leading to notable achievements in 2021
        and 2024, when our teams reached the World Finals of the prestigious CanSat Competition—a
        miniature satellite design competition organized by the American Astronautical Society and
        NASA. In July 2024, the club was officially renamed as <i>Astronautics Club</i>, reflecting
        our expanded vision and aspirations.
      </div>
    ),
  },
  {
    id: 2,
    question: "Who can join the club? And what's the procedure?",
    answer:
      "Any IIIT student is welcome to join the club. The only prerequisite we ask for is a genuine passion for space 🌌. Our club recruitments are held around November each year.",
  },
  {
    id: 3,
    question: "What kind of activities does the club organize?",
    answer: (
      <div>
        We organize a mix of Astronomy and Aeronautics themed events. Some of our regular activities
        include:
        <ul className="list-disc list-inside pl-4 mt-2 text-white/80">
          <li>Stargazing sessions</li>
          <li>Starparty trips at the city outskirts</li>
          <li>Astrophotography nights</li>
          <li>Astronomy theory sessions</li>
          <li>Computational Astronomy competition like Exoplanet hunt</li>
          <li>Workshops on CAD Modelling and Model Rocketry</li>
          <li>Internal club projects</li>
        </ul>
      </div>
    ),
  },
  {
    id: 4,
    question: "How can I stay updated about club events?",
    answer: (
      <div>
        We maintain an active presence on social media, making it easy to stay connected with us.
        For instant updates, join our{" "}
        <a
          className="custom-link"
          href="https://chat.whatsapp.com/DlOZnHdUTRO3PGmfrahozG"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp Notifier Group
        </a>{" "}
        for astronomy events. <br />
        <br />
        🚀 On{" "}
        <a
          className="custom-link"
          href="https://www.linkedin.com/company/astronauticsclub/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        , we run a monthly Space Stories series, covering the latest developments in Space Science
        and Technology.
        <br />
        🌌 On{" "}
        <a
          className="custom-link"
          href="https://www.instagram.com/astronautics_club_iiith/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        , dive into fun trivia quizzes and look at breathtaking astrophotography captures from our
        community.
      </div>
    ),
  },
  {
    id: 5,
    question: "What kind of projects does the club work on?",
    answer:
      "The project team was started very recently in late 2024. Prior to this, our project work primarily focused on competition-based initiatives. Currently, we are working on building our Radio telescope, Equitorial mount with Harmonic Drive and launching Model rockets.",
  },
  {
    id: 7,
    question:
      "I'm interested in learning about Astronomy and Astrophysics. Where do I start learning from?",
    answer: (
      <div>
        A good beginning point is the <b>Cosmic Distance Ladder</b> which is about how various
        lengths like Earth&apos;s radius, distances between Earth and sun, alpha-centuri etc. were
        measured. We wrote an article for the same{" "}
        <a
          className="custom-link"
          href="https://clubs.iiit.ac.in/astronautics/blogs/cosmic-distance-ladder"
          target="_blank"
          rel="noopener noreferrer"
        >
          here.
        </a>
      </div>
    ),
  },
  {
    id: 8,
    question: "Can I suggest new activities or projects?",
    answer:
      "Of course! We are open to any event idea or feedback. You may share your ideas by mailing us or through our social media handles.",
  },
];

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

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
            Curious about our past, what kind of events do we organize and how you can join
            Astronautics Club? Find all your answers here!
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
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
                <span className="text-xl font-semibold text-white">{item.question}</span>
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
                    <div className="p-6 pt-0 text-white/80">
                      {typeof item.answer === "string" ? <p>{item.answer}</p> : item.answer}
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
