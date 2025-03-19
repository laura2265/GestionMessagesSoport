import { useContext, useState } from "react";
import ThemeContext from "../../../ThemeContext";


function ChatsMessenger(){
    const [theme, toggleTheme] = useState(ThemeContext)
    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>

            </div>
        </>
    )
}

export default ChatsMessenger;