"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStaffAction, type FormState } from "./actions";

export function NewStaffForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createStaffAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" required className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Temporary password</label>
        <input id="password" name="password" type="password" minLength={12} required autoComplete="new-password" className="input" />
        <p className="mt-1 text-xs text-stone-500">At least 12 characters. Ask them to change it after signing in.</p>
      </div>
      <div>
        <label htmlFor="role" className="label">Role</label>
        <select id="role" name="role" defaultValue="STAFF" className="input">
          <option value="STAFF">Staff — products, orders, customers, content</option>
          <option value="OWNER">Owner — everything, incl. staff &amp; settings</option>
        </select>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="btn-primary">{pending ? "Adding…" : "Add staff member"}</button>
        {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        {state.success && <p className="text-sm text-juniper">{state.success}</p>}
      </div>
    </form>
  );
}
