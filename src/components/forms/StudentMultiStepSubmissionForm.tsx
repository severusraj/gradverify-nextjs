"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const steps = [
  "Profile Info",
  "PSA Certificate",
  "Graduation Photo",
  "Academic Awards",
];

export default function StudentMultiStepSubmissionForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    studentId: "",
    program: "",
    department: "",
    dob: "",
    pob: "",
    psaFile: null as File | null,
    gradPhoto: null as File | null,
    awards: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend submission logic
    alert("Submitted! (Integrate with backend)");
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, idx) => (
          <div key={step} className="flex-1 flex flex-col items-center relative">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                currentStep === idx + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : currentStep > idx + 1
                  ? "bg-blue-100 text-blue-600 border-blue-600"
                  : "bg-white text-gray-400 border-gray-300"
              }`}
            >
              {idx + 1}
            </div>
            <span
              className={`mt-2 text-xs font-medium text-center ${
                currentStep === idx + 1
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              {step}
            </span>
            {idx < steps.length - 1 && (
              <div className="absolute top-5 right-0 w-full h-0.5 bg-gray-200 z-0" style={{ left: '50%', width: '100%' }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-bold mb-2">Create Your Student Profile</h2>
              <p className="text-gray-500 mb-6">Please provide your student information to get started with document verification</p>
              <div>
                <label className="block text-sm font-semibold mb-1">Student ID</label>
                <input
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 202000123"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter your official student ID number</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Program</label>
                  <input
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., BSCS, BSIT"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Your degree program</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Department</label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="ENG">Engineering</option>
                    {/* Add more departments as needed */}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Your academic department</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">As shown on your PSA certificate</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Place of Birth</label>
                  <input
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Manila, Philippines"
                    name="pob"
                    value={formData.pob}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2 className="text-xl font-bold mb-2">Upload PSA Certificate</h2>
              <p className="text-gray-500 mb-6">Upload a clear scan or photo of your PSA birth certificate.</p>
              <div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  name="psaFile"
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Accepted formats: JPEG, PNG, PDF (max 5MB)</p>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className="text-xl font-bold mb-2">Upload Graduation Photo</h2>
              <p className="text-gray-500 mb-6">Upload your official graduation photo.</p>
              <div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  name="gradPhoto"
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Accepted formats: JPEG, PNG (max 5MB)</p>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <h2 className="text-xl font-bold mb-2">Upload Academic Awards</h2>
              <p className="text-gray-500 mb-6">Upload any academic award certificates (optional).</p>
              <div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  name="awards"
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Accepted formats: JPEG, PNG, PDF (max 5MB)</p>
              </div>
            </>
          )}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 