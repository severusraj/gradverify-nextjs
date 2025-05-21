"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { submitStudentProfile } from "@/actions/studentProfile.actions";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-6"
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
                  <label className="block text-sm font-semibold mb-1">Department</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-6"
                    name="department"
                    value={selectedDepartment}
                    onChange={handleDepartmentChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Your academic department</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Program</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-6"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    disabled={!selectedDepartment}
                  >
                    <option value="">{selectedDepartment ? "Select program" : "Select department first"}</option>
                    {programOptions.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Your degree program</p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between border border-gray-200 rounded-lg px-4 py-2 bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-600 transition",
                        !formData.dob && "text-gray-400"
                      )}
                    >
                      {formData.dob
                        ? format(new Date(formData.dob), "MM/dd/yyyy")
                        : "Pick a date"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
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
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_dropdowns: "flex gap-2",
                          caption_label: "hidden",
                          vhidden: "hidden",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 h-9 w-9",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:outline-none rounded-md",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                          day_hidden: "invisible"
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-400 mt-1">
                  As shown on your PSA certificate. You must be at least 15 years old.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Place of Birth</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-6"
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
              <h2 className="text-xl font-bold mb-2">Upload PSA Certificate</h2>
              <p className="text-gray-500 mb-6">Upload a clear scan or photo of your PSA birth certificate.</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Upload PSA Certificate</label>
                {formData.psaFile ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xs font-medium">File selected: {formData.psaFile.name}</span>
                    <button
                      type="button"
                      className="text-blue-600 text-xs underline"
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-2"
                    required
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Accepted formats: JPEG, PNG, PDF (max 5MB). Your file will be uploaded when you submit the form.
                </p>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className="text-xl font-bold mb-2">Upload Graduation Photo</h2>
              <p className="text-gray-500 mb-6">Upload your official graduation photo.</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Upload Graduation Photo</label>
                {formData.gradPhoto ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xs font-medium">File selected: {formData.gradPhoto.name}</span>
                    <button
                      type="button"
                      className="text-blue-600 text-xs underline"
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-2"
                    required
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Accepted formats: JPEG, PNG (max 5MB). Your file will be uploaded when you submit the form.
                </p>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <h2 className="text-xl font-bold mb-2">Upload Academic Awards</h2>
              <p className="text-gray-500 mb-6">Upload any academic award certificates (optional).</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1">Upload Academic Awards <span className="text-gray-400 font-normal">(optional)</span></label>
                {formData.awards ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xs font-medium">File selected: {formData.awards.name}</span>
                    <button
                      type="button"
                      className="text-blue-600 text-xs underline"
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
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition mb-2"
                    autoFocus={false}
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Accepted formats: JPEG, PNG, PDF (max 5MB). If you don't have any awards, you can leave this blank.
                </p>
              </div>
            </>
          )}
          {/* Prominent Submit button inside the form, only on last step */}
          {currentStep === steps.length && (
            <Button
              type="submit"
              className="mt-8 w-full bg-primary text-primary-foreground shadow-lg rounded-lg text-lg font-semibold py-3 transition-all hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/50"
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
            className="flex-1"
          >
            Previous
          </Button>
          {currentStep < steps.length && (
            <Button type="button" onClick={nextStep} className="flex-1">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 