import { useParams } from "react-router-dom";

function Vessel() {
  let { mmsi } = useParams();

  return <h1>Hi from Vessel {mmsi} !</h1>;
}

export default Vessel;
