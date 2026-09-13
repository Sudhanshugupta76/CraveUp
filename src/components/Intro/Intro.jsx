import { useEffect, useState } from "react";
import { MdFastfood } from "react-icons/md";
import "./Intro.css";

const Intro = ({ onFinish }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsClosing(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isClosing) return undefined;

    const timer = window.setTimeout(onFinish, 550);
    return () => window.clearTimeout(timer);
  }, [isClosing, onFinish]);

  const closeIntro = () => setIsClosing(true);

  return (
    <div className={`intro ${isClosing ? "introClosing" : ""}`} role="dialog" aria-label="Welcome to CraveUp">
      <div className="introGlow introGlowOne" />
      <div className="introGlow introGlowTwo" />
      <div className="introContent">
        <div className="introIconWrap">
          <MdFastfood className="introIcon" aria-hidden="true" />
          <span className="introSpark introSparkOne" />
          <span className="introSpark introSparkTwo" />
          <span className="introSpark introSparkThree" />
        </div>
        <p className="introKicker">Freshly made. Happily delivered.</p>
        <h1>CraveUp</h1>
        <p className="introMessage">Your next delicious moment is on its way.</p>
        <div className="introProgress" aria-hidden="true">
          <span />
        </div>
        <button type="button" className="introSkip" onClick={closeIntro}>
          Skip intro
        </button>
      </div>
    </div>
  );
};

export default Intro;
