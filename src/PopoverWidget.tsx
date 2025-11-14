"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDarkMode } from "./hooks/use-dark-mode";
import { cn } from "./utils";
import { CircleCheck, InfoIcon, XCircle } from "lucide-react";
import { useState } from "react";
import { useWindowSize } from "react-use";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const formSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Feedback cannot be emtpy.")
    .max(1000, "Feedback must be at most 1000 characters."),
});

export function PopoverWidget({
  platformId,
  url,
  children,
}: {
  platformId: string;
  url?: string;
  children: React.ReactNode;
}) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "active">(
    "active"
  );

  const isDarkMode = useDarkMode();

  const { width } = useWindowSize();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { description } = data;

    if (!description || !platformId) return;

    try {
      setIsPending(true);

      form.clearErrors();

      const response = await fetch(
        "https://api.feedbackland.com/api/feedback/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orgId: platformId,
            description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStatus("success");

      form.reset();
    } catch {
      setStatus("error");
    } finally {
      setIsPending(false);
    }
  }

  const onOpenChange = () => {
    setTimeout(() => {
      setStatus("active");
    }, 100);
  };

  const Inner = (
    <>
      {status === "active" && (
        <div className="fl:space-y-3">
          <form id="feedback-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="feedback-form-description"
                      className="fl:sr-only"
                    >
                      Feedback
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        {...field}
                        id="feedback-form-description"
                        placeholder="Describe your idea, issue, or any other feedback..."
                        rows={6}
                        className="fl:min-h-24 fl:resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <div className="fl:flex fl:items-center fl:justify-between fl:gap-6">
            <div className="fl:flex fl:items-center fl:gap-1.5 fl:text-xs fl:font-normal">
              <InfoIcon className="fl:size-3.5! fl:shrink-0" />
              <span>
                Your feedback will be posted anonymously on our{" "}
                <a
                  href={`https://${platformId}.feedbackland.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fl:underline"
                >
                  feedback board
                </a>
              </span>
            </div>
            <Button
              size="default"
              type="submit"
              form="feedback-form"
              className=""
              loading={isPending}
            >
              Send
            </Button>
          </div>
        </div>
      )}

      {status === "success" && (
        <div className="fl:flex fl:flex-col fl:items-stretch fl:text-center fl:px-6 fl:py-6">
          <CircleCheck className="fl: fl:mx-auto fl:size-8! fl:shrink-0 fl:mb-3 fl:text-green-700" />
          <div className="fl:text-base fl:font-semibold fl:mb-2">
            Feedback received. Thank you!
          </div>
          <a
            href={`https://${platformId}.feedbackland.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="fl:underline fl:text-sm fl:font-normal"
          >
            Visit the feedback board
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="fl:flex fl:flex-col fl:items-stretch fl:text-center fl:px-6 fl:py-6">
          <XCircle className="fl: fl:mx-auto fl:size-8! fl:shrink-0 fl:mb-3 fl:text-red-700" />
          <div className="fl:text-base fl:font-semibold fl:mb-2">
            Something went wrong
          </div>
          <div className="fl:text-sm fl:font-normal">
            Your feedback could not be sent. Please try again later.
          </div>
        </div>
      )}
    </>
  );

  if (width > 768) {
    return (
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger asChild className={cn("", { dark: isDarkMode })}>
          {children}
        </PopoverTrigger>
        <PopoverContent className={cn("fl:w-[500px]", { dark: isDarkMode })}>
          {Inner}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button>Feedback</Button>
      </DrawerTrigger>
      <DrawerContent className="fl:p-4">
        <DrawerHeader className="fl:sr-only">
          <DrawerTitle>Submit your feedback</DrawerTitle>
          <DrawerDescription>
            Describe your idea, issue, or any other feedback below.
          </DrawerDescription>
        </DrawerHeader>
        {Inner}
      </DrawerContent>
    </Drawer>
  );
}

PopoverWidget.displayName = "PopoverWidget";
