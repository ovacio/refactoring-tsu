import "./utils/i18n/config.ts";
import {Routes, Route, Navigate} from "react-router-dom";
import { AuthorizationPage } from "./pages/AuthorizationPage.tsx";
import { ErrorPage } from "./pages/ErrorPage.tsx";
import {ProfilePage} from "./pages/ProfilePage.tsx";
import {AdministrationPage} from "./pages/administration/AdministrationPage.tsx";
import {ServicesPage} from "./pages/ServicesPage.tsx";
import {CertificatesPage} from "./pages/CertificatesPage.tsx";
import {EventsPage} from "./pages/EventsPage.tsx";
import {MainMenuLayout} from "./components/common/ui/menu/MainMenuLayout.tsx";
import {AdminEventsPage} from "./pages/administration/AdminEventsPage.tsx";
import {AdminServicesPage} from "./pages/administration/AdminServicesPage.tsx";
import {AdminUsersPage} from "./pages/administration/AdminUsersPage.tsx";
import {AdminItemUserPage} from "./pages/administration/AdminItemUserPage.tsx";
import {AdminAddEventPage} from "./pages/administration/AdminAddEventPage.tsx";
import {AdminEditEventPage} from "./pages/administration/AdminEditEventPage.tsx";
import {AdminItemEventPage} from "./pages/administration/AdminItemEventPage.tsx";
import {EventItemPage} from "./pages/EventItemPage.tsx";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "./constants/routes/routes.ts";
import { HTTP_STATUS } from "./constants/http-status/http-status.ts";

function App() {
    return (
        <Routes>
            <Route path={PUBLIC_ROUTES.DEFAULT} element={<Navigate to={PUBLIC_ROUTES.LOGIN} replace />} />
            <Route path={PUBLIC_ROUTES.LOGIN} element={<AuthorizationPage />} />
            <Route path={PUBLIC_ROUTES.SERVER_ERROR} element={<ErrorPage errorCode={HTTP_STATUS.INTERNAL_SERVER_ERROR} />} />
            <Route path={PUBLIC_ROUTES.NOT_FOUND} element={<ErrorPage errorCode={HTTP_STATUS.NOT_FOUND} />} />

            <Route element={<MainMenuLayout />}>
                <Route path={PUBLIC_ROUTES.PROFILE} element={<ProfilePage />} />

                <Route path={ADMIN_ROUTES.ADMIN} element={<AdministrationPage />} />
                <Route path={ADMIN_ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
                <Route path={ADMIN_ROUTES.ADMIN_USER(":userId")}element={<AdminItemUserPage />} />
                <Route path={ADMIN_ROUTES.ADMIN_USEFUL_SERVICES} element={<AdminServicesPage />} />
                <Route path={ADMIN_ROUTES.ADMIN_EVENTS} element={<AdminEventsPage />} />
                <Route path={ADMIN_ROUTES.ADMIN_EVENTS_CREATE} element={<AdminAddEventPage />} />
                <Route path={ADMIN_ROUTES.ADMIN_EVENTS_EDIT(":eventId")} element={<AdminEditEventPage />} />
                <Route path={ADMIN_ROUTES.ADMIN_EVENT(":eventId")} element={<AdminItemEventPage/>} />


                <Route path={PUBLIC_ROUTES.USEFUL_SERVICES} element={<ServicesPage />} />
                <Route path={PUBLIC_ROUTES.CERTIFICATES} element={<CertificatesPage />} />
                <Route path={PUBLIC_ROUTES.EVENTS} element={<EventsPage />} />
                <Route path={PUBLIC_ROUTES.EVENT(":eventId")} element={<EventItemPage/>} />
            </Route>
        </Routes>
    )
}

export default App;