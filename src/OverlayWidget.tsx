"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn, validateUUID } from "./utils";
import { XIcon } from "lucide-react";
import { FocusOn } from "react-focus-on";

const getPlatformUrl = ({
  platformId,
  url,
  mode,
}: {
  platformId: string;
  url?: string;
  mode: "dark" | "light";
}) => {
  let platformUrl: string | undefined = undefined;

  if (url) {
    platformUrl = `${url}?mode=${mode}`;
  } else if (platformId && validateUUID(platformId)) {
    platformUrl = `https://${platformId}.feedbackland.com?mode=${mode}`;
  }

  return platformUrl;
};

export const OverlayWidget = memo(
  ({
    platformId,
    url,
    mode = "light",
    children,
    className,
  }: {
    platformId: string;
    url?: string;
    mode?: "dark" | "light";
    children: React.ReactNode;
    className?: React.ComponentProps<"div">["className"];
  }) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [platformUrl, setPlatformUrl] = useState<string | undefined>(
      undefined
    );

    const handleOpen = () => {
      if (platformUrl) {
        setIsOpened(true);
        setTimeout(() => {
          setIsVisible(true);
        }, 300);
      }
    };

    const handleClose = useCallback(() => {
      setIsOpened(false);
      setIsVisible(false);
    }, []);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      const platformUrl = getPlatformUrl({
        platformId,
        url,
        mode,
      });

      setPlatformUrl(platformUrl);
    }, [platformId, mode, url]);

    return (
      <>
        <div onClick={handleOpen} className={cn("", className)}>
          {children}
        </div>

        {isMounted &&
          document &&
          createPortal(
            <>
              <div
                onClick={handleClose}
                className={cn(
                  "fl:fixed fl:inset-0 fl:transition-opacity fl:ease-out fl:bg-black/65 fl:z-2147483646 fl:duration-250",
                  {
                    "fl:-z-200": !isVisible,
                    "fl:opacity-0": !isVisible,
                  }
                )}
                aria-hidden="true"
              />

              <FocusOn
                enabled={isVisible}
                onClickOutside={handleClose}
                onEscapeKey={handleClose}
                crossFrame={true}
              >
                <div
                  className={cn(
                    "fl:fixed fl:top-0 fl:bottom-0 fl:right-0 fl:w-full fl:h-full fl:max-w-[calc(100vw-40px)] fl:sm:max-w-[600px] fl:z-2147483647 fl:transform fl:transition-transform fl:duration-250 fl:ease-in-out fl:translate-x-full fl:will-change-transform fl:bg-white",
                    {
                      "fl:top-10000": !isOpened,
                      "fl:overflow-hidden": !isVisible,
                      "fl:-z-100": !isVisible,
                      "fl:translate-x-0": isVisible,
                      "fl:bg-black": mode === "dark",
                    }
                  )}
                >
                  <div className="fl:w-full fl:h-full fl:relative">
                    <iframe
                      ref={iframeRef}
                      src={platformUrl}
                      className={cn(
                        "fl:w-full fl:h-full fl:overflow-hidden fl:border-0 fl:border-none fl:outline-none fl:ring-0 fl:shadow-none fl:m-0 fl:p-0"
                      )}
                      loading="lazy"
                      allow="clipboard-write 'src'"
                      title="Share your feedback"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="Feedback board"
                      frameBorder="0"
                    />
                    <button
                      className="fl:flex fl:items-center fl:justify-center fl:shrink-0 fl:appearance-none fl:bg-transparent fl:border-none fl:p-0 fl:m-0 fl:size-6! fl:cursor-pointer fl:absolute fl:top-[15px] fl:-left-[34px] fl:text-white fl:hover:text-white fl:rounded-md fl:hover:bg-black/50"
                      onClick={handleClose}
                    >
                      <XIcon className="fl:size-5!" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </FocusOn>
            </>,
            document.body
          )}
      </>
    );
  }
);

OverlayWidget.displayName = "OverlayWidget";
