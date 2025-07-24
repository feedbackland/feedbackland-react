"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { WindowMessenger, connect } from "penpal";
import { isMobileOnly } from "react-device-detect";
import { version as uuidVersion } from "uuid";
import { validate as uuidValidate } from "uuid";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function validateUUID(uuid: string) {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

const getPlatformUrl = ({
  id,
  subdomain,
  url,
  mode = "dark",
}: {
  id: string;
  subdomain: string | null;
  url?: string;
  mode?: "dark" | "light";
}) => {
  if (url) {
    return `${url}?mode=${mode}`;
  } else if (isMobileOnly && validateUUID(id)) {
    return `https://${id}.feedbackland.com?mode=${mode}`;
  } else if (subdomain) {
    return `https://${subdomain}.feedbackland.com?mode=${mode}`;
  }

  return null;
};

export const OverlayWidget = memo(
  ({
    id,
    url,
    mode = "dark",
    children,
    className,
  }: {
    id: string;
    url?: string;
    mode?: "dark" | "light";
    children: React.ReactNode;
    className?: React.ComponentProps<"div">["className"];
  }) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showIframe, setShowIframe] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [colorMode, setColorMode] = useState(mode);
    const [platformUrl, setPlatformUrl] = useState<string | null>(null);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      const platformUrl = getPlatformUrl({
        id,
        subdomain,
        url,
        mode,
      });

      setPlatformUrl(platformUrl);
    }, [id, mode, subdomain, url]);

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
      if (!id || url || subdomain || !showIframe || !validateUUID(id)) return;

      const fetchSubdomain = async () => {
        try {
          const response = await fetch(
            `https://api.feedbackland.com/api/org/upsert-org`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ orgId: id }),
            }
          );

          const orgSubdomain: string = await response.json();

          setSubdomain(orgSubdomain);
        } catch (error) {
          console.error("Error fetching subdomain:", error);
        }
      };

      fetchSubdomain();
    }, [id, url, showIframe, subdomain]);

    useEffect(() => {
      if (!isOpen) return;

      const originalBodyOverflow = document?.body?.style?.overflow || "";
      document.body.style.overflow = isOpen ? "hidden" : originalBodyOverflow;

      return () => {
        document.body.style.overflow = originalBodyOverflow;
      };
    }, [isOpen]);

    useEffect(() => {
      if (!!(url || subdomain) && showIframe && iframeRef.current) {
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
          },
        });

        return () => {
          connection.destroy();
          messenger.destroy();
        };
      }
    }, [subdomain, url, showIframe]);

    const open = () => {
      setShowIframe(true);
      setTimeout(() => setIsOpen(true), 250);
    };

    const close = () => {
      setIsOpen(false);

      setTimeout(() => {
        setShowIframe(false);
        setIframeLoaded(false);
        setColorMode(mode);
      }, 250);
    };

    const onButtonHover = () => {
      setShowIframe(true);
    };

    const isValidID = validateUUID(id);

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
          onMouseEnter={onButtonHover}
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

              <div
                className={cn(
                  "feedbackland:isolate feedbackland:fixed feedbackland:top-0 feedbackland:bottom-0 feedbackland:right-0 feedbackland:w-screen feedbackland:sm:w-[580px] feedbackland:xl:w-[680px] feedbackland:2xl:w-[700px] feedbackland:bg-[#0A0A0A] feedbackland:border-l-white/10 feedbackland:border-l-1 feedbackland:z-2147483647 feedbackland:transform feedbackland:transition-transform feedbackland:duration-250 feedbackland:ease-out feedbackland:overflow-y-auto feedbackland:overscroll-contain feedbackland:translate-x-full",
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
                      src={showIframe && platformUrl ? platformUrl : undefined}
                      className={cn(
                        "feedbackland:absolute feedbackland:top-0 feedbackland:left-0 feedbackland:w-full feedbackland:h-full feedbackland:border-none feedbackland:bg-transparent",
                        {
                          "feedbackland:opacity-0": !iframeLoaded,
                        }
                      )}
                      allow="clipboard-write 'src'"
                      // @ts-expect-error allowtransparency
                      allowtransparency="true"
                    />
                  )}

                  {!isValidID && (
                    <div className="feedbackland:w-full feedbackland:h-full feedbackland:flex feedbackland:flex-col feedbackland:items-center feedbackland:justify-center feedbackland:text-red-700 feedbackland:text-[16px] feedbackland:p-5">
                      <div className="feedbackland:mb-2 feedbackland:text-center ">
                        The ID is missing or incorrect. Please use a valid UUID
                        v4 as ID.
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

                  <div className="feedbackland:absolute feedbackland:top-0 feedbackland:left-0 feedbackland:z-10 feedbackland:flex feedbackland:items-center feedbackland:justify-center feedbackland:size-8">
                    <button
                      onClick={close}
                      onTouchEnd={close}
                      style={{ all: "unset" }}
                      aria-label="Close feedback board"
                    >
                      <span
                        className={cn(
                          "feedbackland:text-white/70 feedbackland:cursor-pointer feedbackland:hover:text-white feedbackland:size-8 feedbackland:flex feedbackland:items-center feedbackland:justify-center",
                          {
                            "feedbackland:text-black/70 feedbackland:hover:text-black":
                              colorMode === "light",
                          }
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="feedbackland:size-4"
                          fill="none"
                          viewBox="0 0 25 25"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
      </>
    );
  }
);

OverlayWidget.displayName = "OverlayWidget";
