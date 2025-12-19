export const apiErrorMap: Record<string, string> = {
    'EMAIL_REQUIRED': 'El correo electrónico es obligatorio.',
    'EMAIL_INVALID': 'El correo electrónico no es válido.',
    'EMAIL_UNIQUE': 'Este correo electrónico no está disponible.',

    'USERNAME_REQUIRED': 'El nombre de usuario es obligatorio.',
    'USERNAME_UNIQUE': 'Este nombre de usuario no está disponible.',
    'USERNAME_MAX': 'El nombre de usuario es demasiado largo.',
    'USERNAME_ALPHA_DASH': 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.',

    'PASSWORD_REQUIRED': 'La contraseña es obligatoria.',
    'PASSWORD_MUST_BE_STRING': 'La contraseña debe ser un texto.',
    'PASSWORD_CONFIRMATION_REQUIRED': 'La confirmación de la contraseña es obligatoria.',
    'PASSWORD_CONFIRMATION_SAME': 'Las contraseñas no coinciden.',
    'PASSWORD_MIN': 'La contraseña debe tener al menos 8 caracteres.',
    'PASSWORD_MIXEDCASE_REQUIRED': 'La contraseña debe contener mayúsculas y minúsculas.',
    'PASSWORD_NUMBER_REQUIRED': 'La contraseña debe contener al menos un número.',
    'PASSWORD_SYMBOL_REQUIRED': 'La contraseña debe contener al menos un símbolo.',
    'PASSWORD_CONFIRMATION_MISMATCH': 'La confirmación de la contraseña no coincide.',

    'CURRENT_PASSWORD_REQUIRED': 'La contraseña actual es obligatoria.',

    'ROLE_REQUIRED': 'El rol es obligatorio.',
    'ROLE_EXISTS': 'El rol seleccionado no es válido.',

    // Fallback
    'DEFAULT': 'Ha ocurrido un error inesperado.'
};

export const getApiErrorMessage = (code: string): string => {
    return apiErrorMap[code] ?? apiErrorMap['DEFAULT'] ?? 'Ha ocurrido un error inesperado.';
};

export const handleApiError = (toast: any, error: any) => {
    const errorData = error.response?._data;

    if (errorData?.error) {
        // Handle validation errors object
        Object.values(errorData.error).flat().forEach((code: any) => {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: getApiErrorMessage(code),
                life: 3000
            });
        });
    } else if (errorData?.message) {
        // Handle generic message
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorData.message,
            life: 3000
        });
    } else {
        // Handle unknown error
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error al procesar la solicitud.',
            life: 3000
        });
    }
};
