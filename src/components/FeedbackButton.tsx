import IframeResizer from "@iframe-resizer/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function FeedbackButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Feedback</Button>
      </SheetTrigger>
      <SheetContent className="w-[600px]! max-w-[600px]!">
        <SheetHeader className="sr-only">
          <SheetTitle className="sr-only">Lorem ipsum</SheetTitle>
          <SheetDescription className="sr-only">Lorem ipsum</SheetDescription>
        </SheetHeader>
        <div className="">
          <IframeResizer
            license="GPLv3"
            src="https://1a86a2d8-e4ce-4fc0-a886-0f1bcacbfa6e.feedbackland.com"
            style={{
              width: "600px",
              height: "100vh",
            }}
          />
        </div>
        {/* <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
