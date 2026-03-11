import Input from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tshirtSizes } from "../data/tshirtSizes";

export const BillingForm = () => {
  return (
    <div className="rounded-lg  border border-gray-200 p-6 md:p-8">
      <h2 className="mb-6 font-serif text-2xl font-bold text-foreground tracking-wider">
        Billing Details
      </h2>

      {/* Name Row */}
      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            Name <span className="text-red-500 font-semibold">*</span>
          </label>
          <Input
            className="h-11  border border-gray-200 bg-background rounded-md"
            placeholder="Enter Name"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            Email <span className="text-red-500 font-semibold">*</span>
          </label>
          <Input
            className="h-11  border border-gray-200 bg-background rounded-md"
            type="email"
            placeholder="Enter Email"
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            CONTACT NUMBER <span className="text-red-500 font-semibold">*</span>
          </label>
          <Input
            className="h-11  border border-gray-200 bg-background rounded-md"
            placeholder="Enter Contact Number"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            GENDER <span className="text-red-500 font-semibold">*</span>
          </label>
          <Select>
            <SelectTrigger className="h-11 rounded-md border border-gray-200 bg-background">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>

            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            DATE OF BIRTH <span className="text-red-500 font-semibold">*</span>
          </label>
          <Input
            type="date"
            className="h-11  border border-gray-200 bg-background rounded-md"
            placeholder="Enter Date of Birth"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            AGE CATEGORY <span className="text-red-500 font-semibold">*</span>
          </label>
          <Select>
            <SelectTrigger className="h-11 rounded-md border border-gray-200 bg-background">
              <SelectValue placeholder="Select Age Category" />
            </SelectTrigger>

            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Veteran (50+)">Veteran (50+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            Blood Group <span className="text-red-500 font-semibold">*</span>
          </label>
          <Input
            type="text"
            className="h-11  border border-gray-200 bg-background rounded-md"
            placeholder="Enter Blood Group"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            T-Shirt Size <span className="text-red-500 font-semibold">*</span>
          </label>

          <Select>
            <SelectTrigger className="h-11 rounded-md border border-gray-200 bg-background">
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
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            Emergency Contact Name
          </label>
          <Input
            className="h-11  border border-gray-200 bg-background rounded-md"
            placeholder="Enter Emergency Contact Name"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            Emergency Contact Number
          </label>
          <Input
            className="h-11  border border-gray-200 bg-background rounded-md"
            type="text"
            placeholder="Enter Emergency Contact Number"
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800 uppercase">
            Community Name
          </label>
          <Input
            className="h-11  border border-gray-200 bg-background rounded-md"
            placeholder="Enter Community Name"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-800">
            Runner Category{" "}
            <span className="text-red-500 font-semibold">*</span>
          </label>
          <Select>
            <SelectTrigger className="h-11 rounded-md border border-gray-200 bg-background">
              <SelectValue placeholder="Select Runner Category" />
            </SelectTrigger>

            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="Amateur">Amateur</SelectItem>
              <SelectItem value="Elite">Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
