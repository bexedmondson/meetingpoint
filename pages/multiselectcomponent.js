import React, { useState } from 'react';
import Select from 'react-select';
import london from '../data/london.json';

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];


let stations = [];
london.stations.forEach(station => {
    stations.push({value: station.id, label: station.name})
});

export default function Selector() {
  const [selectedOption, setSelectedOption] = useState(null);
  
  const handleChange = (selectedOption) => {
    setSelected(selectedOption);
    console.log(`Option selected:`, selectedOption);
  };

  return (
    <div className="Selector">
      <Select
        defaultValue={selectedOption}
        onChange={setSelectedOption}
        handleChange={handleChange}
        options={stations}
        isMulti
        autoFocus
      />
    </div>
  );
}