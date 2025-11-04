import { buttonVariants } from "./components/ui/button";
import { OverlayWidget } from "./OverlayWidget";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const FeedbackButton = ({
  platformId,
  url,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    text?: string;
    platformId: string;
    url?: string;
  }) => {
  const Comp = asChild ? Slot : "button";

  return (
    <OverlayWidget platformId={platformId} url={url}>
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    </OverlayWidget>
  );
};

FeedbackButton.displayName = "FeedbackButton";
