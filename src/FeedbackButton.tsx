"use client";

import "./index.css";
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

  // const bleh = {} as any;

  // const bleh = className
  //   ?.split(" ")
  //   .map((name) => `fl:${name}`)
  //   .join(" ");

  console.log(className);

  // const zolg = "fl:bg-[#f1f1f1] fl:text-[#ccc]";

  const button = (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
      {...(widget === "link" && {
        onClick: () => {
          window.open(`https://${platformId}.feedbackland.com`, "_blank");
        },
      })}
    />
  );

  let component = (
    <OverlayWidget platformId={platformId} url={url}>
      {button}
    </OverlayWidget>
  );

  if (widget === "link") {
    component = button;
  }

  if (widget === "popover") {
    component = (
      <PopoverWidget platformId={platformId} url={url}>
        {button}
      </PopoverWidget>
    );
  }

  return component;
};

FeedbackButton.displayName = "FeedbackButton";
