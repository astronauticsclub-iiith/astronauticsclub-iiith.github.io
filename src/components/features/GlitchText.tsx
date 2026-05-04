import React, { useState, useEffect } from "react";
import "./glitch.css";

interface GlitchTextProps {
    text: string;
    className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className }) => {
    const [glitchedText, setGlitchedText] = useState(text);

    useEffect(() => {
        const interval = setInterval(() => {
            let newText = "";
            for (let i = 0; i < text.length; i++) {
                if (Math.random() > 0.2) {
                    // 80% chance to glitch a character
                    newText += String.fromCharCode(33 + Math.random() * 94); // Random printable character
                } else {
                    newText += text[i];
                }
            }
            setGlitchedText(newText);
        }, 300);

        return () => clearInterval(interval);
    }, [text]);

    return (
        <p className={`glitch ${className}`} data-text={glitchedText}>
            {glitchedText}
        </p>
    );
};

export default GlitchText;
