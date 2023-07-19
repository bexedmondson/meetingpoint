
function CalculateMeetingPoint(starts, ends, hasResult)
{
  console.log(starts);
  hasResult = true;
}

export default function MeetingPoint({starts, ends, hasResult}) {
  return (
    <div> {
      hasResult === false ? (
        <button onClick={(e) => CalculateMeetingPoint(starts, ends, hasResult, e)}>Find</button>
      ) : (
        <h3>Best station:</h3>
      )
    } </div>
  );
}
