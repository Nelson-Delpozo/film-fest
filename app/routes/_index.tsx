// app/routes/_index.tsx
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";

import { createRespondent, getRespondentByEmail } from "~/models/respondent.server";
import { validateEmail } from "~/utils";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!email || typeof email !== "string" || !validateEmail(email)) {
    return json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  // Check if the email already exists in the database
  const existingRespondent = await getRespondentByEmail(email);
  if (existingRespondent) {
    return json({ message: "You're already signed up!" });
  }

  // Save the email to the database
  await createRespondent(email);

  return json({ success: "Thank you for signing up!" });
};

export default function LandingPage() {
  const targetDate = new Date("2025-12-01T10:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const actionData = useActionData<{ error?: string; success?: string; message?: string }>();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (actionData?.error) {
      emailRef.current?.focus();
    }
  }, [actionData]);

  function calculateTimeLeft() {
    const difference = targetDate - new Date().getTime();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-600 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">MNFF</h1>
        <h2 className="text-xl font-light">this one&apos;s gonna hit different</h2>
      </header>

      <div className="text-3xl font-semibold mb-6 text-center">
        {timeLeft ? (
          <div>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>
        ) : (
          <div>it&apos;s on come join us</div>
        )}
      </div>

      {/* Email Sign-up Form */}
      <div className="w-full max-w-xs md:max-w-md text-center mt-6 px-4">
        {actionData?.success ? (
          <p className="text-lg font-semibold text-yellow-500">
            {actionData.success}
          </p>
        ) : actionData?.message ? (
          <p className="text-lg font-semibold text-yellow-500">
            {actionData.message}
          </p>
        ) : (
          <>
            <h3 className="text-lg font-medium mb-4">
              Sign up for email updates and don&apos;t miss a thing
            </h3>
            <Form method="post" className="space-y-4">
              <div>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded border border-gray-500 px-3 py-2 text-black"
                  aria-invalid={actionData?.error ? true : undefined}
                  aria-describedby="email-error"
                />
                {actionData?.error ? <p className="mt-1 text-red-500" id="email-error">
                    {actionData.error}
                  </p> : null}
              </div>
              <button
                type="submit"
                className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Sign Up
              </button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
