import { useContext, useEffect, useState } from "react"
import ThemeContext from "../../ThemeContext";
import Navbar from "../../navbar/Navbar";
import SliderClient from "../../navbar/SliderClient";
import User from '../../../assets/img/usuario1.png'
import './asesorPreferido.css'
import Telefono from '../../../assets/img/telefono-inteligente.png'
import Sms from '../../../assets/img/chat-de-sms.png'
import email from '../../../assets/img/correo-electronico.png'
import Whatsapp from '../../../assets/img/whatsapp1.png'
import Tiempo from '../../../assets/img/atras-en-el-tiempo.png'
import Cantidad from '../../../assets/img/cantidad.png'
import Filtrar from '../../../assets/img/embudo.png'
import ModoClaro from '../../../assets/img/soleado.png'
import ModoOscuro from '../../../assets/img/modo-oscuro.png'

function AsesorPreferido(){
    const { theme, toggleTheme } = useContext(ThemeContext);

    return(
        <>
            <div className={theme === 'light' ? 'app light' : 'app dark'}>
                <div className="slider">
                    <Navbar />
                    <div className="flex">
                        <SliderClient />
                    </div>
                </div>
                <div className="BarraSuperior">
                        <h1>Asesores</h1>
                        <a className='ButtonTheme' onClick={toggleTheme}><img src={theme === 'light' ? ModoClaro : ModoOscuro} alt="Toggle Theme" /></a>
                    </div>
                <div className="contentAsesor">
                    <div className="contentCardsAsesores">
                        <div className="cardAsesor">
                            <div className="contentImgA">
                                <img src={Tiempo} />
                                <p>0</p>
                            </div>
                            <p>Tiempo</p>
                        </div>
                        <div className="cardAsesor">
                        <div className="contentImgA">
                                <img src={Cantidad} />
                                <p>0</p>
                            </div>
                            <p>Cantidad</p>
                        </div>
                    </div>
                    <div className="ContentA">
                        <div className="barraSuperiorA">
                            <input placeholder="Buscar 🔍" />
                            <button>Filtrar <img src={Filtrar} /></button>
                        </div>
                        <div className="contentAsesoresT">
                            <div className="containerAsesorM">
                                <p>Asesor más contactado</p>
                                <div className="contentAsesores">
                                    <div className="contentAsesorN">
                                        <p>Luis</p>
                                        <div className="contentButtonA">
                                            <button><img src={Telefono} /></button>
                                            <button><img src={Sms} /></button>
                                            <button><img src={email} /></button>
                                            <button><img src={Whatsapp} /></button>
                                        </div>
                                    </div>
                                    <div className="contentAsesorN">
                                        <p>Luis</p>
                                        <div className="contentButtonA">
                                            <button><img src={Telefono} /></button>
                                            <button><img src={Sms} /></button>
                                            <button><img src={email} /></button>
                                            <button><img src={Whatsapp} /></button>
                                        </div>
                                    </div>
                                    <div className="contentAsesorN">
                                        <p>Luis</p>
                                        <div className="contentButtonA">
                                            <button><img src={Telefono} /></button>
                                            <button><img src={Sms} /></button>
                                            <button><img src={email} /></button>
                                            <button><img src={Whatsapp} /></button>
                                        </div>
                                    </div>
                                    <div className="contentAsesorN">
                                        <p>Luis</p>
                                        <div className="contentButtonA">
                                            <button><img src={Telefono} /></button>
                                            <button><img src={Sms} /></button>
                                            <button><img src={email} /></button>
                                            <button><img src={Whatsapp} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="containerAsesorU">
                                    <p>Último Asesor</p>
                                    <div className="contentAsesores">
                                        <div className="contentAsesorN">
                                            <p>Luis</p>
                                            <div className="contentButtonA">
                                                <button><img src={Telefono} /></button>
                                                <button><img src={Sms} /></button>
                                                <button><img src={email} /></button>
                                                <button><img src={Whatsapp} /></button>
                                            </div>
                                        </div>
                                        <div className="contentAsesorN">
                                            <p>Luis</p>
                                            <div className="contentButtonA">
                                                <button><img src={Telefono} /></button>
                                                <button><img src={Sms} /></button>
                                                <button><img src={email} /></button>
                                                <button><img src={Whatsapp} /></button>
                                            </div>
                                        </div>
                                        <div className="contentAsesorN">
                                            <p>Luis</p>
                                            <div className="contentButtonA">
                                                <button><img src={Telefono} /></button>
                                                <button><img src={Sms} /></button>
                                                <button><img src={email} /></button>
                                                <button><img src={Whatsapp} /></button>
                                            </div>
                                        </div>
                                        <div className="contentAsesorN">
                                            <p>Luis</p>
                                            <div className="contentButtonA">
                                                <button><img src={Telefono} /></button>
                                                <button><img src={Sms} /></button>
                                                <button><img src={email} /></button>
                                                <button><img src={Whatsapp} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
export default AsesorPreferido