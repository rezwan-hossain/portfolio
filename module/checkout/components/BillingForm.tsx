// module/checkout/components/BillingForm.tsx
import Input from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tshirtSizes } from "../data/tshirtSizes";
import { BillingFormData } from "@/types/checkout";
import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";

type BillingFormProps = {
  formData: BillingFormData;
  updateField: (field: keyof BillingFormData, value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
};

export type BillingFormRef = {
  validateAndFocus: () => boolean;
};

// Bangladeshi phone number regex
// Accepts: 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX
// Valid operators: 013, 014, 015, 016, 017, 018, 019
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ValidationErrors = {
  [key in keyof BillingFormData]?: string;
};

// Required fields in order
const REQUIRED_FIELDS: (keyof BillingFormData)[] = [
  "fullName",
  "email",
  "phone",
  "gender",
  "birthDate",
  "ageCategory",
  "bloodGroup",
  "tshirtSize",
  "runnerCategory",
];

export const BillingForm = forwardRef<BillingFormRef, BillingFormProps>(
  ({ formData, updateField, onValidationChange }, ref) => {
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    // Refs for all input fields
    const inputRefs = {
      fullName: useRef<HTMLInputElement>(null),
      email: useRef<HTMLInputElement>(null),
      phone: useRef<HTMLInputElement>(null),
      gender: useRef<HTMLButtonElement>(null),
      birthDate: useRef<HTMLInputElement>(null),
      ageCategory: useRef<HTMLButtonElement>(null),
      bloodGroup: useRef<HTMLButtonElement>(null),
      tshirtSize: useRef<HTMLButtonElement>(null),
      emergencyContactName: useRef<HTMLInputElement>(null),
      emergencyContactNumber: useRef<HTMLInputElement>(null),
      communityName: useRef<HTMLInputElement>(null),
      runnerCategory: useRef<HTMLButtonElement>(null),
    };

    // Validate a single field
    const validateField = useCallback(
      (field: keyof BillingFormData, value: string): string => {
        switch (field) {
          case "fullName":
            if (!value.trim()) return "Name is required";
            if (value.trim().length < 2)
              return "Name must be at least 2 characters";
            return "";

          case "email":
            if (!value.trim()) return "Email is required";
            if (!EMAIL_REGEX.test(value))
              return "Please enter a valid email address";
            return "";

          case "phone":
            if (!value.trim()) return "Contact number is required";
            // Remove spaces and dashes for validation
            const cleanPhone = value.replace(/[\s-]/g, "");
            if (!BD_PHONE_REGEX.test(cleanPhone)) {
              return "Please enter a valid Bangladeshi phone number (e.g., 01712345678)";
            }
            return "";

          case "gender":
            if (!value) return "Gender is required";
            return "";

          case "birthDate":
            if (!value) return "Date of birth is required";
            // Check if date is in the past
            const selectedDate = new Date(value);
            const today = new Date();
            if (selectedDate >= today)
              return "Date of birth must be in the past";
            return "";

          case "ageCategory":
            if (!value) return "Age category is required";
            return "";

          case "bloodGroup":
            if (!value) return "Blood group is required";
            return "";

          case "tshirtSize":
            if (!value) return "T-Shirt size is required";
            return "";

          case "runnerCategory":
            if (!value) return "Runner category is required";
            return "";

          case "emergencyContactNumber":
            if (value.trim()) {
              const cleanEmergencyPhone = value.replace(/[\s-]/g, "");
              if (!BD_PHONE_REGEX.test(cleanEmergencyPhone)) {
                return "Please enter a valid Bangladeshi phone number";
              }
            }
            return "";

          default:
            return "";
        }
      },
      [],
    );

    // Check if form is valid (for enabling/disabling submit button)
    const checkFormValidity = useCallback(() => {
      for (const field of REQUIRED_FIELDS) {
        const error = validateField(field, formData[field]);
        if (error) return false;
      }
      return true;
    }, [formData, validateField]);

    // Notify parent about validation state changes
    const notifyValidationChange = useCallback(() => {
      if (onValidationChange) {
        onValidationChange(checkFormValidity());
      }
    }, [checkFormValidity, onValidationChange]);

    // Validate all fields and focus on first invalid
    const validateAndFocus = useCallback((): boolean => {
      const newErrors: ValidationErrors = {};
      const newTouched: { [key: string]: boolean } = {};
      let firstInvalidField: keyof BillingFormData | null = null;

      for (const field of REQUIRED_FIELDS) {
        newTouched[field] = true;
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          if (!firstInvalidField) {
            firstInvalidField = field;
          }
        }
      }

      // Also validate optional fields that have values
      if (formData.emergencyContactNumber) {
        newTouched.emergencyContactNumber = true;
        const error = validateField(
          "emergencyContactNumber",
          formData.emergencyContactNumber,
        );
        if (error) {
          newErrors.emergencyContactNumber = error;
          if (!firstInvalidField) {
            firstInvalidField = "emergencyContactNumber";
          }
        }
      }

      setErrors(newErrors);
      setTouched((prev) => ({ ...prev, ...newTouched }));

      // Focus on first invalid field
      if (firstInvalidField && inputRefs[firstInvalidField]?.current) {
        inputRefs[firstInvalidField].current?.focus();
        // Scroll into view for better UX
        inputRefs[firstInvalidField].current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return false;
      }

      return Object.keys(newErrors).length === 0;
    }, [formData, validateField]);

    // Expose validateAndFocus method to parent
    useImperativeHandle(
      ref,
      () => ({
        validateAndFocus,
      }),
      [validateAndFocus],
    );

    // Handle field blur (mark as touched and validate)
    const handleBlur = (field: keyof BillingFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => ({ ...prev, [field]: error }));
      notifyValidationChange();
    };

    // Handle field change with validation
    const handleFieldChange = (field: keyof BillingFormData, value: string) => {
      updateField(field, value);
      // Only validate if field has been touched
      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
      // Always notify validation change
      setTimeout(notifyValidationChange, 0);
    };

    // Validate on select change (since selects don't have onBlur in the same way)
    const handleSelectChange = (
      field: keyof BillingFormData,
      value: string,
    ) => {
      updateField(field, value);
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
      setTimeout(notifyValidationChange, 0);
    };

    // Error message component
    const ErrorMessage = ({ field }: { field: keyof BillingFormData }) => {
      if (!touched[field] || !errors[field]) return null;
      return <p className="mt-1 text-xs text-red-500">{errors[field]}</p>;
    };

    return (
      <div className="rounded-lg border border-gray-200 p-4 sm:p-6 md:p-8">
        <h2 className="mb-4 sm:mb-6 font-serif text-xl sm:text-2xl font-bold text-foreground tracking-wider">
          Billing Details
        </h2>

        {/* Name Row */}
        <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              Name <span className="text-red-500 font-semibold">*</span>
            </label>
            <Input
              ref={inputRefs.fullName}
              className={`h-10 sm:h-11 border ${
                touched.fullName && errors.fullName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200"
              } bg-background rounded-md text-sm sm:text-base`}
              placeholder="Enter Name"
              value={formData.fullName}
              onChange={(e) => handleFieldChange("fullName", e.target.value)}
              onBlur={() => handleBlur("fullName")}
              required
            />
            <ErrorMessage field="fullName" />
          </div>
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              Email <span className="text-red-500 font-semibold">*</span>
            </label>
            <Input
              ref={inputRefs.email}
              className={`h-10 sm:h-11 border ${
                touched.email && errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200"
              } bg-background rounded-md text-sm sm:text-base`}
              type="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
            />
            <ErrorMessage field="email" />
          </div>
        </div>

        <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              CONTACT NUMBER{" "}
              <span className="text-red-500 font-semibold">*</span>
            </label>
            <Input
              ref={inputRefs.phone}
              className={`h-10 sm:h-11 border ${
                touched.phone && errors.phone
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200"
              } bg-background rounded-md text-sm sm:text-base`}
              placeholder="e.g., 01712345678"
              value={formData.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
              required
            />
            <ErrorMessage field="phone" />
          </div>
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              GENDER <span className="text-red-500 font-semibold">*</span>
            </label>
            <Select
              value={formData.gender}
              onValueChange={(val) => handleSelectChange("gender", val)}
            >
              <SelectTrigger
                ref={inputRefs.gender}
                className={`h-10 sm:h-11 rounded-md border ${
                  touched.gender && errors.gender
                    ? "border-red-500"
                    : "border-gray-200"
                } bg-background text-sm sm:text-base`}
              >
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <ErrorMessage field="gender" />
          </div>
        </div>

        <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              DATE OF BIRTH{" "}
              <span className="text-red-500 font-semibold">*</span>
            </label>
            <Input
              ref={inputRefs.birthDate}
              type="date"
              className={`h-10 sm:h-11 border ${
                touched.birthDate && errors.birthDate
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200"
              } bg-background rounded-md text-sm sm:text-base`}
              placeholder="Enter Date of Birth"
              value={formData.birthDate}
              onChange={(e) => handleFieldChange("birthDate", e.target.value)}
              onBlur={() => handleBlur("birthDate")}
              required
            />
            <ErrorMessage field="birthDate" />
          </div>
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              AGE CATEGORY <span className="text-red-500 font-semibold">*</span>
            </label>
            <Select
              value={formData.ageCategory}
              onValueChange={(val) => handleSelectChange("ageCategory", val)}
            >
              <SelectTrigger
                ref={inputRefs.ageCategory}
                className={`h-10 sm:h-11 rounded-md border ${
                  touched.ageCategory && errors.ageCategory
                    ? "border-red-500"
                    : "border-gray-200"
                } bg-background text-sm sm:text-base`}
              >
                <SelectValue placeholder="Select Age Category" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Veteran (47+)">Veteran (47+)</SelectItem>
              </SelectContent>
            </Select>
            <ErrorMessage field="ageCategory" />
          </div>
        </div>

        <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              Blood Group <span className="text-red-500 font-semibold">*</span>
            </label>
            <Select
              value={formData.bloodGroup}
              onValueChange={(val) => handleSelectChange("bloodGroup", val)}
            >
              <SelectTrigger
                ref={inputRefs.bloodGroup}
                className={`h-10 sm:h-11 rounded-md border ${
                  touched.bloodGroup && errors.bloodGroup
                    ? "border-red-500"
                    : "border-gray-200"
                } bg-background text-sm sm:text-base`}
              >
                <SelectValue placeholder="Select Blood Group" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
            <ErrorMessage field="bloodGroup" />
          </div>
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              T-Shirt Size <span className="text-red-500 font-semibold">*</span>
            </label>

            <Select
              value={formData.tshirtSize}
              onValueChange={(val) => handleSelectChange("tshirtSize", val)}
            >
              <SelectTrigger
                ref={inputRefs.tshirtSize}
                className={`h-10 sm:h-11 rounded-md border ${
                  touched.tshirtSize && errors.tshirtSize
                    ? "border-red-500"
                    : "border-gray-200"
                } bg-background text-sm sm:text-base`}
              >
                <SelectValue placeholder="Select T-Shirt Size" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-200">
                {tshirtSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.chest && size.length
                      ? `${size.value} (Chest: ${size.chest}", Length: ${size.length}")`
                      : size.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ErrorMessage field="tshirtSize" />
          </div>
        </div>

        <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              Emergency Contact Name
            </label>
            <Input
              ref={inputRefs.emergencyContactName}
              className="h-10 sm:h-11 border border-gray-200 bg-background rounded-md text-sm sm:text-base"
              placeholder="Enter Emergency Contact Name"
              value={formData.emergencyContactName}
              onChange={(e) =>
                handleFieldChange("emergencyContactName", e.target.value)
              }
            />
          </div>
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              Emergency Contact Number
            </label>
            <Input
              ref={inputRefs.emergencyContactNumber}
              className={`h-10 sm:h-11 border ${
                touched.emergencyContactNumber && errors.emergencyContactNumber
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200"
              } bg-background rounded-md text-sm sm:text-base`}
              type="text"
              placeholder="e.g., 01712345678"
              value={formData.emergencyContactNumber}
              onChange={(e) =>
                handleFieldChange("emergencyContactNumber", e.target.value)
              }
              onBlur={() => handleBlur("emergencyContactNumber")}
            />
            <ErrorMessage field="emergencyContactNumber" />
          </div>
        </div>

        <div className="mb-4 sm:mb-5 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800 uppercase">
              Community Name
            </label>
            <Input
              ref={inputRefs.communityName}
              className="h-10 sm:h-11 border border-gray-200 bg-background rounded-md text-sm sm:text-base"
              placeholder="Enter Community Name"
              value={formData.communityName}
              onChange={(e) =>
                handleFieldChange("communityName", e.target.value)
              }
            />
          </div>
          <div>
            <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-neutral-800">
              Runner Category{" "}
              <span className="text-red-500 font-semibold">*</span>
            </label>
            <Select
              value={formData.runnerCategory}
              onValueChange={(val) => handleSelectChange("runnerCategory", val)}
            >
              <SelectTrigger
                ref={inputRefs.runnerCategory}
                className={`h-10 sm:h-11 rounded-md border ${
                  touched.runnerCategory && errors.runnerCategory
                    ? "border-red-500"
                    : "border-gray-200"
                } bg-background text-sm sm:text-base`}
              >
                <SelectValue placeholder="Select Runner Category" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-gray-200">
                <SelectItem value="Amateur">Amateur</SelectItem>
                {/* <SelectItem value="Elite">Elite</SelectItem> */}
              </SelectContent>
            </Select>
            <ErrorMessage field="runnerCategory" />
          </div>
        </div>
      </div>
    );
  },
);

BillingForm.displayName = "BillingForm";
