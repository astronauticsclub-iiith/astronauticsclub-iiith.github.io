"use client";

import { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        The idea of starting an Astronomy club struck one of the founders on
        Himalaya block terrace where{" "}
        <a
          className="link"
          href="https://sites.google.com/view/praveen-paruchuri/"
        >
          Prof. Praveen Paruchuri
        </a>{" "}
        had invited everyone to witness the &quot;Super Blue Blood Moon&quot; -
        the lunar eclipse on 31st January 2018. Six freshmen:{" "}
        <a className="link" href="https://www.linkedin.com/in/yash~chaurasia/">
          Yash Chaurasia
        </a>
        ,{" "}
        <a
          className="link"
          href="https://www.linkedin.com/in/jayadev-naram-468764167/"
          target="_blank"
        >
          Jayadev Naram
        </a>
        ,{" "}
        <a
          className="link"
          href="https://www.instagram.com/its_pk.s1210/"
          target="_blank"
        >
          Prajwal Krishna Maitin
        </a>
        ,{" "}
        <a
          className="link"
          href="https://www.linkedin.com/in/tanmay-sinha-b747171b3/"
          target="_blank"
        >
          Tanmay Kumar Sinha
        </a>
        ,{" "}
        <a
          className="link"
          href="https://www.linkedin.com/in/siddharth--jain/"
          target="_blank"
        >
          Siddharth Jain
        </a>{" "}
        and{" "}
        <a
          className="link"
          href="https://www.linkedin.com/in/jainam-khakhra-94ab2b146/"
          target="_blank"
        >
          Jainam Khakhra
        </a>{" "}
        decided to take this idea seriously and mailed{" "}
        <a
          className="link"
          href="https://sites.google.com/site/subhadipmitra/"
          target="_blank"
        >
          Prof. Subhadip Mitra
        </a>{" "}
        for support/mentorship. His reply? He was waiting for someone in the
        college to take interest in this field. <br />
        <br />
        With support from{" "}
        <a
          className="link"
          href="https://sites.google.com/site/radhika41"
          target="_blank"
        >
          Prof. Radhika Mamidi
        </a>{" "}
        then the SLC chair, an 8 inch Dobosonian reflector telescope was
        procured. The first Astronomy club event was a total Lunar eclipse
        viewing session on 27<sup>th</sup> July 2018 - the start of a new
        academic year and our club as well! Further equipments like binoculars,
        different eyepieces, tripods etc. were procured in the following year
        enhancing observational capabilities. A special mention goes to{" "}
        <a
          className="link"
          href="https://www.linkedin.com/in/ansh-puvvada-9071a2191/"
          target="_blank"
        >
          Ansh Puvvada
        </a>{" "}
        and{" "}
        <a
          className="link"
          href="https://www.instagram.com/shreyasbadami/"
          target="_blank"
        >
          Shreyas Badami
        </a>
        , who were critical in managing the club in the following years, despite
        the halt in the club&apos;s expansion due to COVID. <br />
        <br />
        Around this time, India&apos;s space sector was witnessing a remarkable
        boom, marked by the emergence of multiple SpaceTech startups and the
        successful Chandrayaan-3 mission. Riding this wave of enthusiasm, the
        club expanded its focus to include SpaceTech, leading to notable
        achievements in 2021 and 2024, when our teams reached the World Finals
        of the prestigious CanSat Competition—a miniature satellite design
        competition organized by the American Astronautical Society and NASA. In
        July 2024, the club was officially renamed as <i>Astronautics Club</i>,
        reflecting our expanded vision and aspirations.
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
        We organize a mix of Astronomy and Aeronautics themed events. Some of
        our regular activities include:
        <ul className="brutalist-list">
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
        We maintain an active presence on social media, making it easy to stay
        connected with us. For instant updates, join our{" "}
        <a
          className="link"
          href="https://chat.whatsapp.com/DlOZnHdUTRO3PGmfrahozG"
        >
          WhatsApp Notifier Group
        </a>{" "}
        for astronomy events. <br />
        <br />
        🚀 On{" "}
        <a
          className="link"
          href="https://www.linkedin.com/company/astronauticsclub/"
        >
          LinkedIn
        </a>
        , we run a weekly Space Stories series, covering the latest developments
        in Space Science and Technology.
        <br />
        🌌 On{" "}
        <a
          className="link"
          href="https://www.instagram.com/astronautics_club_iiith/"
        >
          Instagram
        </a>
        , dive into fun trivia quizzes and look at breathtaking astrophotography
        captures from our community.
      </div>
    ),
  },
  {
    id: 5,
    question: "What kind of projects does the club work on?",
    answer:
      "The project team was started very recently in late 2024. Prior to this, our project work primarily focused on competition-based initiatives. Currently, we are working on building our own Reflector telescope, Equitorial platform and Radio telescope.",
  },
  {
    id: 7,
    question:
      "I'm interested in learning about Astronomy and Astrophysics. Where do I start learning from?",
    answer: "We wrote a blog on introduction to Astronomy here.",
  },
  {
    id: 8,
    question: "Can I suggest new activities or projects?",
    answer:
      "Of course! We are open to any event idea or feedback. You may share your ideas with us at this link or through our social media handles.",
  },
];

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <motion.section
      className="brutalist-faq-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        className="brutalist-faq-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <motion.h1
          className="brutalist-faq-heading"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          FREQUENTLY ASKED QUESTIONS
        </motion.h1>
        <motion.div
          className="brutalist-faq-underline"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        />
        <motion.p
          className="brutalist-faq-subheading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          Curious about our past, what kind of events do we organize and how you
          can join Astronautics Club? Find all your answers here!
        </motion.p>
      </motion.div>

      <div className="brutalist-accordion">
        {faqData.map((item, index) => (
          <motion.div
            key={item.id}
            className={`brutalist-accordion-item ${
              openItem === item.id ? "active" : ""
            }`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 1.2 + index * 0.1,
              duration: 0.5,
              ease: "easeOut",
            }}
            whileHover={{
              y: -4,
              transition: { duration: 0.2 },
            }}
          >
            <motion.button
              className="brutalist-accordion-trigger"
              onClick={() => toggleItem(item.id)}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              <span className="brutalist-accordion-question">
                {item.question}
              </span>
              <motion.span
                className="brutalist-accordion-icon"
                animate={{
                  rotate: openItem === item.id ? 180 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                ▼
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {openItem === item.id && (
                <motion.div
                  className="brutalist-accordion-content"
                  initial={{
                    height: 0,
                    opacity: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                    paddingTop: "2rem",
                    paddingBottom: "2rem",
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <motion.div
                    className="brutalist-accordion-answer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    {typeof item.answer === "string" ? (
                      <p>{item.answer}</p>
                    ) : (
                      item.answer
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
