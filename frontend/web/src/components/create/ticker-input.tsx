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
        onChange={(e) => {
          // Only update if the new value's length is at most 5.
          if (e.target.value.length <= 5) {
            onChange(e.target.value)
          }
        }}
        placeholder="3-5 Characters "
        // maxLength={5}
        // minLength={3}
      />
    </div>
  </div>
)

export default TickerInput
