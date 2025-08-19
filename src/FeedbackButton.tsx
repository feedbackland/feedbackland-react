import { OverlayWidget } from "./OverlayWidget";
import { cn } from "./utils";

export const FeedbackButton = ({
  platformId,
  url,
  mode,
  text = "Feedback",
  className,
  style,
  button,
}: {
  platformId: string;
  url?: string;
  mode?: "dark" | "light";
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  button?: React.ReactNode;
}) => {
  return (
    <OverlayWidget platformId={platformId} url={url} mode={mode}>
      {button ? (
        button
      ) : (
        <button
          className={cn(
            "",
            "feedbackland:bg-black feedbackland:border-white feedbackland:text-white feedbackland:rounded feedbackland:border-1 feedbackland:px-3 feedbackland:py-1.5 feedbackland:font-normal feedbackland:text-base feedbackland:hover:bg-[#2E2E2E] feedbackland:size-fit feedbackland:font-sm feedbackland:cursor-pointer",
            className
          )}
          style={style}
        >
          {text}
        </button>
      )}
    </OverlayWidget>
  );
};

FeedbackButton.displayName = "FeedbackButton";
