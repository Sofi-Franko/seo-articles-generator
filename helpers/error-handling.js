export const throwCustomError = (code, message, defaultMessage = "MISSING_DEFAULT_MESSAGE") => {
    return {
        code,
        message: message || `An unknown error occurred while << ${defaultMessage} >>`,
    };
}
