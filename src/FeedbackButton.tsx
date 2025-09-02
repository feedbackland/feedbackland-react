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
            "fl:bg-black fl:border-white fl:text-white fl:rounded fl:border-1 fl:px-3 fl:py-1.5 fl:font-normal fl:text-base fl:hover:bg-[#2E2E2E] fl:size-fit fl:font-sm fl:cursor-pointer",
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
