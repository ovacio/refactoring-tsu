import { PUBLIC_ROUTES } from "../constants/routes/routes";

export const redirectToLogin = () => {
    window.location.href = PUBLIC_ROUTES.LOGIN;
};

export const redirectToServerError = () => {
    window.location.href = PUBLIC_ROUTES.SERVER_ERROR;
};