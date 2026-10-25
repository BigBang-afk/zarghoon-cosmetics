"use client";

import { useActionState } from "react";
import { changePasswordAction, type PasswordState } from "./actions";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<PasswordState, FormData>(changePasswordAction, {});
  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div>
        <label htmlFor="current" className="label">Current password</label>
        <input id="current" name="current" type="password" autoComplete="current-password" required className="input" />
      </div>
      <div>
        <label htmlFor="next" className="label">New password</label>
        <input id="next" name="next" type="password" autoComplete="new-password" minLength={12} required className="input" />
      </div>
      <div>
        <label htmlFor="confirm" className="label">Repeat new password</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required className="input" />
      </div>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary">{pending ? "Saving…" : "Change password"}</button>
      <p className="text-xs text-stone-500">You will be signed out on every device and asked to sign in again.</p>
    </form>
  );
}
