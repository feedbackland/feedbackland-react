"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WindowMessenger, connect } from "penpal";
import { isMobileOnly } from "react-device-detect";
import { useScrollLock } from "./hooks/use-scroll-lock";
import { cn, validateUUID } from "./utils";
// import { X } from "lucide-react";
import FocusLock from "react-focus-lock";
// import { useFocusLock } from "./hooks/use-focus-lock";

const getPlatformUrl = ({
  platformId,
  subdomain,
  url,
  mode = "dark",
}: {
  platformId: string;
  subdomain: string | null;
  url?: string;
  mode?: "dark" | "light";
}) => {
  let platformUrl: string | undefined = undefined;

  if (url) {
    platformUrl = `${url}?mode=${mode}`;
  } else if (isMobileOnly && validateUUID(platformId)) {
    platformUrl = `https://${platformId}.feedbackland.com?mode=${mode}`;
  } else if (subdomain) {
    platformUrl = `https://${subdomain}.feedbackland.com?mode=${mode}`;
  }

  return platformUrl;
};

export const OverlayWidget = memo(
  ({
    platformId,
    url,
    mode = "dark",
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
    const modalRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    // const [isClaimed, setIsClaimed] = useState(true);
    // const [showIframe, setShowIframe] = useState(true);
    // const [iframeLoaded, setIframeLoaded] = useState(false);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [colorMode, setColorMode] = useState(mode);
    const [platformUrl, setPlatformUrl] = useState<string | undefined>(
      undefined
    );

    const open = () => {
      // setShowIframe(true);
      // setTimeout(() => setIsOpen(true), 250);

      setIsOpen(true);
    };

    const close = useCallback(() => {
      setIsOpen(false);

      // setTimeout(() => {
      //   setShowIframe(false);
      //   setIframeLoaded(false);
      //   setColorMode(mode);
      // }, 250);

      setColorMode(mode);
    }, [mode]);

    useScrollLock(isOpen);

    // useFocusLock(modalRef as React.RefObject<HTMLDivElement>, {
    //   enabled: isOpen,
    // });

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      const platformUrl = getPlatformUrl({
        platformId,
        subdomain,
        url,
        mode,
      });

      setPlatformUrl(platformUrl);
    }, [platformId, mode, subdomain, url]);

    // useEffect(() => {
    //   if (!platformUrl) return;

    //   const origin = new URL(platformUrl).origin;
    //   const selector = `link[rel="dns-prefetch"][href="${origin}"]`;
    //   const existingLink = document.head.querySelector(selector);

    //   if (existingLink) return;

    //   // Add DNS prefetch
    //   const dnsPrefetch = document.createElement("link");
    //   dnsPrefetch.rel = "dns-prefetch";
    //   dnsPrefetch.href = origin;
    //   document.head.appendChild(dnsPrefetch);

    //   return () => {
    //     document.head.removeChild(dnsPrefetch);
    //   };
    // }, [platformUrl]);

    // useEffect(() => {
    //   if (!platformUrl) return;

    //   const origin = new URL(platformUrl).origin;
    //   const selector = `link[rel="preconnect"][href="${origin}"]`;
    //   const existingLink = document.head.querySelector(selector);

    //   if (existingLink) return;

    //   // Add preconnect
    //   const preconnect = document.createElement("link");
    //   preconnect.rel = "preconnect";
    //   preconnect.href = origin;
    //   preconnect.crossOrigin = "anonymous";
    //   document.head.appendChild(preconnect);

    //   return () => {
    //     document.head.removeChild(preconnect);
    //   };
    // }, [platformUrl]);

    useEffect(() => {
      if (
        !platformId ||
        !validateUUID(platformId) ||
        url ||
        subdomain
        // || !showIframe
      )
        return;

      const fetchSubdomain = async () => {
        try {
          const response = await fetch(
            `https://api.feedbackland.com/api/org/upsert-org`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orgId: platformId }),
            }
          );

          const orgSubdomain: string = await response.json();

          setSubdomain(orgSubdomain);
        } catch (error) {
          console.error("Error fetching subdomain:", error);
        }
      };

      fetchSubdomain();
    }, [platformId, url, /* showIframe, */ subdomain]);

    useEffect(() => {
      if (!!(url || subdomain) /* && showIframe */ && iframeRef.current) {
        const messenger = new WindowMessenger({
          remoteWindow: iframeRef.current.contentWindow!,
          allowedOrigins: ["*"],
        });

        const connection = connect({
          messenger,
          methods: {
            setColorMode: (colorMode: "light" | "dark") => {
              setColorMode(colorMode);
            },
            setLoaded: (/* loaded: boolean */) => {
              // setIframeLoaded(loaded);
            },
            close: () => {
              close();
            },
          },
        });

        return () => {
          connection.destroy();
          messenger.destroy();
        };
      }
    }, [subdomain, url, close /* , showIframe */]);

    // const onButtonHover = () => {
    //   // setShowIframe(true);
    // };

    const isValidID = validateUUID(platformId);

    if (isMobileOnly && isValidID && platformUrl) {
      return (
        <a
          href={platformUrl}
          className={cn("", className)}
          style={{ all: "unset" }}
        >
          {children}
        </a>
      );
    }

    return (
      <>
        <div
          onClick={open}
          className={cn("", className)}
          // onMouseEnter={onButtonHover}
        >
          {children}
        </div>

        {isMounted &&
          document &&
          createPortal(
            <>
              {isOpen && (
                <div
                  onClick={close}
                  className="feedbackland:fixed feedbackland:inset-0 feedbackland:transition-opacity feedbackland:ease-out feedbackland:bg-black/80 feedbackland:z-2147483646 feedbackland:duration-250 feedbackland:backdrop-blur-xs"
                  aria-hidden="true"
                ></div>
              )}

              <FocusLock disabled={!isOpen} crossFrame={true}>
                <div
                  className={cn(
                    "feedbackland:isolate feedbackland:fixed feedbackland:top-0 feedbackland:bottom-0 feedbackland:right-0 feedbackland:w-full feedbackland:max-w-[calc(100vw-16px)] feedbackland:sm:max-w-[600px] feedbackland:bg-[#0A0A0A] feedbackland:border-white/20 feedbackland:border-l-1 feedbackland:z-2147483647 feedbackland:transform feedbackland:transition-transform feedbackland:duration-250 feedbackland:ease-out feedbackland:translate-x-full feedbackland:will-change-auto feedbackland:overflow-hidden",
                    {
                      "feedbackland:w-0": !isOpen,
                      "feedbackland:opacity-0": !isOpen,
                      "feedbackland:pointer-events-none": !isOpen,
                      "feedbackland:z-[-2147483646]": !isOpen,
                      "feedbackland:translate-x-0": isOpen,
                      "feedbackland:bg-white": colorMode === "light",
                    }
                  )}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="Feedback board"
                >
                  <div
                    className="feedbackland:relative feedbackland:w-full feedbackland:h-full"
                    ref={modalRef}
                  >
                    {/* <button
                      aria-label="Close"
                      type="button"
                      className={cn(
                        "feedbackland:absolute feedbackland:top-2 feedbackland:right-2 feedbackland:z-50 feedbackland:flex feedbackland:size-7 feedbackland:shrink-0 feedbackland:items-center feedbackland:justify-center feedbackland:text-white/70 feedbackland:hover:text-white feedbackland:font-sans feedbackland:text-[21px] feedbackland:font-normal feedbackland:border-none feedbackland:hover:bg-white/10 feedbackland:rounded-full feedbackland:cursor-pointer",
                        {
                          "feedbackland:text-black/70 feedbackland:hover:text-black":
                            colorMode === "light",
                        }
                      )}
                      onClick={close}
                    >
                      <X className="feedbackland:size-4! feedbackland:shrink-0!" />
                    </button> */}

                    {isValidID && (
                      <iframe
                        ref={iframeRef}
                        title="Share your feedback"
                        src={platformUrl}
                        // src={showIframe && platformUrl ? platformUrl : undefined}
                        className={cn(
                          "feedbackland:absolute feedbackland:top-0 feedbackland:left-0 feedbackland:w-full feedbackland:h-full feedbackland:border-none feedbackland:bg-transparent",
                          {
                            "feedbackland:hidden": !isOpen,
                            "feedbackland:block": isOpen,
                            // "feedbackland:opacity-0": !iframeLoaded,
                          }
                        )}
                        allow="clipboard-write 'src'"
                        // @ts-expect-error allowtransparency
                        allowtransparency="true"
                      />
                    )}

                    {!isValidID && (
                      <div className="feedbackland:w-full feedbackland:h-full feedbackland:flex feedbackland:flex-col feedbackland:items-center feedbackland:justify-center feedbackland:text-red-700 feedbackland:text-base feedbackland:not-[]:eedbackland:p-5">
                        <div className="feedbackland:mb-2 feedbackland:text-center ">
                          The ID is missing or incorrect. Please use a valid
                          UUID v4 as ID.
                        </div>
                        <a
                          className="feedbackland:text-center feedbackland:underline"
                          href="https://www.uuidtools.com/v4"
                          target="_blank"
                        >
                          Generate your UUID v4
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </FocusLock>
            </>,
            document.body
          )}
      </>
    );
  }
);

OverlayWidget.displayName = "OverlayWidget";
