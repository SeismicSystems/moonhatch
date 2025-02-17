import React from 'react'

export interface InputFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  optional?: boolean
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  optional,
}) => (
  <div className="mb-4">
    <label className="block  mb-2 text-sm text-[var(--lightBlue)]">
      {label}
    </label>
    <input
      className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-[var(--creamWhite)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={optional ? '(optional)' : placeholder}
    />
  </div>
)

export default InputField
