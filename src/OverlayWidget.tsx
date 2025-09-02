"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WindowMessenger, connect } from "penpal";
import { isMobileOnly } from "react-device-detect";
import { useScrollLock } from "./hooks/use-scroll-lock";
import { cn, validateUUID } from "./utils";
import FocusLock from "react-focus-lock";

const getPlatformUrl = ({
  platformId,
  subdomain,
  url,
  mode,
}: {
  platformId: string;
  subdomain: string | null;
  url?: string;
  mode: "dark" | "light";
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
    const [isOpen, setIsOpen] = useState(false);
    const [isIframeLoaded, setIframeLoaded] = useState(false);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [platformUrl, setPlatformUrl] = useState<string | undefined>(
      undefined
    );

    const handleOpen = () => {
      if (platformUrl) {
        setIsOpen(true);

        setTimeout(() => {
          setIframeLoaded(true);
        }, 50);
      }
    };

    const handleClose = useCallback(() => {
      setIframeLoaded(false);
      setIsOpen(false);
    }, []);

    useScrollLock(isIframeLoaded);

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
      if (!platformId || !validateUUID(platformId) || url || subdomain) return;

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
    }, [platformId, url, subdomain]);

    useEffect(() => {
      if (isIframeLoaded && iframeRef.current) {
        const messenger = new WindowMessenger({
          remoteWindow: iframeRef.current.contentWindow!,
          allowedOrigins: ["*"],
        });

        const connection = connect({
          messenger,
          methods: {
            close: () => {
              handleClose();
            },
          },
        });

        return () => {
          connection.destroy();
        };
      }
    }, [isIframeLoaded, handleClose]);

    // const isValidID = validateUUID(platformId);

    // if (isMobileOnly && isValidID && platformUrl) {
    //   return (
    //     <a
    //       href={platformUrl}
    //       className={cn("", className)}
    //       style={{ all: "unset" }}
    //     >
    //       {children}
    //     </a>
    //   );
    // }

    return (
      <>
        <div onClick={handleOpen} className={cn("", className)}>
          {children}
        </div>

        {isOpen &&
          createPortal(
            <>
              <div
                onClick={handleClose}
                className={cn(
                  "fl:fixed fl:inset-0 fl:transition-opacity fl:ease-out fl:bg-black/60 fl:z-2147483646 fl:duration-250",
                  {
                    "fl:opacity-0": !isIframeLoaded,
                  }
                )}
                aria-hidden="true"
              />

              <FocusLock crossFrame={true}>
                <iframe
                  ref={iframeRef}
                  src={platformUrl}
                  className={cn(
                    "fl:fixed fl:top-0 fl:bottom-0 fl:right-0 fl:w-full fl:h-full fl:max-w-[calc(100vw-40px)] fl:sm:max-w-[600px] fl:z-2147483647 fl:transform fl:transition-transform fl:duration-250 fl:ease-in-out fl:translate-x-full fl:will-change-transform fl:overflow-hidden fl:border-0 fl:border-none fl:outline-none fl:ring-0 fl:shadow-none fl:m-0 fl:p-0 fl:bg-white",
                    {
                      "fl:translate-x-0": isIframeLoaded,
                      "fl:bg-black": mode === "dark",
                    }
                  )}
                  // onLoad={() => {
                  //   setIframeLoaded(true);
                  // }}
                  allow="clipboard-write 'src'"
                  title="Share your feedback"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="Feedback board"
                  frameBorder="0" // For older browsers
                />
              </FocusLock>
            </>,
            document.body
          )}
      </>
    );
  }
);

OverlayWidget.displayName = "OverlayWidget";
