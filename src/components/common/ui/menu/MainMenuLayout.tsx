import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "./Menu.tsx";
import styles from "./MainMenuLayout.module.css";
import { LanguageSwitcher } from "../../../auth/LanguageSwitcher.tsx";
import { useMenu } from "../../../../context/MenuContext.tsx";
import MenuSmall from "../../../../assets/icons/MenuSmall";
import { PUBLIC_ROUTES } from "../../../../constants/routes/routes.ts";
import { EMPTY_STRING } from "../../../../constants/event-constants/event.constants.ts";

export const MainMenuLayout = () => {
    const location = useLocation();
    const { isMenuOpen, toggleMenu, isMobile } = useMenu();

    const hideMenuPaths: string[] = [PUBLIC_ROUTES.LOGIN, PUBLIC_ROUTES.SERVER_ERROR];
    const shouldHideMenu = hideMenuPaths.includes(location.pathname);

    const showMobileMenu = isMobile && isMenuOpen;
    const showDesktopMenu = !isMobile && isMenuOpen;

    return (
        <div className={styles.main_menu}>
            {!shouldHideMenu && showDesktopMenu && <Menu />}

            {!shouldHideMenu && isMobile && (
                <>
                    {!isMenuOpen && (
                        <div className={styles.menu_icon_wrapper} onClick={toggleMenu}>
                            <MenuSmall />
                        </div>
                    )}
                    {isMenuOpen && (
                        <>
                            <div className={styles.overlay} onClick={toggleMenu} />
                            <div className={styles.mobile_menu}>
                                <Menu />
                            </div>
                        </>
                    )}
                </>
            )}

            <div className={`${styles.content} ${showMobileMenu ? styles.dimmed : EMPTY_STRING}`}>
                <Outlet />
            </div>

            <LanguageSwitcher />
        </div>
    );
};