"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WindowMessenger, connect } from "penpal";
import { isMobileOnly } from "react-device-detect";
import { cn, validateUUID } from "./utils";
import { FocusOn } from "react-focus-on";

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
    // const modalRef = useRef<HTMLIFrameElement | null>(null);
    // const { dialogProps } = useDialog(
    //   { "aria-labelledby": "Feedback board" },
    //   modalRef
    // );
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    // const [isClaimed, setIsClaimed] = useState(true);
    // const [showIframe, setShowIframe] = useState(true);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [colorMode, setColorMode] = useState(mode);
    const [platformUrl, setPlatformUrl] = useState<string | undefined>(
      undefined
    );

    // usePreventScroll({ isDisabled: !isOpen });

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

    useEffect(() => {
      if (!platformUrl) return;

      const origin = new URL(platformUrl).origin;
      const selector = `link[rel="dns-prefetch"][href="${origin}"]`;
      const existingLink = document.head.querySelector(selector);

      if (existingLink) return;

      // Add DNS prefetch
      const dnsPrefetch = document.createElement("link");
      dnsPrefetch.rel = "dns-prefetch";
      dnsPrefetch.href = origin;
      document.head.appendChild(dnsPrefetch);

      return () => {
        document.head.removeChild(dnsPrefetch);
      };
    }, [platformUrl]);

    useEffect(() => {
      if (!platformUrl) return;

      const origin = new URL(platformUrl).origin;
      const selector = `link[rel="preconnect"][href="${origin}"]`;
      const existingLink = document.head.querySelector(selector);

      if (existingLink) return;

      // Add preconnect
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = origin;
      preconnect.crossOrigin = "anonymous";
      document.head.appendChild(preconnect);

      return () => {
        document.head.removeChild(preconnect);
      };
    }, [platformUrl]);

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
            setLoaded: (loaded: boolean) => {
              setIframeLoaded(loaded);
            },
            setIsClaimed: (/* isClaimed: boolean */) => {
              // setIsClaimed(isClaimed);
            },
          },
        });

        return () => {
          connection.destroy();
          messenger.destroy();
        };
      }
    }, [subdomain, url /* , showIframe */]);

    const open = () => {
      // setShowIframe(true);
      // setTimeout(() => setIsOpen(true), 250);

      setIsOpen(true);
    };

    const close = () => {
      setIsOpen(false);

      // setTimeout(() => {
      //   setShowIframe(false);
      //   setIframeLoaded(false);
      //   setColorMode(mode);
      // }, 250);

      setColorMode(mode);
    };

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
                  className="feedbackland:fixed feedbackland:inset-0 feedbackland:transition-opacity feedbackland:ease-out feedbackland:bg-black/70 feedbackland:z-2147483646 feedbackland:duration-250 feedbackland:backdrop-blur-xs"
                  aria-hidden="true"
                ></div>
              )}

              <FocusOn
                enabled={isOpen}
                onClickOutside={close}
                onEscapeKey={close}
              >
                <div
                  className={cn(
                    "feedbackland:isolate feedbackland:fixed feedbackland:top-0 feedbackland:bottom-0 feedbackland:right-0 feedbackland:w-screen feedbackland:sm:w-[580px] feedbackland:xl:w-[600px] feedbackland:bg-[#0A0A0A] feedbackland:border-l-white/8 feedbackland:border-l-1 feedbackland:z-2147483647 feedbackland:transform feedbackland:transition-transform feedbackland:duration-250 feedbackland:ease-out feedbackland:overflow-y-auto feedbackland:overscroll-contain feedbackland:translate-x-full",
                    {
                      "feedbackland:translate-x-0": isOpen,
                      "feedbackland:bg-white": colorMode === "light",
                    }
                  )}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="Feedback board"
                >
                  <div className="feedbackland:relative feedbackland:w-full feedbackland:h-full">
                    {isValidID && (
                      <iframe
                        ref={iframeRef}
                        title="Share your feedback"
                        src={platformUrl}
                        // src={showIframe && platformUrl ? platformUrl : undefined}
                        loading="lazy"
                        allow="clipboard-write 'src'"
                        // @ts-expect-error allowtransparency
                        allowtransparency="true"
                        className={cn(
                          "feedbackland:absolute feedbackland:top-0 feedbackland:left-0 feedbackland:w-full feedbackland:h-full feedbackland:border-none feedbackland:bg-transparent",
                          {
                            "feedbackland:opacity-0": !iframeLoaded,
                          }
                        )}
                      />
                    )}

                    {!isValidID && (
                      <div className="feedbackland:w-full feedbackland:h-full feedbackland:flex feedbackland:flex-col feedbackland:items-center feedbackland:justify-center feedbackland:text-red-700 feedbackland:text-[16px] feedbackland:p-5">
                        <div className="feedbackland:mb-2 feedbackland:text-center ">
                          The platformId is missing or incorrect. Please use a
                          valid UUID v4.
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

                    <button
                      aria-label="Close"
                      type="button"
                      className={cn(
                        "feedbackland:absolute feedbackland:top-0.5 feedbackland:left-0.5 feedbackland:z-10 feedbackland:flex feedbackland:items-center feedbackland:justify-center feedbackland:size-5 feedbackland:text-white/70 feedbackland:hover:text-white feedbackland:font-sans feedbackland:text-[20px] feedbackland:font-normal feedbackland:border-none feedbackland:bg-transparent feedbackland:cursor-pointer",
                        {
                          "feedbackland:text-black/70 feedbackland:hover:text-black":
                            colorMode === "light",
                        }
                      )}
                      onClick={close}
                      onTouchEnd={close}
                    >
                      <span aria-hidden="true">&times;</span>
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
