import React, { useState, useId } from 'react';
import Select from 'react-select';

export default function Selector({stations, selectedOptions, set}) {
  const [selectedOption, setSelectedOption] = useState([]);

  const handleChange = (selected) => {
    selectedOptions = selected;
    set(selectedOptions);
  }

  return (
    <div className="Selector">
      <Select
        instanceId={useId}
        defaultValue={selectedOption}
        onChange={handleChange}
        options={stations}
        isMulti
        autoFocus
      />
    </div>
  );
}