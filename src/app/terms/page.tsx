import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">Welcome to GradVerify! By using this application, you agree to the following terms and conditions:</p>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>You will use this service only for its intended purpose of graduate verification and related academic processes.</li>
        <li>You will not share your account credentials with others.</li>
        <li>You are responsible for the accuracy of the information you provide.</li>
        <li>All data is handled in accordance with our privacy policy.</li>
        <li>We reserve the right to update these terms at any time.</li>
      </ul>
      <p className="text-muted-foreground">If you have questions about these terms, please contact the system administrator.</p>
    </div>
  );
} 