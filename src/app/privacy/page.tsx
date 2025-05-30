import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Your privacy is important to us. This policy explains how GradVerify collects, uses, and protects your information:</p>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>We collect only the information necessary for graduate verification and academic processes.</li>
        <li>Your data is stored securely and is not shared with unauthorized third parties.</li>
        <li>We use industry-standard security measures to protect your information.</li>
        <li>You may request to view or update your personal information at any time.</li>
        <li>By using this application, you consent to this privacy policy.</li>
      </ul>
      <p className="text-muted-foreground">If you have questions about this policy, please contact the system administrator.</p>
    </div>
  );
} 