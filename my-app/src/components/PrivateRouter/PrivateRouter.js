import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthentication, rolAuth } from "../../utils/auth.js";

export const PrivateRouter = ({ children, allowedRoles }) => {
   const userRol = parseInt(localStorage.getItem('rol-user'));

   if(!isAuthentication()){
    return <Navigate to='/login'/>
   }

   console.log('Roles permitidos: ', allowedRoles )
   console.log('Rol de usuario: ', userRol)
   if(allowedRoles.includes(userRol)){
    console.log('Acceso permitido')
    return children;
   }

   console.log('Accesso denegado. Redirigiendo...')
   return <Navigate to='/Undefined' />
}