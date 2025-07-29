import React, { useEffect, useState } from 'react';
import './styles/App.css'
import { PrivateRouter } from './components/PrivateRouter/PrivateRouter';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login1';
import Home from './components/Home/Home';
import Register from './components/Register/Register';
import Chanells from './components/Admin/Chanels/Chanels';
import Directory from './components/Admin/Directory/Directory';
import FlowsBuilder from './components/Admin/FlowsBuilder/FlowsBuilder';
import Numbers from './components/Admin/Numbers/Numbers';
import Dashboard from './components/Admin/dashboard/dashboar';
import Nosotros from './components/Nosotros/Nosotros';
import DashboardClient from './components/Client/DashboardClient/DashboardClient';
import PerfilUser from './components/Client/Perfil/PerfilUser';
import Conversaciones from './components/Client/ConversacionesRecientes/Conversaciones';
import AsesorPreferido from './components/Client/asesorPreferido/AsesorPreferido';
import EditarPerfil from './components/Client/Perfil/EditarPerfil/EditarPerfil';
import ChatsMessenger from './components/Client/ConversacionesRecientes/ChatsMessenger/ChatsMessenger';
import DashboardEmploye from './components/employee/dashboardEmploye/DashboardEmploye';
import PerfilEmpleado from './components/employee/perfilEmpleado/perfilEmpleado';
import EditarPerfilEmpleado from './components/employee/perfilEmpleado/EditarPefilEmpleado/EditarPerfilEmpleado';
import DataEmpleado from './components/Admin/FlowsBuilder/Empleado/DataEmpleado';
import DataCliente from './components/Admin/FlowsBuilder/Cliente/DataCliente';
import CreatedEmple from './components/Admin/FlowsBuilder/Empleado/CreatedEmple';
import CreatedClient from './components/Admin/FlowsBuilder/Cliente/CreateClient';
import ActualizarClient from './components/Admin/FlowsBuilder/Cliente/ActualizarClient';
import ActualizarEmple from './components/Admin/FlowsBuilder/Empleado/ActualizarEmple';
import ClientsData from './components/employee/Cliente/Clients';
import ActualizaClientData from './components/employee/Cliente/ActualizarClientData';
import NewClient from './components/employee/Cliente/NewClient';
import PerfilAdmin from './components/Admin/Perfil/perfilAdmin';
import EditarPerfilAdmin from './components/Admin/Perfil/EditaPerfilAdmin/EditaPerfilAdmin';
import ChatBotEmple from './components/employee/ChatBotEmple/ChatBotEmple';
import WhatsappEmple from './components/employee/ChatBotEmple/WhatsappEmple/WhatsappEmple';
import TelegramEmple from './components/employee/ChatBotEmple/TelegramEmple/TelegramEmple';
import MessengerEmple from './components/employee/ChatBotEmple/MessengerEmple/MessengerEmple';
import InstagramEmple from './components/employee/ChatBotEmple/InstagramEmple/InstagramEmple';
import ReportClient from './components/Admin/Directory/Reportes/ReportClient';
import ReportEmple from './components/Admin/Directory/Reportes/ReportEmple';
import ReportHistoryMessage from './components/Admin/Directory/Reportes/ReportHistoryMessage';
import LocalEmple from './components/employee/ChatBotEmple/LocalEmple/LocalEmple';

function App() {
  return (
    <div>
    <Routes>
      {/* rutas publicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/nosotros' element={<Nosotros />} />

      {/*Rutas Privadas y admin*/}
      <Route path='/dashboard' element={ 
            <PrivateRouter allowedRoles={[1]}>
              <Dashboard />
            </PrivateRouter>
          } 
        />
      <Route path='/chat-chanells' element={
            <PrivateRouter allowedRoles={[1]}>
              <Chanells />
            </PrivateRouter>
          } />
      <Route path='/directorio' element={
            <PrivateRouter allowedRoles={[1]}>
              <Directory />
            </PrivateRouter>
          } />
      <Route path='/flow-build' element={
            <PrivateRouter allowedRoles={[1]}>
              <FlowsBuilder />
            </PrivateRouter>
          } />
      <Route path='/numbers' element={
            <PrivateRouter allowedRoles={[1]}>
              <Numbers />
            </PrivateRouter>
          } />
      <Route path='/editar-perfil-admin/:id' element={
            <PrivateRouter allowedRoles={[1]}>
              <EditarPerfilAdmin />
            </PrivateRouter>
          } />
      <Route path='/perfil-Admin' element={
            <PrivateRouter allowedRoles={[1]}>
              <PerfilAdmin />
            </PrivateRouter>
          } />
      
      <Route path='/data-empleado' element={
            <PrivateRouter allowedRoles={[1]}>
              <DataEmpleado />
            </PrivateRouter>
          } />

      <Route path='/data-cliente' element={
            <PrivateRouter allowedRoles={[1]}>
              <DataCliente />
            </PrivateRouter>
          } />
      <Route path='/update-client/:id' element={
            <PrivateRouter allowedRoles={[1]}>
              <ActualizarClient />  
            </PrivateRouter>
          } />
      <Route path='/update-emple/:id' element={
            <PrivateRouter allowedRoles={[1]}>
              <ActualizarEmple />
            </PrivateRouter>
          } />
      <Route path='/created-emple' element={
            <PrivateRouter allowedRoles={[1]}>
              <CreatedEmple />
            </PrivateRouter>
          } />
      
      <Route path='/created-client' element={
            <PrivateRouter allowedRoles={[1]}>
              <CreatedClient />
            </PrivateRouter>
          } />

      <Route path='/report-client' element={
          <PrivateRouter allowedRoles={[1]}>
            <ReportClient/>
          </PrivateRouter>
        }/>
      <Route path='/report-emple' element={
        <PrivateRouter allowedRoles={[1]}>
          <ReportEmple/>
        </PrivateRouter>
      }/>
      <Route path='/report-historyMessage' element={
        <PrivateRouter allowedRoles={[1]}>
          <ReportHistoryMessage/>
        </PrivateRouter>
      }/>

      {/* cliente */}
      <Route path='/dashboard-client' element={
            <PrivateRouter allowedRoles={[3]}>
              <DashboardClient />
            </PrivateRouter>
          } />
      <Route path='/perfil-user' element={
            <PrivateRouter allowedRoles={[3]}>
              <PerfilUser />
            </PrivateRouter>
          } />
      <Route path='/conversaciones' element={
            <PrivateRouter allowedRoles={[3]}>
              <Conversaciones />
            </PrivateRouter>
          } />
      <Route path='/asesor-preferido' element={
            <PrivateRouter allowedRoles={[3]}>
              <AsesorPreferido />
            </PrivateRouter>
          } />
      <Route path='/editar-perfil/:id' element={
            <PrivateRouter allowedRoles={[3]}>
              <EditarPerfil />
            </PrivateRouter>
          } />
      <Route path='/chats-messenger' element={
            <PrivateRouter allowedRoles={[3]}>
              <ChatsMessenger />
            </PrivateRouter>
          } />

      {/* Empleado */}
      <Route path='/dashboard-employe' element={
            <PrivateRouter allowedRoles={[2]}>
              <DashboardEmploye />
            </PrivateRouter>
          } />

      <Route path='/perfil-empleado' element={
            <PrivateRouter allowedRoles={[2]}>
              <PerfilEmpleado />
            </PrivateRouter>
          } />
      <Route path='/editar-perfil-empleado/:id' element={
            <PrivateRouter allowedRoles={[2]}>
              <EditarPerfilEmpleado />
            </PrivateRouter>
          } />
      
      
      <Route path='/cliente-data' element={
            <PrivateRouter allowedRoles={[2]}>
              <ClientsData />
            </PrivateRouter>
          } />
      <Route path='/update-data-clients/:id' element={
            <PrivateRouter allowedRoles={[2]}>
              <ActualizaClientData />
            </PrivateRouter>
          } />
      <Route path='/new-client' element={
            <PrivateRouter allowedRoles={[2]}>
              <NewClient />
            </PrivateRouter>
          } />
      <Route path='/chatBot-emple' element={
            <PrivateRouter allowedRoles={[2]}>
              <ChatBotEmple />
            </PrivateRouter>
          }/>
      <Route path='/whatsapp-emple' element={
            <PrivateRouter allowedRoles={[2]}>
              <WhatsappEmple />
            </PrivateRouter>
          }/>
      <Route path='/telegram-emple' element={
            <PrivateRouter allowedRoles={[2]}>
              <TelegramEmple/>
            </PrivateRouter>
          }/>
      <Route path='/messenger-emple' element={
            <PrivateRouter allowedRoles={[2]}>
              <MessengerEmple/>
            </PrivateRouter>
          }/>
      <Route path='/instagram-emple' element={
            <PrivateRouter allowedRoles={[2]}>
              <InstagramEmple/>
            </PrivateRouter>
          }/>
      <Route path='/local-emple' element={
            <PrivateRouter allowedRoles={[2]}>
              <LocalEmple/>
            </PrivateRouter>
          }/>
    </Routes>
  </div>
  );
}

export default App;
