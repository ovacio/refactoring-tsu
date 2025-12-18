import React, {JSX, useState} from "react";
import styles from "./Menu.module.css";
import MenuProfile from "../../../../assets/icons/MenuProfile";
import MenuAdmin from "../../../../assets/icons/MenuAdmin";
import MenuRef from "../../../../assets/icons/MenuRefs";
import MenuServices from "../../../../assets/icons/MenuServices";
import MenuEvents from "../../../../assets/icons/MenuEvents";
import MenuLeft from "../../../../assets/icons/MenuLeft";
import MenuRight from "../../../../assets/icons/MenuRight";
import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useProfile} from "../../../../context/ProfileContext.tsx";
import {useMenu} from "../../../../context/MenuContext.tsx";
import {getAccessToken, removeAccessToken, removeRefreshToken} from "../../../../auth/cookiesService.ts";
import {parseJwt} from "../../../../api/instance.ts";
import SvgLogout from "../../../../assets/icons/Logout.tsx";
import {AuthService} from "../../../../services/auth.service.ts";
import {useRequest} from "../../../../hooks/useRequest.ts";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "../../../../constants/routes/routes.ts";
import { EMPTY_STRING } from "../../../../constants/event-constants/event.constants.ts";

export const Menu = () => {
    const [open, setOpen] = React.useState(true);
    const { t: i18next } = useTranslation('common');
    const location = useLocation();
    const { avatarUrl } = useProfile();
    const { isMobile, toggleMenu } = useMenu();
    const [showLogoutButton, setShowLogoutButton] = useState(false);

    const token = getAccessToken();
    const parsedToken = token ? parseJwt(token) : null;
    const isAdmin = parsedToken?.role.toString().toLowerCase() === "admin";

    const navigate = useNavigate();
    const { request } = useRequest();

    const handleToggleMenu = () => {
        if (isMobile) {
            toggleMenu();
        }
        else {
            setOpen(prev => !prev);
        }
    };

    interface MenuItem {
        path: string;
        label: string;
        icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
    }

    const menuItems: MenuItem[] = [
        { path: PUBLIC_ROUTES.PROFILE, label: i18next("menu.profile"), icon: MenuProfile },
        isAdmin && { path: ADMIN_ROUTES.ADMIN, label: i18next("menu.administration"), icon: MenuAdmin },
        { path: PUBLIC_ROUTES.CERTIFICATES, label: i18next("menu.certificates"), icon: MenuRef },
        { path: PUBLIC_ROUTES.USEFUL_SERVICES, label: i18next("menu.services"), icon: MenuServices },
        { path: PUBLIC_ROUTES.EVENTS, label: i18next("menu.events"), icon: MenuEvents },
    ].filter(Boolean) as MenuItem[];
    const pathsWithSubroutes = [ADMIN_ROUTES.ADMIN, PUBLIC_ROUTES.EVENTS];

    const logout = async () => {
        try {
            await request(AuthService.logout(), {
                successMessage: i18next("common.success_logout")
            })
            await AuthService.revoke();

            removeAccessToken();
            removeRefreshToken();

            navigate(PUBLIC_ROUTES.LOGIN);

            //window.location.reload()

        } catch (error) {
            console.error("Ошибка при выходе из системы:", error);
        }
    }

    return (
        <div className={`${styles.menu} ${open ? styles.menu_open : styles.menu_closed}`}>
            <div className={styles.toggleButtonWrapper}>
                {avatarUrl ? <div className={styles.menu_avatar_wrapper}>
                    <img src={avatarUrl} alt="avatar" className={styles.menu_avatar}
                         onClick={() => setShowLogoutButton(!showLogoutButton)}/>
                </div> : <></>}


                <div onClick={handleToggleMenu} className={styles.toggleButton}>
                    {isMobile ? <MenuLeft/> : open ? <MenuLeft/> : <MenuRight/>}
                </div>
            </div>
            <div className={styles.toggleButtonWrapper}>
                {showLogoutButton ? <button className={styles.logout_button}
                        onClick={logout}
                >
                    <p className={styles.logout_text}>{i18next("common.logout")}</p>
                    <SvgLogout/>
                </button> : <></> }
            </div>


            <ol className={styles.menuList}>
                {menuItems.map(({path, label, icon: Icon}) => {
                    const isActive = pathsWithSubroutes.some(p => path.startsWith(p))
                        ? location.pathname.startsWith(path)
                        : location.pathname === path;
                    return (
                        <li key={path} className={isActive ? styles.activeItem : EMPTY_STRING}>
                            <NavLink to={path} className={styles.menuLink} onClick={isMobile ? toggleMenu : undefined}>
                                <Icon
                                    stroke={isActive ? "#375FFF" : "#000"}
                                    enableBackground={isActive ? "#375FFF1A" : "#000"}
                                />
                                {open && <span>{label}</span>}
                            </NavLink>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};