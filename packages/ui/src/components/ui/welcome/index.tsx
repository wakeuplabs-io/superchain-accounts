// src/components/ui/welcome/types.ts
export type WelcomeStep = "welcome" | "loading" | "success";
export type LoadingPhase = 1 | 2 | 3;

export interface LoadingState {
  phase: LoadingPhase;
  progress: number;
  message: string;
}

// src/components/ui/welcome/Welcome.tsx
import { useState } from "react";
import { Card } from "../card";

import { ArrowRight } from "lucide-react";
import WakeupLogo from "@/assets/logos/wakeup-powered.svg";

const LOADING_STATES: Record<LoadingPhase, LoadingState> = {
  1: {
    phase: 1,
    progress: 25,
    message: "Lorem ipsum dolor sit amet, consectetur...",
  },
  2: {
    phase: 2,
    progress: 50,
    message: "Sit amet, consectetur lorem ipsum dolor...",
  },
  3: {
    phase: 3,
    progress: 90,
    message: "Em ipsum dolor sit amet, consectetur...",
  },
};

export const Welcome = () => {
  const [currentStep, setCurrentStep] = useState<WelcomeStep>("welcome");
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LOADING_STATES[1]
  );

  const startSetup = () => {
    setCurrentStep("loading");
    // Simular los diferentes estados de carga
    setTimeout(() => setLoadingState(LOADING_STATES[2]), 2000);
    setTimeout(() => setLoadingState(LOADING_STATES[3]), 4000);
    setTimeout(() => setCurrentStep("success"), 6000);
  };

  return (
    <Card className="w-full max-w-xl">
      {currentStep === "welcome" && (
        <div className="p-8">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">
              Smart Account <span className="text-red-500">Setup</span>
            </h1>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500" />
              <div className="w-6 h-6 rounded-full bg-blue-500" />
              <div className="w-6 h-6 rounded-full bg-orange-500" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <p>
              In just a few moments, you'll create your{" "}
              <strong>Smart account</strong> on three networks simultaneously.
            </p>
            <p>
              <strong>Optimism, BASE, and BOB.</strong>
            </p>
            <p className="text-gray-600">
              Please wait while we complete the setup and avoid leaving the page
              until the process is finished.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <img src={WakeupLogo} alt="Powered by Wakeup" className="h-6" />
            <button
              onClick={startSetup}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              Next
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {currentStep === "loading" && (
        <div className="p-8">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold">
              Creating your
              <br />
              Smart Account
            </h1>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500" />
              <div className="w-6 h-6 rounded-full bg-blue-500" />
              <div className="w-6 h-6 rounded-full bg-orange-500" />
            </div>
          </div>

          <div className="mt-6">
            <p>Please wait and do not leave this page.</p>

            <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-1000"
                style={{ width: `${loadingState.progress}%` }}
              />
            </div>

            <p className="mt-2 text-sm text-gray-600">{loadingState.message}</p>
          </div>

          <div className="mt-8">
            <img src={WakeupLogo} alt="Powered by Wakeup" className="h-6" />
          </div>
        </div>
      )}

      {currentStep === "success" && (
        <div className="p-8 relative min-h-[300px]">
          <div className="flex flex-col max-w-[65%]">
            <h1 className="text-2xl font-medium mb-6">Setup Complete!</h1>

            <p className="text-lg leading-normal font-normal text-gray-900 mb-16">
              Congratulations! You've successfully
              <br />
              created your Smart Account.
            </p>

            <button
              className="w-full max-w-[200px] px-4 py-2 text-[#FF0420] border border-[#FF0420] rounded-full text-base hover:bg-red-50 transition-colors mb-16"
              onClick={() => console.log("Open Smart Account")}
            >
              Open Smart Account
            </button>

            <div className="flex flex-col gap-1 text-gray-500">
              <span className="text-sm">Powered by</span>
              <img src={WakeupLogo} alt="Wakeup" className="h-5" />
            </div>
          </div>

          <img
            src="/welcome-success-illustration.png"
            alt="Success Illustration"
            className="absolute right-8 top-1/2 -translate-y-1/2 w-44"
          />
        </div>
      )}
    </Card>
  );
};
