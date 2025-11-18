"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { usePasswordProtect } from "./context";
import NextjsLogo from "./NextjsLogo";
import { cn } from "./utils";

export function PasswordProtect() {
  const { authenticate, config } = usePasswordProtect();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    const isValid = await authenticate(password);

    if (!isValid) {
      setError(true);
      setPassword("");
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.form?.requestSubmit();
    }
  };

  const renderLogo = () => {
    if (!config.logo)
      return (
        <NextjsLogo
          className={cn(
            "h-auto w-[220px] mb-8 object-contain",
            config.classNames?.logo
          )}
        />
      );

    if (typeof config.logo === "string") {
      return (
        <img
          src={config.logo}
          alt="Logo"
          className={cn(
            "h-12 w-auto mb-8 object-contain",
            config.classNames?.logo
          )}
        />
      );
    }

    return <div className="mb-8">{config.logo}</div>;
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background flex items-center justify-center px-4",
        config.classNames?.wrapper
      )}
    >
      <div className={cn("w-full max-w-md", config.classNames?.container)}>
        <div className="rounded-2xl shadow-xl dark:shadow-[0_20px_25px_-5px_rgba(255,255,255,0.1)] p-8 md:p-10 border border-foreground/20">
          <div className="flex flex-col items-center text-center">
            {renderLogo()}

            <h1
              className={cn(
                "text-3xl font-bold mb-3 text-foreground",
                config.classNames?.heading
              )}
            >
              {config.title || "Password Protected"}
            </h1>

            <p
              className={cn(
                "mb-8 text-sm md:text-base opacity-70 text-foreground",
                config.classNames?.description
              )}
            >
              {config.description ||
                "Please enter the password to access this application."}
            </p>

            <form onSubmit={handleSubmit} className="w-full">
              <div className="mb-6">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border-2 border-foreground/20 transition-all duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0",
                    error
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-foreground/40 focus:border-foreground/40",
                    config.classNames?.input
                  )}
                  placeholder={config.placeholder || "Enter password"}
                  autoFocus
                  disabled={isSubmitting}
                  data-error={error ? "true" : "false"}
                />

                {error && (
                  <p
                    className={cn(
                      "mt-2 text-sm animate-shake text-red-500",
                      config.classNames?.errormessage
                    )}
                  >
                    {config.errorMessage ||
                      "Incorrect password. Please try again."}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !password.trim()}
                className={cn(
                  "w-full py-3 px-4 bg-foreground hover:bg-foreground/90 disabled:bg-foreground/50 disabled:hover:bg-foreground/50 disabled:cursor-not-allowed text-background font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
                  config.classNames?.button
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Access Application"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
