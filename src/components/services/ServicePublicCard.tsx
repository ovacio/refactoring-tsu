import {UsefulServiceDto} from "../../services/useful_services.service.ts";
import styles from "../../pages/administration/styles/AdminUsersPage.module.css"
import {fetchFileById} from "../../pages/administration/AdminItemUserPage.tsx";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import defaultAvatar from "../../assets/jpg/default_avatar.jpg";
import LinkUsefulService from "../../assets/icons/LinkUsefulService.tsx";
import {useNotification} from "../../context/NotificationContext.tsx";
import { useMediaQuery } from 'react-responsive';

interface ServicePublicCardProps {
    service: UsefulServiceDto;
}

export const ServicePublicCard = (props: ServicePublicCardProps) => {
    const { t: i18next } = useTranslation('common');
    const { notify } = useNotification();

    const [serviceImageUrl, setServiceImageUrl] = useState<string | undefined>();

    const isMobile = useMediaQuery({ maxWidth: 600 });

    const handleServiceLinkClick = (link: string) => {
        try {
            const pictureObjectUrl = new URL(link);

            if (!['http:', 'https:'].includes(pictureObjectUrl.protocol)) {
                notify('error', i18next("services.invalid_link_protocol"));
                return;
            }

            window.open(link, '_blank', 'noopener,noreferrer');
        } catch (e) {

            notify('error', i18next("services.invalid_link"));
        }
    };

    useEffect(() => {
        const fetchImage = async () => {
            if (!props.service || !props.service.id) return;

            if (props.service.logo !== null) {
                const pictureObjectUrl = await fetchFileById(props.service.logo.id);
                setServiceImageUrl(pictureObjectUrl);
            }
            else {
                setServiceImageUrl(defaultAvatar);
            }

        };
        if (props.service) {
            fetchImage();
        }
    }, []);

    return(
        <div className={styles.item_public_service}>
            {!isMobile ?
                <>
                    <div className={styles.item_public_header}>
                        <p className={styles.title_service}>{props.service.title}</p>

                        <button
                            type="button"
                            className={styles.search_button}
                            onClick={() => handleServiceLinkClick(props.service.link)}
                        >
                            {i18next("services.link_service")}
                            <LinkUsefulService/>
                        </button>
                    </div>

                    <div className={styles.public_service_main_part}>
                        <div className={styles.service_image}>
                            <img src={serviceImageUrl} alt="picture" className={styles.service_image}/>
                        </div>

                        <div className={styles.section_container}>

                            <div className={styles.section_item_block}>
                                <div className={styles.section_base_text}>{props.service.description}</div>
                            </div>

                            <div className={styles.section_item_block}>
                                <div className={styles.section_name_text}>{i18next("services.condition")}</div>
                                <div className={styles.section_base_text}>{props.service.termsOfDisctribution}</div>
                            </div>
                        </div>
                    </div>
                </> :
                <div className={styles.public_service_mobile_container}>
                    <div className={styles.service_public_image}>
                        <img src={serviceImageUrl} alt="picture" className={styles.service_image}/>
                    </div>

                    <p className={styles.title_service}>{props.service.title}</p>

                    <div className={styles.section_item_block}>
                        <div className={styles.section_base_text}>{props.service.description}</div>
                    </div>

                    <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>{i18next("services.condition")}</div>
                        <div className={styles.section_base_text}>{props.service.termsOfDisctribution}</div>
                    </div>

                    <button
                        type="button"
                        className={styles.link_button}
                        onClick={() => handleServiceLinkClick(props.service.link)}
                    >
                        {i18next("services.link_service")}
                        <LinkUsefulService/>
                    </button>

                </div>

            }

        </div>
    )
}