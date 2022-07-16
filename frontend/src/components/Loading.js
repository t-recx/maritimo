import "./Loading.css";

function Loading() {
  return (
    <progress
      className="progress is-small is-warning loading-progress"
      max="100"
    ></progress>
  );
}

export default Loading;
