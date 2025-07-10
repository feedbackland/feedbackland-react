"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { WindowMessenger, connect } from "penpal";
import { isMobileOnly } from "react-device-detect";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OverlayWidget = memo(
  ({
    id,
    mode = "dark",
    children,
    className,
  }: {
    id: string;
    mode?: "dark" | "light";
    children: React.ReactNode;
    className?: React.ComponentProps<"div">["className"];
  }) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showIframe, setShowIframe] = useState(false);
    const [subdomain, setSubdomain] = useState<string | null>(null);
    const [colorMode, setColorMode] = useState(mode);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      if (!id || !showIframe) return;

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
    }, [id, showIframe]);

    useEffect(() => {
      const originalBodyOverflow = document?.body?.style?.overflow || "";
      document.body.style.overflow = isOpen ? "hidden" : originalBodyOverflow;

      return () => {
        document.body.style.overflow = originalBodyOverflow;
      };
    }, [isOpen]);

    useEffect(() => {
      if (!subdomain || !showIframe || !iframeRef.current) return;

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
        },
      });

      return () => {
        connection.destroy();
        messenger.destroy();
      };
    }, [subdomain, showIframe]);

    const open = () => {
      setShowIframe(true);
      timeoutRef.current = setTimeout(() => setIsOpen(true), 200);
    };

    const close = () => {
      setIsOpen(false);
      setShowIframe(false);
      setColorMode(mode);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const onButtonHover = () => {
      setShowIframe(true);
    };

    if (isMobileOnly) {
      return (
        <a
          href={`https://${id}.feedbackland.com?mode=${mode}`}
          className={cn("inline-flex", className)}
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
          className={cn("inline-flex", className)}
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
                  className={cn(
                    "fixed inset-0 bg-black/80 z-2147483644 transition-opacity duration-200 ease-out backdrop-blur-xs"
                  )}
                  aria-hidden="true"
                ></div>
              )}

              <div
                className={cn(
                  "fixed top-0 bottom-0 right-0 w-screen sm:w-[580px] xl:w-[680px] 2xl:w-[700px] bg-white z-2147483645 transform transition-transform duration-200 ease-out overflow-y-auto overscroll-contain ",
                  isOpen ? "translate-x-0" : "translate-x-full",
                  colorMode === "dark" &&
                    "bg-[#0A0A0A] border-l-1 border-l-white/10"
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="Feedback board"
              >
                <div className="relative w-full h-full">
                  <iframe
                    ref={iframeRef}
                    title="Share your feedback"
                    src={
                      !!(showIframe && subdomain)
                        ? `https://${subdomain}.feedbackland.com?mode=${mode}`
                        : undefined
                    }
                    className="absolute top-0 left-0 w-full h-full border-none z-10"
                    allow="clipboard-write 'src'"
                  />

                  <button
                    onClick={close}
                    onTouchEnd={close}
                    className={cn(
                      "absolute top-0 left-0 text-black/70 cursor-pointer hover:text-black z-20 size-8 flex items-center justify-center transform translate-z-0",
                      colorMode === "dark" && "text-white/70 hover:text-white"
                    )}
                    aria-label="Close feedback board"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-4"
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
                  </button>
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
