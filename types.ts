import { ReactNode } from "react";

export interface PasswordProtectConfig {
  /**
   * The password required to access the application
   * @deprecated For security, use server-side validation via API route instead.
   * If not provided, the component will use /api/auth/verify endpoint.
   */
  password?: string;

  /**
   * API endpoint for password validation
   * @default "/api/auth/verify"
   */
  apiEndpoint?: string;

  /**
   * Optional brand logo to display on the password protection page
   * Can be a string (URL or path) or a React node
   */
  logo?: string | ReactNode;

  /**
   * Optional title text for the password protection page
   * @default "Password Protected"
   */
  title?: string;

  /**
   * Optional description text for the password protection page
   * @default "Please enter the password to access this application."
   */
  description?: string;

  /**
   * Optional placeholder text for the password input
   * @default "Enter password"
   */
  placeholder?: string;

  /**
   * Optional error message to display when password is incorrect
   * @default "Incorrect password. Please try again."
   */
  errorMessage?: string;

  /**
   * Optional custom classNames for different UI elements
   *
   * Example:
   * {
   *   wrapper: '...', // outer wrapper
   *   container: '...', // main container
   *   logo: '...', // logo element
   *   heading: '...', // heading text
   *   description: '...', // description text
   *   input: '...', // input field
   *   button: '...', // submit button
   *   errormessage: '...' // error message
   * }
   */
  classNames?: {
    wrapper?: string;
    container?: string;
    logo?: string;
    heading?: string;
    description?: string;
    input?: string;
    button?: string;
    errormessage?: string;
  };

  /**
   * Optional title text for the password protection page
   * @default "Password Protected"
   */
  buttonText?: string;

  /**
   * Optional callback function called when password is successfully entered
   */
  onSuccess?: () => void;

  /**
   * Optional callback function called when password is incorrect
   */
  onError?: () => void;

  /**
   * Storage key for persisting authentication state
   * @default "password-protect-auth"
   */
  storageKey?: string;

  /**
   * Whether to persist authentication state in localStorage
   * @default true
   */
  persistAuth?: boolean;
}
