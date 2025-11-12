import { FeedbackButton } from "./FeedbackButton";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { PopoverWidget } from "./PopoverWidget";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "black",
      }}
    >
      <FeedbackButton platformId="cc10380b-6f5f-41fc-b28b-4000c021bc3b">
        Feedback
      </FeedbackButton>

      <div className="p-10">
        <PopoverWidget />
      </div>
    </div>
  </React.StrictMode>
);
