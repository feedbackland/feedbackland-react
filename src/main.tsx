import { FeedbackButton } from "./FeedbackButton";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <FeedbackButton
      platformId="cc10380b-6f5f-41fc-b28b-4000c021bc3b"
      mode="light" // optional, color mode of the widget, 'light' or 'dark'
      button={<button>Feedback</button>} // optional, bring your own button
    />
  </React.StrictMode>
);
