import { OverlayWidget } from "./OverlayWidget";

export const FeedbackButton = ({
  platformId,
  url,
  mode,
  preload = false,
  text = "Feedback",
  style,
  button,
}: {
  platformId: string;
  url?: string;
  mode?: "dark" | "light";
  preload?: boolean;
  text?: string;
  style?: React.CSSProperties;
  button?: React.ReactNode;
}) => {
  return (
    <OverlayWidget
      platformId={platformId}
      url={url}
      mode={mode}
      preload={preload}
    >
      {button ? (
        button
      ) : (
        <button
          className="fl:bg-black fl:border-white/40 fl:text-white fl:rounded-[6px] fl:border fl:px-3 fl:py-1.5 fl:hover:bg-[#222] fl:size-fit fl:text-sm fl:cursor-pointer"
          style={style}
        >
          {text}
        </button>
      )}
    </OverlayWidget>
  );
};

FeedbackButton.displayName = "FeedbackButton";
