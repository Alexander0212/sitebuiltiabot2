"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ProcessSteps } from "@/components/sections/process-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { processLine } from "@/data/process";
import { meetingOptions } from "@/lib/agent/meeting";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact";

const fieldClassName =
  "h-11 rounded-none border-warm bg-transparent px-3 text-base text-foreground md:text-[0.95rem] transition-colors duration-300 focus-visible:border-foreground focus-visible:ring-3 focus-visible:ring-bronze/35";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      lookingFor: "",
      budget: "",
    },
  });

  const meetingType = watch("meetingType");

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  async function onSubmit(values: ContactFormValues) {
    setSubmitError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setSubmitError(data.error ?? "Не вдалося надіслати запит.");
        return;
      }

      setSubmitted(true);
      reset();
    } catch {
      setSubmitError("Мережа недоступна. Спробуйте ще раз.");
    }
  }

  function sendAnother() {
    setSubmitted(false);
  }

  return (
    <Section id="contact" tone="canvas" className="overflow-x-clip max-md:py-8">
      <Container className="min-w-0">
        <div className="grid min-w-0 gap-6 lg:grid-cols-12 lg:items-stretch">
          <div
            data-reveal-media
            className="relative aspect-[16/10] overflow-hidden lg:col-span-5 lg:aspect-auto lg:min-h-[32rem]"
          >
            <Image
              src="/images/atelier-interior.webp"
              alt="Кабінет NOVA ESTATE на Великій Васильківській"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              quality={85}
              className="hero-photo object-cover will-change-transform"
            />
          </div>

          <div data-reveal="right" className="min-w-0 lg:col-span-7 lg:pl-6">
            <p className="text-eyebrow">06. Запит</p>
            <h2 className="mt-3 font-serif text-[1.7rem] leading-[1.12] md:text-[2.35rem]">
              Одна розмова. Далі короткий список.
            </h2>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
              Оберіть формат: онлайн, телефон або офіс на {site.streetAddress}.
              Відповімо протягом робочого дня.
            </p>
            <ProcessSteps className="mt-6 border-y border-warm py-5" />

            <div className="mt-6">
              {submitted ? (
                <div
                  ref={successRef}
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className="border border-warm bg-background px-5 py-8 outline-none"
                >
                  <p className="text-eyebrow">Заявку відправлено</p>
                  <p className="mt-3 font-serif text-[1.6rem] leading-snug">
                    Дякуємо. Заявку прийнято.
                  </p>
                  <p className="mt-3 text-sm text-ink-soft">
                    Ми зв&apos;яжемось з вами найближчим часом.
                  </p>
                  <Button
                    type="button"
                    variant="brandOutline"
                    size="cta"
                    className="mt-6 max-md:w-full"
                    onClick={sendAnother}
                  >
                    Надіслати ще один запит
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid gap-4"
                  noValidate
                  aria-busy={isSubmitting}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid min-w-0 gap-1.5">
                      <Label
                        htmlFor="contact-name"
                        className="text-[0.75rem] tracking-[0.14em] uppercase"
                      >
                        Ім&apos;я
                      </Label>
                      <Input
                        id="contact-name"
                        autoComplete="name"
                        disabled={isSubmitting}
                        className={fieldClassName}
                        {...register("name")}
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={
                          errors.name ? "contact-name-error" : undefined
                        }
                      />
                      <p
                        id="contact-name-error"
                        role={errors.name ? "alert" : undefined}
                        className="min-h-5 text-sm text-destructive"
                      >
                        {errors.name?.message}
                      </p>
                    </div>
                    <div className="grid min-w-0 gap-1.5">
                      <Label
                        htmlFor="contact-phone"
                        className="text-[0.75rem] tracking-[0.14em] uppercase"
                      >
                        Телефон
                      </Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        disabled={isSubmitting}
                        className={fieldClassName}
                        {...register("phone")}
                        aria-invalid={errors.phone ? true : undefined}
                        aria-describedby={
                          errors.phone ? "contact-phone-error" : undefined
                        }
                      />
                      <p
                        id="contact-phone-error"
                        role={errors.phone ? "alert" : undefined}
                        className="min-h-5 text-sm text-destructive"
                      >
                        {errors.phone?.message}
                      </p>
                    </div>
                  </div>

                  <fieldset className="grid min-w-0 gap-2">
                    <legend className="text-[0.75rem] tracking-[0.14em] uppercase">
                      Як зручніше зустрітись
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {meetingOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            setValue("meetingType", option.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          className={cn(
                            "border px-3 py-3 text-left transition-colors",
                            meetingType === option.value
                              ? "border-foreground bg-background"
                              : "border-warm bg-transparent hover:border-foreground/50",
                          )}
                          aria-pressed={meetingType === option.value}
                        >
                          <span className="block text-[0.8rem] tracking-[0.1em] uppercase">
                            {option.labelUk}
                          </span>
                          <span className="mt-1 block text-[0.8rem] leading-snug text-ink-soft">
                            {option.hintUk}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p
                      role={errors.meetingType ? "alert" : undefined}
                      className="min-h-5 text-sm text-destructive"
                    >
                      {errors.meetingType?.message}
                    </p>
                  </fieldset>

                  <div className="grid min-w-0 gap-1.5">
                    <Label
                      htmlFor="contact-looking-for"
                      className="text-[0.75rem] tracking-[0.14em] uppercase"
                    >
                      Що шукаєте?
                    </Label>
                    <Textarea
                      id="contact-looking-for"
                      rows={3}
                      disabled={isSubmitting}
                      placeholder="Для життя чи під дохід, район, кількість спалень."
                      className={cn(fieldClassName, "min-h-[5.5rem] py-3")}
                      {...register("lookingFor")}
                      aria-invalid={errors.lookingFor ? true : undefined}
                      aria-describedby={
                        errors.lookingFor
                          ? "contact-looking-for-error"
                          : undefined
                      }
                    />
                    <p
                      id="contact-looking-for-error"
                      role={errors.lookingFor ? "alert" : undefined}
                      className="min-h-5 text-sm text-destructive"
                    >
                      {errors.lookingFor?.message}
                    </p>
                  </div>

                  <div className="grid min-w-0 gap-1.5">
                    <Label
                      htmlFor="contact-budget"
                      className="text-[0.75rem] tracking-[0.14em] uppercase"
                    >
                      Бюджет
                    </Label>
                    <Input
                      id="contact-budget"
                      autoComplete="off"
                      disabled={isSubmitting}
                      placeholder="$150 000"
                      className={fieldClassName}
                      {...register("budget")}
                      aria-invalid={errors.budget ? true : undefined}
                      aria-describedby={
                        errors.budget ? "contact-budget-error" : undefined
                      }
                    />
                    <p
                      id="contact-budget-error"
                      role={errors.budget ? "alert" : undefined}
                      className="min-h-5 text-sm text-destructive"
                    >
                      {errors.budget?.message}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="brand"
                    size="cta"
                    disabled={isSubmitting}
                    className="max-md:w-full"
                  >
                    {isSubmitting ? "Надсилаємо…" : "Записатись на підбір"}
                  </Button>
                  {submitError ? (
                    <p role="alert" className="text-sm text-destructive">
                      {submitError}
                    </p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {processLine}
                    <span className="mt-1 block">
                      {site.address} · {site.hours}
                    </span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
