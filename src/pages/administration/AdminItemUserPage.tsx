import styles from "./styles/AdminUsersPage.module.css"
import {Link, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import React, {useEffect, useState} from "react";
import {ContactTypes, Gender, ProfileDto} from "../../services/profile.service.ts";
import {FileService} from "../../services/file.service.ts";
import {AvatarUpdateDto, UserService} from "../../services/user.service.ts";
import {AvatarCropModal} from "../../components/profile/AvatarCropModal.tsx";
import defaultAvatar from "../../assets/jpg/default_avatar.jpg";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "../../constants/routes/routes.ts";
import { BREADCRUMB_SEPARATOR } from "../../constants/event-constants/event.constants.ts";


export const AdminItemUserPage = () => {
    const { t: i18next } = useTranslation('common');
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<ProfileDto | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCroppedImage = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'avatar.jpg');

        const { data } = await FileService.upload(formData);
        if (profile?.id) {
            const dto: AvatarUpdateDto  = {
                fileId: data.id
            }
            await UserService.updateUserAvatar(profile?.id, dto);
        }
        window.location.reload();
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!userId) {
                    console.error("User ID is missing");
                    return;
                }

                const { data } = await UserService.getItemUser(userId);
                setProfile(data);

                if (!data.avatar?.id) {
                    setAvatarUrl(defaultAvatar);
                    return;
                }

                const pictureObjectUrl = await fetchFileById(data.avatar.id);
                setAvatarUrl(pictureObjectUrl);

                return () => {
                    if (pictureObjectUrl) URL.revokeObjectURL(pictureObjectUrl);
                };
            } catch (error) {
                console.error("Ошибка загрузки профиля:", error);
                setAvatarUrl(defaultAvatar);
            }
        };

        fetchProfile();
    }, [userId]);

    return(
        <div className={styles.item_user_page}>
            <h1 className={styles.title}>{i18next("administration.administration")}</h1>

            <div className={styles.breadcrumb}>
                <Link to={PUBLIC_ROUTES.PROFILE} className={styles.breadcrumb_link}>
                    {i18next("common.main")}
                </Link>
                <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                <Link to={ADMIN_ROUTES.ADMIN} className={styles.breadcrumb_link}>
                    {i18next("administration.administration")}
                </Link>
                <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                <Link to={ADMIN_ROUTES.ADMIN_USERS} className={styles.breadcrumb_link}>
                    {i18next("administration.users")}
                </Link>
                <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                <Link to={ADMIN_ROUTES.ADMIN_USERS} className={styles.breadcrumb_active}>
                    <p>{profile?.firstName} {profile?.lastName} {profile?.patronymic}</p>
                </Link>
            </div>

            <h2 className={`${styles.title_name}`}>
                {profile?.firstName} {profile?.lastName} {profile?.patronymic}
            </h2>

            <div className={styles.main_data_container}>
                <div>
                    <label>
                        <img src={avatarUrl} alt="avatar" className={styles.image} style={{cursor: 'pointer'}}/>
                        <input type="file" accept="image/*" onChange={handleImageChange} hidden/>
                    </label>
                    {selectedImage && (
                        <AvatarCropModal
                            imageSrc={selectedImage}
                            onClose={() => setSelectedImage(null)}
                            onCropComplete={handleCroppedImage}
                        />
                    )}
                </div>

                <div className={styles.left_data_container}>
                    <div className={styles.section}>
                        <p className={styles.section_header_text}>{i18next("administration.data")}</p>

                        <div className={styles.section_item_block}>
                            <p className={styles.section_name_text}>{i18next("profile.gender")}:</p>
                            <p className={styles.section_base_text}>{profile?.gender == Gender.Female ? "Женский" : profile?.gender == Gender.Male ? "Мужской" : "Не определен"}</p>
                        </div>

                        <div className={styles.section_item_block}>
                            <p className={styles.section_name_text}>{i18next("profile.birthday")}:</p>
                            <p className={styles.section_base_text}>{profile?.birthDate}</p>
                        </div>

                        <div className={styles.section_item_block}>
                            <p className={styles.section_name_text}>{i18next("profile.email")}:</p>
                            <p className={styles.section_base_text}>{profile?.email}</p>
                        </div>

                    </div>

                    <div className={styles.section}>
                        <p className={styles.section_header_text}>{i18next("profile.contacts")}</p>

                        {profile?.contacts?.map((contact, index) => (
                            <div key={index} className={styles.section_item_block}>
                                <p className={styles.section_name_text}>
                                    {contact.type === ContactTypes.Phone
                                        ? i18next("profile.phone")
                                        : contact.type === ContactTypes.Email
                                            ? i18next("profile.additional_email")
                                            : contact.type === ContactTypes.SocialMedia
                                                ? i18next("profile.social_media")
                                                : i18next("profile.add_info")}:
                                </p>
                                <p className={styles.section_base_text}>{contact.value}</p>
                            </div>
                        ))}

                        <div className={styles.section_item_block}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export async function fetchFileById(fileId: string): Promise<string> {
    try {
        const response = await FileService.getFile(fileId)
        const avatarUrl = URL.createObjectURL(response.data);
        return avatarUrl;
    } catch (error) {
        console.error('Ошибка при получении файла', error);
        throw error;
    }
}