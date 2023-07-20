import React, { useState } from 'react';
import find_path from 'dijkstrajs';

function CalculateMeetingPoint(starts, ends, setHasResult, setResult)
{
  setResult(null);
  setHasResult(true);
}

export default function MeetingPoint({starts, ends, setResult}) {
  const [hasResult, setHasResult] = useState(false);

  return (
    <div> {
      hasResult === false ? (
        <button onClick={(e) => CalculateMeetingPoint(starts, ends, setHasResult, setResult, e)}>Find</button>
      ) : (
        <h3>Best station:</h3>
      )
    } </div>
  );
}
