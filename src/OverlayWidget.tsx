"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn, validateUUID } from "./utils";
import { XIcon } from "lucide-react";
import { FocusOn } from "react-focus-on";
import { useDarkMode } from "./hooks/use-dark-mode";

export const OverlayWidget = memo(
  ({
    platformId,
    url,
    children,
  }: {
    platformId: string;
    url?: string;
    children: React.ReactNode;
  }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isOpened, setIsOpened] = useState(false);
    const [platformUrl, setPlatformUrl] = useState<string | undefined>(
      undefined
    );
    const isDarkMode = useDarkMode();

    const handleOpen = useCallback(() => {
      if (platformUrl) {
        setIsOpened(true);
      }
    }, [platformUrl]);

    const handleClose = useCallback(() => {
      setIsOpened(false);
    }, []);

    useEffect(() => {
      setTimeout(() => {
        setIsMounted(true);
      }, 1000);
    }, []);

    useEffect(() => {
      const mode = isDarkMode ? "dark" : "light";
      let platformUrl: string | undefined = undefined;

      if (url) {
        platformUrl = `${url}?mode=${mode}`;
      } else if (platformId && validateUUID(platformId)) {
        platformUrl = `https://${platformId}.feedbackland.com?mode=${mode}`;
      }

      setPlatformUrl(platformUrl);
    }, [platformId, isDarkMode, url]);

    return (
      <>
        <div onClick={handleOpen} className={cn("", { dark: isDarkMode })}>
          {children}
        </div>

        {(isMounted || isOpened) &&
          document &&
          createPortal(
            <>
              <div
                onClick={handleClose}
                className={cn(
                  "fl:fixed fl:inset-0 fl:transition-opacity fl:ease-out fl:bg-black/65 fl:z-2147483646 fl:duration-200",
                  {
                    "fl:-z-200 fl:opacity-0": !isOpened,
                  }
                )}
                aria-hidden="true"
              />

              <FocusOn
                enabled={isOpened}
                onClickOutside={handleClose}
                onEscapeKey={handleClose}
                crossFrame={true}
              >
                <div
                  className={cn(
                    "fl:fixed fl:top-0 fl:bottom-0 fl:right-0 fl:w-full fl:h-full fl:max-w-[calc(100vw-40px)] fl:sm:max-w-[600px] fl:z-2147483647 fl:transform fl:transition-transform fl:duration-200 fl:ease-out fl:translate-x-full fl:will-change-transform fl:bg-background fl:border-l fl:border-border",
                    {
                      "fl:top-10000": !isOpened,
                      "fl:overflow-hidden fl:-z-100": !isOpened,
                      "fl:translate-x-0": isOpened,
                      dark: isDarkMode,
                    }
                  )}
                >
                  <div className="fl:w-full fl:h-full fl:relative">
                    <iframe
                      src={platformUrl}
                      className={cn(
                        "fl:w-full fl:h-full fl:overflow-hidden fl:border-0 fl:border-none fl:outline-none fl:ring-0 fl:shadow-none fl:m-0 fl:p-0"
                      )}
                      loading="eager"
                      allow="clipboard-write 'src'"
                      title="Share your feedback"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="Feedback board"
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
