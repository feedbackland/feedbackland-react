import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { FeedbackButton } from "./FeedbackButton";

const platformId = "987637fb-7ca1-4bd6-b608-cc416db75788";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="fl:h-screen fl:w-screen fl:flex fl:gap-3 fl:bg-black">
      <FeedbackButton
        platformId={platformId}
        url="http://localhost:3000/zolg1"
        widget="drawer"
      >
        Feedback
      </FeedbackButton>
      <FeedbackButton platformId={platformId} widget="link">
        Feedback
      </FeedbackButton>
      <FeedbackButton platformId={platformId} widget="popover">
        Feedback
      </FeedbackButton>
    </div>
  </React.StrictMode>
);
