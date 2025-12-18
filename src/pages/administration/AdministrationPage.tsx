import styles from "./styles/AdministrationPage.module.css";
import { useTranslation } from "react-i18next";
import Users from "../../assets/icons/Users.tsx";
import Events from "../../assets/icons/Events.tsx";
import LinkIcon from "../../assets/icons/LinkIcon.tsx";
import {Link, useNavigate} from "react-router-dom";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "../../constants/routes/routes.ts";
import { BREADCRUMB_SEPARATOR } from "../../constants/event-constants/event.constants.ts";

export const AdministrationPage = () => {
    const { t: i18next } = useTranslation('common');
    const navigate = useNavigate();

    const cards = [
        {
            title: i18next("administration.users"),
            description: i18next("administration.users_fish"),
            icon: Users,
            path: ADMIN_ROUTES.ADMIN_USERS,
        },
        {
            title: i18next("administration.services"),
            description: i18next("administration.services_fish"),
            icon: LinkIcon,
            path: ADMIN_ROUTES.ADMIN_USEFUL_SERVICES,
        },
        {
            title: i18next("administration.events"),
            description: i18next("administration.events_fish"),
            icon: Events,
            path: ADMIN_ROUTES.ADMIN_EVENTS,
        },
    ];

    return (
        <div className={styles.admin_page}>
            <h1 className={styles.title}>{i18next("administration.administration")}</h1>
                <div className={styles.breadcrumb}>
                    <Link to={PUBLIC_ROUTES.PROFILE} className={styles.breadcrumb_link}>
                        {i18next("common.main")}
                    </Link>
                    <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                    <Link to={ADMIN_ROUTES.ADMIN} className={styles.breadcrumb_active}>
                        {i18next("administration.administration")}
                    </Link>
                </div>


            <div className={styles.cards}>
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className={styles.card}
                        onClick={() => navigate(card.path)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') navigate(card.path);
                        }}
                    >
                        <div className={styles.card_header}>
                            <span className={styles.card_icon}><card.icon></card.icon></span>
                            <span className={styles.card_title}>{card.title}</span>
                        </div>
                        <p className={styles.card_description}>{card.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};