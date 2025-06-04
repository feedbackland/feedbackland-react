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
}: {
  id: string;
  mode?: "dark" | "light";
  children: React.ReactNode;
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isIframePreloaded, setisIframePreloaded] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState(mode);

  useEffect(() => {
    const originalBodyOverflow = document?.body?.style?.overflow || "";

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalBodyOverflow;
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!id) {
      return;
    }

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
  }, [id]);

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);

  useEffect(() => {
    if (subdomain && isOpen) {
      if (!iframeRef.current) return;

      const messenger = new WindowMessenger({
        remoteWindow: iframeRef.current.contentWindow!,
        allowedOrigins: ["*"],
      });

      const connection = connect({
        messenger,
        methods: {
          setColorMode: (colorMode: "light" | "dark") => {
            console.log(colorMode);
            setColorMode(colorMode);
          },
        },
      });

      return () => {
        connection.destroy();
      };
    }
  }, [isOpen, subdomain]);

  const open = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 300);
  };

  const close = () => {
    setIsOpen(false);
    setisIframePreloaded(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const url = `https://${subdomain}.feedbackland.com${mode && `?mode=${mode}`}`;
  // const url = `http://localhost:3000/${subdomain}${mode && `?mode=${mode}`}`;

  return (
    <>
      <div
        onClick={open}
        onMouseEnter={() => {
          setisIframePreloaded(true);
        }}
        className="inline-flex"
      >
        {children}
      </div>

      {isMounted &&
        createPortal(
          <>
            {isOpen && (
              <div
                onClick={close} // Close drawer when overlay is clicked
                className={cn(
                  "fixed inset-0 bg-black/40 z-2147483645 transition-opacity duration-300 ease-in-out"
                )}
                aria-hidden="true"
              ></div>
            )}

            <div
              className={cn(
                "fixed top-0 bottom-0 right-0 w-[680px] bg-white z-2147483646 transform transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain",
                isOpen ? "translate-x-0" : "translate-x-full",
                colorMode === "dark" && "bg-[#0A0A0A]"
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
            >
              {!!((isOpen || isIframePreloaded) && subdomain) && (
                <iframe
                  ref={iframeRef}
                  title="Share your feedback"
                  src={url}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              )}

              <button
                onClick={close}
                className={cn(
                  "absolute top-1.5 left-1.5 text-white cursor-pointer hover:text-white",
                  colorMode === "light" && "text-black hover:text-black"
                )}
                aria-label="Close drawer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
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
          document?.body
        )}
    </>
  );
};
