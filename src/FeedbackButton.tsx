import { buttonVariants } from "./components/ui/button";
import { OverlayWidget } from "./OverlayWidget";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { PopoverWidget } from "./PopoverWidget";

export const FeedbackButton = ({
  platformId,
  url,
  widget = "drawer",
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    platformId: string;
    url?: string;
    widget?: "drawer" | "popover" | "link";
  }) => {
  const Comp = "button";

  const button = (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      {...(widget === "link" && {
        onClick: () => {
          window.open(`https://${platformId}.feedbackland.com`, "_blank");
        },
      })}
    />
  );

  if (widget === "link") {
    return button;
  }

  if (widget === "popover") {
    return (
      <PopoverWidget platformId={platformId} url={url}>
        {button}
      </PopoverWidget>
    );
  }

  return (
    <OverlayWidget platformId={platformId} url={url}>
      {button}
    </OverlayWidget>
  );
};

FeedbackButton.displayName = "FeedbackButton";
