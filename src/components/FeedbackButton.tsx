import IframeResizer from "@iframe-resizer/react";
import { Drawer } from "vaul";

export function FeedbackButton() {
  return (
    <Drawer.Root direction="right">
      <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
        Feedback
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="right-0 top-0 bottom-0 fixed z-10 outline-none w-[600px] flex">
          <div className="bg-black h-full w-full px-10 border-white border flex justify-center">
            <Drawer.Title className="sr-only">
              It supports all directions.
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              This one specifically is not touching the edge of the screen, but
              that&apos;s not required for a side drawer.
            </Drawer.Description>
            <IframeResizer
              license="GPLv3"
              src="https://1a86a2d8-e4ce-4fc0-a886-0f1bcacbfa6e.feedbackland.com"
              style={{
                width: "600px",
                height: "100vh",
                // border: "solid 2px red",
              }}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
