"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { WindowMessenger, connect } from "penpal";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const OverlayWidget = ({
  id,
  mode = "light",
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
  }, [isMounted]);

  useEffect(() => {
    setColorMode(mode);
  }, [mode]);

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
    setColorMode(mode);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 200);
  };

  const close = () => {
    setIsOpen(false);
    setShowIframe(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const onButtonHover = () => {
    setShowIframe(true);
  };

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
                  "fixed inset-0 bg-black/80 z-2147483645 transition-opacity duration-200 ease-out backdrop-blur-xs"
                )}
                aria-hidden="true"
              ></div>
            )}

            <div
              className={cn(
                "fixed top-0 bottom-0 right-0 w-full sm:w-[680px] 2xl:w-[700px] bg-white z-2147483646 transform transition-transform duration-200 ease-out overflow-y-auto overscroll-contain ",
                isOpen ? "translate-x-0" : "translate-x-full",
                colorMode === "dark" &&
                  "bg-[#0A0A0A] border-l-1 border-l-white/10"
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="Feedback board"
            >
              {!!(showIframe && subdomain) && (
                <iframe
                  ref={iframeRef}
                  title="Share your feedback"
                  src={`https://${subdomain}.feedbackland.com${
                    mode && `?mode=${mode}`
                  }`}
                  className="absolute top-0 left-0 w-full h-full border-none"
                  allow="clipboard-write 'src'"
                />
              )}

              <button
                onClick={close}
                className={cn(
                  "absolute top-1.5 left-1.5 text-white/70 cursor-pointer hover:text-white z-100  rounded-[4px] size-4.5 flex items-center justify-center",
                  colorMode === "light" && "text-black/70 hover:text-black"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
};
