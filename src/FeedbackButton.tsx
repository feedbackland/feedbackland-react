import { OverlayWidget } from "./OverlayWidget";
import { cn } from "./utils";

export const FeedbackButton = ({
  id,
  url,
  mode,
  text = "Give feedback",
  className,
  style,
  button,
}: {
  id: string;
  url?: string;
  mode?: "dark" | "light";
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  button?: React.ReactNode;
}) => {
  return (
    <OverlayWidget id={id} url={url} mode={mode}>
      {button ? (
        button
      ) : (
        <button
          className={cn(
            "",
            "feedbackland:bg-black feedbackland:border-white feedbackland:text-white feedbackland:rounded feedbackland:border-1 feedbackland:px-3 feedbackland:py-1 feedbackland:font-normal feedbackland:text-base feedbackland:hover:bg-[#2E2E2E] feedbackland:size-fit feedbackland:font-base",
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
