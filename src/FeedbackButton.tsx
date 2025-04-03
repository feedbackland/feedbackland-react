"use client";

import IframeResizer from "@iframe-resizer/react";
import { useState } from "react";

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Button to open the drawer */}
      <button
        onClick={toggleDrawer}
        className=" px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        {isOpen ? "Close Drawer" : "Open Drawer"}
      </button>

      {/* Overlay - visible when drawer is open */}
      {isOpen && (
        <div
          onClick={toggleDrawer} // Close drawer when overlay is clicked
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ease-in-out"
          aria-hidden="true"
        ></div>
      )}

      {/* The Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[700px] bg-white shadow-xl z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title" // You should add an element with this id inside your drawer for accessibility
      >
        {/* Drawer Content */}
        <IframeResizer
          license="GPLv3"
          src="https://1a86a2d8-e4ce-4fc0-a886-0f1bcacbfa6e.feedbackland.com"
          style={{
            width: "700px",
            height: "100vh",
          }}
        />

        {/* <button
            onClick={toggleDrawer}
            className="absolute top-2 right-2 text-black"
            aria-label="Close drawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
          </button> */}
      </div>
    </>
  );
};
