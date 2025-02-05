import React from 'react'

import type { InputFieldProps } from './input-field'

const TickerInput: React.FC<Omit<InputFieldProps, 'label'>> = ({
  value,
  onChange,
  placeholder,
}) => (
  <div className="mb-4">
    <label className="block text-blue-400 mb-2 text-sm">ticker</label>
    <div className="flex">
      <span className="bg-gray-900 border border-gray-700 rounded-l p-2 text-white">
        $
      </span>
      <input
        className="flex-1 bg-gray-900 border border-gray-700 border-l-0 rounded-r p-2 text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  </div>
)

export default TickerInput
