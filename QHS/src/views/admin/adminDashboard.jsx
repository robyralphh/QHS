
import { useStateContext } from "../../Context/ContextProvider";
import { useEffect } from "react";

export default function adminDashboard(){
    const { user } = useStateContext();

return(
    <div>
       Dashboard Content
    </div>
)

}
