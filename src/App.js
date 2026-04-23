import React, { useState } from "react";
import { aesSteps } from "./logic/aesSteps";
import StepViewer from "./components/StepViewer";

export default function App() {
  const [steps, setSteps] = useState([]);
  const [i, setI] = useState(0);
  const [cipher, setCipher] = useState("");
  const [done, setDone] = useState(false);

  const start = () => {
    const text = document.getElementById("inp").value;
    const res = aesSteps(text);

    setSteps(res.steps);
    setCipher(res.ciphertext);
    setI(0);
    setDone(false);
  };

  const isLast = i === steps.length - 1;

  return (
    <div className="app">
      <h1>AES VISUALIZER 🔐</h1>

      <div>
        <input id="inp" placeholder="Enter text" />
        <button onClick={start}>Start</button>
      </div>

      {steps.length > 0 && (
        <>
          {/* ключ для анимации (важно!) */}
          <div key={i} className="step-animate">
            <StepViewer step={steps[i]} />
          </div>

          <div className="btns">
            <button
              onClick={() => setI(Math.max(i - 1, 0))}
              disabled={i === 0}
            >
              Prev
            </button>

            {!isLast && (
              <button
                onClick={() => setI(i + 1)}
              >
                Next
              </button>
            )}

            {isLast && (
              <button
                className="finish"
                onClick={() => setDone(true)}
              >
                Finish
              </button>
            )}
          </div>

          {done && (
            <div className="cipher">
              🔐 Ciphertext:
              <div>{cipher}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}