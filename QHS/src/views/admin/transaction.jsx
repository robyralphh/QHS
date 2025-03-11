
import { useStateContext } from "../../Context/ContextProvider";
import { useEffect } from "react";

export default function transactions(){
    const { user } = useStateContext();

return(
    <div>
       Transaction Content
    </div>
)

}
