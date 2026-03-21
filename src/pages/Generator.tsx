import { useNavigate } from 'react-router-dom';
import { useTimetableStore } from '@/stores/timetableStore';
import { toast } from '@/stores/toastStore';
import StepIndicator from '@/components/features/StepIndicator';
import GeneralConfigStep from '@/components/features/GeneralConfigStep';
import BranchesStep from '@/components/features/BranchesStep';
import LabsStep from '@/components/features/LabsStep';
import SubjectsStep from '@/components/features/SubjectsStep';
import CombinedClassStep from '@/components/features/CombinedClassStep';
import ConfirmedClassesStep from '@/components/features/ConfirmedClassesStep';
import ReviewStep from '@/components/features/ReviewStep';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

// Sound effect for generate button
const generateSound = new Audio('/faaah.mp3');

const STEPS = [GeneralConfigStep, BranchesStep, LabsStep, SubjectsStep, CombinedClassStep, ConfirmedClassesStep, ReviewStep];

export default function Generator() {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, branches, subjects, generalConfig, generate, resetWizard } = useTimetableStore();
  const StepComponent = STEPS[currentStep] ?? STEPS[0];

  function canProceed(): boolean {
    if (currentStep === 0) return generalConfig.periodsPerDay > 0 && generalConfig.periodDuration > 0 && generalConfig.workingDays.length > 0 && generalConfig.startTime !== '';
    if (currentStep === 1) return branches.length > 0;
    if (currentStep === 3) return subjects.length > 0;
    return true;
  }

  function handleNext() {
    if (!canProceed()) { toast({ title: 'Please complete all required fields', variant: 'destructive' }); return; }
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  }

  function handleBack() { if (currentStep > 0) setCurrentStep(currentStep - 1); }

  function handleGenerate() {
    generate();
    generateSound.currentTime = 0;
    generateSound.play().catch(() => {});
    toast({ title: 'Timetable forged!', description: 'Redirecting to view...', variant: 'success' });
    navigate('/timetable');
  }

  function handleReset() { resetWizard(); toast({ title: 'Forge reset', variant: 'default' }); }

  const isLastStep = currentStep === STEPS.length - 1;
  const totalSteps = STEPS.length;

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-56 surface-low p-4 shrink-0">
        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />
        <div className="mt-auto pt-4">
          <button onClick={() => { resetWizard(); navigate('/generator'); }}
            className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 btn-bubble">
            <Sparkles className="size-4" /> + New Timetable
          </button>
          <div className="mt-4 space-y-2">
            <div className="label-system text-muted-foreground/50 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> System Status
            </div>
            <div className="label-system text-muted-foreground/50">Support</div>
          </div>
        </div>
      </div>

      {/* Mobile step bar */}
      <div className="flex lg:hidden overflow-x-auto pb-0 px-4 pt-3 shrink-0">
        <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 xl:px-14 py-8">
          <StepComponent />
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 surface-low px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={handleBack} disabled={currentStep === 0}
              className="h-10 sm:h-11 px-4 sm:px-5 surface-high rounded-xl text-sm font-display font-medium flex items-center gap-1.5 sm:gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowLeft className="size-4" /><span className="hidden sm:inline">Back</span>
            </button>
            <button onClick={handleReset}
              className="h-10 sm:h-11 px-3 sm:px-4 text-secondary text-sm font-display font-medium flex items-center gap-1.5 sm:gap-2 transition-all hover:bg-secondary/10 rounded-xl">
              <RotateCcw className="size-4" /><span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="label-system text-muted-foreground hidden md:block">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <div className="w-16 sm:w-24 h-1 surface-highest rounded-full overflow-hidden hidden md:block">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
            </div>

            {isLastStep ? (
              <button onClick={handleGenerate} disabled={!canProceed()}
                className="h-10 sm:h-11 px-5 sm:px-8 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center gap-1.5 sm:gap-2 btn-bubble disabled:opacity-40 disabled:cursor-not-allowed">
                <Sparkles className="size-4" /><span className="hidden sm:inline">Forge Timetable</span>
              </button>
            ) : (
              <button onClick={handleNext} disabled={!canProceed()}
                className="h-10 sm:h-11 px-5 sm:px-8 bg-primary text-primary-foreground rounded-xl text-sm font-display font-bold flex items-center gap-1.5 sm:gap-2 btn-bubble disabled:opacity-40 disabled:cursor-not-allowed">
                Next <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
