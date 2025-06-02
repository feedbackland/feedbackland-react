"use client";

import { IframeResizer } from "@open-iframe-resizer/react";
import React, { useEffect, useState } from "react";

export const InlineWidget = ({
  id,
  mode = "light",
}: {
  id: string;
  mode?: "dark" | "light";
  children: React.ReactNode;
}) => {
  const [subdomain, setSubdomain] = useState<string | null>(null);

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

  if (subdomain) {
    return (
      <IframeResizer
        width="100%"
        src={`https://${subdomain}.feedbackland.com${mode && `?mode=${mode}`}`}
      />
    );
  }

  return null;
};
