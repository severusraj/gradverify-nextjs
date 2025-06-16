"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { submitStudentProfile } from "@/actions/student-profile.actions";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils/utils";

const steps = [
  "Profile Info",
  "PSA Certificate",
  "Graduation Photo",
  "Academic Awards",
];

const departments = [
  {
    name: "College of Allied Health Studies (CAHS)",
    programs: [
      "BS in Nursing",
      "BS in Midwifery",
    ],
  },
  {
    name: "College of Business and Accountancy (CBA)",
    programs: [
      "BS in Accountancy",
      "BS in Business Administration Major in Financial Management",
      "BS in Business Administration Major in Human Resource Management",
      "BS in Business Administration Major in Marketing Management",
      "BS in Customs Administration",
    ],
  },
  {
    name: "College of Computer Studies (CCS)",
    programs: [
      "BS in Computer Science",
      "BS in Entertainment and Multimedia Computing",
      "BS in Information Technology",
    ],
  },
  {
    name: "College of Education, Arts, and Sciences (CEAS)",
    programs: [
      "BA in Communication",
      "BS in Early Childhood Education",
      "BS in Culture and Arts Education",
      "BS in Physical Education",
      "BS in Elementary Education (General Education)",
      "BS in Secondary Education major in English",
      "BS in Secondary Education major in Filipino",
      "BS in Secondary Education major in Mathematics",
      "BS in Secondary Education major in Social Studies",
      "BS in Secondary Education major in Sciences",
    ],
  },
  {
    name: "College of Hospitality and Tourism Management (CHTM)",
    programs: [
      "BS in Hospitality Management",
      "BS in Tourism Management",
    ],
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      if (files[0].size > MAX_FILE_SIZE) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
    setFormData((prev) => ({ ...prev, department: e.target.value, program: "" }));
  };

  const programOptions =
    departments.find((d) => d.name === selectedDepartment)?.programs || [];

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== steps.length) {
      return;
    }
    setIsSubmitting(true);
    const data = new FormData();
    data.append("studentId", formData.studentId);
    data.append("program", formData.program);
    data.append("department", formData.department);
    data.append("dob", formData.dob);
    data.append("pob", formData.pob);
    if (formData.psaFile) data.append("psaFile", formData.psaFile);
    if (formData.gradPhoto) data.append("gradPhoto", formData.gradPhoto);
    if (formData.awards) data.append("awards", formData.awards);

    const result = await submitStudentProfile({ success: false, message: "" }, data);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      setFormData({
        studentId: "",
        program: "",
        department: "",
        dob: "",
        pob: "",
        psaFile: null,
        gradPhoto: null,
        awards: null,
      });
      setSelectedDepartment("");
      setCurrentStep(1);
      setTimeout(() => {
        router.push("/dashboard/student");
      }, 1500);
    } else {
      toast.error(result.message);
    }
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
                  : "bg-slate-700 text-slate-400 border-slate-600"
              }`}
            >
              {idx + 1}
            </div>
            <span
              className={`mt-2 text-xs font-medium text-center ${
                currentStep === idx + 1
                  ? "text-blue-400"
                  : "text-slate-400"
              }`}
            >
              {step}
            </span>
            {idx < steps.length - 1 && (
              <div className="absolute top-5 right-0 w-full h-0.5 bg-slate-600 z-0" style={{ left: '50%', width: '100%' }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-bold mb-2 text-white">Create Your Student Profile</h2>
              <p className="text-slate-300 mb-6">Please provide your student information to get started with document verification</p>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-200">Student ID</label>
                <input
                  className="w-full border border-slate-600 bg-slate-800/50 text-white rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-6 placeholder-slate-400"
                  placeholder="e.g., 202000123"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Enter your official student ID number</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-200">Department</label>
                  <select
                    className="w-full border border-slate-600 bg-slate-800/50 text-white rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-6"
                    name="department"
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    required
                  >
                    <option value="" className="bg-slate-800 text-slate-300">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.name} value={dept.name} className="bg-slate-800 text-white">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Your academic department</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-200">Program</label>
                  <select
                    className="w-full border border-slate-600 bg-slate-800/50 text-white rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedDepartment}
                  >
                    <option value="" className="bg-slate-800 text-slate-300">{selectedDepartment ? "Select program" : "Select department first"}</option>
                    {programOptions.map((prog) => (
                      <option key={prog} value={prog} className="bg-slate-800 text-white">
                        {prog}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Your degree program</p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1 text-slate-200">Date of Birth</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between border border-slate-600 bg-slate-800/50 rounded-lg px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition",
                        !formData.dob ? "text-slate-400" : "text-white"
                      )}
                    >
                      {formData.dob
                        ? format(new Date(formData.dob), "MM/dd/yyyy")
                        : "Pick a date"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start" sideOffset={8}>
                    <div className="p-2">
                      <Calendar
                        mode="single"
                        selected={formData.dob ? new Date(formData.dob) : undefined}
                        onSelect={date => {
                          if (date) {
                            // Create date at noon to avoid timezone issues
                            const selectedDate = new Date(date);
                            selectedDate.setHours(12, 0, 0, 0);
                            setFormData(prev => ({
                              ...prev,
                              dob: selectedDate.toISOString().split("T")[0],
                            }));
                          }
                        }}
                        initialFocus
                        fromYear={1970}
                        toYear={new Date().getFullYear()}
                        disabled={date => date > new Date()}
                        className="w-72"
                        captionLayout="dropdown"
                        classNames={{
                          caption: "flex justify-center pt-1 relative items-center text-white",
                          caption_dropdowns: "flex gap-2",
                          caption_label: "hidden",
                          vhidden: "hidden",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-slate-700",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-600/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-9 w-9",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-700 hover:text-white focus:outline-none rounded-md text-white",
                          day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                          day_today: "bg-slate-700 text-white",
                          day_outside: "text-slate-500 opacity-50",
                          day_disabled: "text-slate-500 opacity-50",
                          day_range_middle: "aria-selected:bg-blue-600/20 aria-selected:text-white",
                          day_hidden: "invisible",
                          dropdown: "bg-slate-800 border-slate-600 text-white rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                          dropdown_month: "bg-slate-800 border-slate-600 text-white",
                          dropdown_year: "bg-slate-800 border-slate-600 text-white"
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-slate-400 mt-1">
                  As shown on your PSA certificate. You must be at least 15 years old.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-200">Place of Birth</label>
                <input
                  className="w-full border border-slate-600 bg-slate-800/50 text-white rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-6 placeholder-slate-400"
                  placeholder="e.g., Olongapo City, Philippines"
                  name="pob"
                  value={formData.pob}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2 className="text-xl font-bold mb-2 text-white">Upload PSA Certificate</h2>
              <p className="text-slate-300 mb-6">Upload a clear scan or photo of your PSA birth certificate.</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1 text-slate-200">Upload PSA Certificate</label>
                {formData.psaFile ? (
                  <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 text-xs font-medium">File selected: {formData.psaFile.name}</span>
                    <button
                      type="button"
                      className="text-blue-400 text-xs underline hover:text-blue-300 transition-colors"
                      onClick={() => setFormData(prev => ({ ...prev, psaFile: null }))}
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    name="psaFile"
                    onChange={handleInputChange}
                    className="w-full border border-slate-600 bg-slate-800/50 text-white rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    required
                  />
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Accepted formats: JPEG, PNG, PDF (max 5MB). Your file will be uploaded when you submit the form.
                </p>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className="text-xl font-bold mb-2 text-white">Upload Graduation Photo</h2>
              <p className="text-slate-300 mb-6">Upload your official graduation photo.</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1 text-slate-200">Upload Graduation Photo</label>
                {formData.gradPhoto ? (
                  <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 text-xs font-medium">File selected: {formData.gradPhoto.name}</span>
                    <button
                      type="button"
                      className="text-blue-400 text-xs underline hover:text-blue-300 transition-colors"
                      onClick={() => setFormData(prev => ({ ...prev, gradPhoto: null }))}
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    name="gradPhoto"
                    onChange={handleInputChange}
                    className="w-full border border-slate-600 bg-slate-800/50 text-white rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    required
                  />
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Accepted formats: JPEG, PNG (max 5MB). Your file will be uploaded when you submit the form.
                </p>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <h2 className="text-xl font-bold mb-2 text-white">Upload Academic Awards</h2>
              <p className="text-slate-300 mb-6">Upload any academic award certificates (optional).</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1 text-slate-200">Upload Academic Awards <span className="text-slate-400 font-normal">(optional)</span></label>
                {formData.awards ? (
                  <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 text-xs font-medium">File selected: {formData.awards.name}</span>
                    <button
                      type="button"
                      className="text-blue-400 text-xs underline hover:text-blue-300 transition-colors"
                      onClick={() => setFormData(prev => ({ ...prev, awards: null }))}
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    name="awards"
                    onChange={handleInputChange}
                    className="w-full border border-slate-600 bg-slate-800/50 text-white rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    autoFocus={false}
                  />
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Accepted formats: JPEG, PNG, PDF (max 5MB). If you don&apos;t have any awards, you can leave this blank.
                </p>
              </div>
            </>
          )}
          {/* Prominent Submit button inside the form, only on last step */}
          {currentStep === steps.length && (
            <Button
              type="submit"
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-lg text-lg font-semibold py-3 transition-all focus-visible:ring-2 focus-visible:ring-blue-500/50"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2Icon className="size-5 animate-spin mr-2" /> : null} Submit
            </Button>
          )}
        </form>
        {/* Step navigation buttons outside the form */}
        <div className="flex justify-between mt-8 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          {currentStep < steps.length && (
            <Button 
              type="button" 
              onClick={nextStep} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 