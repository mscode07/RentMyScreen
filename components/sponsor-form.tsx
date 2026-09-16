"use client";

import { useState } from "react";

type Props = { slot: number };
const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export function SponsorForm({ slot }: Props) {
  const [logo, setLogo] = useState<string>("");
  const [logoName, setLogoName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogoChange(file?: File) {
    setError("");
    if (!file) return;
    if (!allowedTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Upload a PNG, JPG, WebP, or SVG smaller than 2 MB.");
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    setLogo(dataUrl);
    setLogoName(file.name);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!logo) return setError("Please upload your logo before checkout.");
    setLoading(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, slot, logoDataUrl: logo }),
      });
      const body = await response.json();
      if (!response.ok || !body.checkoutUrl) throw new Error(body.error || "Could not start checkout.");
      window.location.assign(body.checkoutUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start checkout.");
      setLoading(false);
    }
  }

  return <form onSubmit={submit}>
    <div className="field-row"><label>Company / SaaS name<input name="companyName" placeholder="e.g. Acme Studio" required/></label><label>Website<input name="websiteUrl" type="url" placeholder="https://yourwebsite.com" required/></label></div>
    <label>Logo <span className="required">required</span><input className="file-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e) => onLogoChange(e.target.files?.[0])} required/><small>PNG, JPG, WebP, or SVG · max 2 MB</small></label>
    {logo && <div className="logo-preview"><img src={logo} alt="Logo preview"/><span>{logoName}</span><button type="button" onClick={() => { setLogo(""); setLogoName(""); }}>Remove</button></div>}
    <label>Short description <em>optional</em><textarea name="description" placeholder="Tell visitors what you make in one good sentence." rows={3}/></label>
    <div className="field-row"><label>Contact email<input name="contactEmail" type="email" placeholder="you@company.com" required/></label><label>Founder name <em>optional</em><input name="founderName" placeholder="Your name"/></label></div>
    <div className="terms">By continuing, you confirm this spot is for your company and agree to the straightforward sponsorship terms.</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button full" disabled={loading}>{loading ? "Starting secure checkout…" : "Continue to secure checkout ↗"}</button>
    <p className="form-note">You’ll be redirected to Dodo’s secure checkout. A spot is confirmed only after payment clears.</p>
  </form>;
}
