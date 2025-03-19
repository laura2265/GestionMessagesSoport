import { useContext } from "react"
import ThemeContext from "../../../ThemeContext"
import ModoClaro from '../../../../assets/img/soleado.png'
import ModoOscuro from '../../../../assets/img/modo-oscuro.png'
import Navbar from "../../../navbar/Navbar"
import SliderEmploye from "../../../navbar/SliderEmploye"
import '../chatBotEmple.css'

function WhatsappEmple (){
    const { theme, toggleTheme } = useContext(ThemeContext);

    return(
        <>
            <div className={theme === 'light'? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderEmploye />
                    </div>
                </div>
                <div className="BarraSuperior">
                    <h1>Whatsapp</h1>
                    <a className="ButtonTheme1" onClick={toggleTheme}><img src={theme === 'light'? ModoClaro : ModoOscuro} /></a>
                </div>
                <div className="contentChatW">
                    <div className="contentContact">
                        <div className="barrasuperiorContacts">
                            <p>Contactos</p>
                        </div>
                    </div>
                    <div className="contentChat">
                        <div className="contentTitle">
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default WhatsappEmple