
export const saveUserId = (UserId) =>{
    localStorage.setItem('UserId',UserId)
}

export const getUserId = () =>{
    return localStorage.getItem('UserId')
}

export const saveUserRol = (UserRol) => {
    localStorage.setItem('rol-user', UserRol);
};


export const getUserRol = () =>{
    return localStorage.getItem('rol-user')
}

export const clearAuth = () =>{
    localStorage.removeItem('UserId');
    localStorage.removeItem('rol-user')
}

export const isAuthentication = () => {
    return !!getUserId();
}

export const rolAuth = (allowedRoles) => {
    if (!Array.isArray(allowedRoles)) {
        console.error("allowedRoles no es un array válido:", allowedRoles);
        return false; 
    }

    const userRol = getUserRol();
    console.log("Rol del usuario:", userRol); 
    console.log("Roles permitidos:", allowedRoles);

    return allowedRoles.includes(userRol);
   
};
