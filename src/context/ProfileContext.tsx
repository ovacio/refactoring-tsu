import React, { createContext, useContext, useEffect, useState } from "react";
import { ProfileDto, ProfileService } from "../services/profile.service";
import {getRefreshToken} from "../auth/cookiesService.ts";
import {fetchFileById} from "../pages/administration/AdminItemUserPage.tsx";
import defaultAvatar from "../assets/jpg/default_avatar.jpg";
import { EMPTY_STRING } from "../constants/event-constants/event.constants.ts";

interface ProfileContextType {
    profile: ProfileDto | null;
    avatarUrl: string;
}

const ProfileContext = createContext<ProfileContextType>({
    profile: null,
    avatarUrl: defaultAvatar,
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<ProfileDto | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>(EMPTY_STRING);

    useEffect(() => {
        const hasRefreshToken = getRefreshToken();
        if (!hasRefreshToken) return;

        const fetchProfile = async () => {
            try {
                const { data } = await ProfileService.getProfile();
                setProfile(data);

                if (!data.avatar?.id) {
                    setAvatarUrl(defaultAvatar);
                    return;
                }

                const pictureObjectUrl = await fetchFileById(data.avatar.id)
                setAvatarUrl(pictureObjectUrl || defaultAvatar);

                return () => {
                    if (pictureObjectUrl) URL.revokeObjectURL(pictureObjectUrl);
                };
            } catch (error) {
                console.error("Ошибка загрузки профиля:", error);
                setAvatarUrl(defaultAvatar);
            }
        };

        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, avatarUrl }}>
            {children}
        </ProfileContext.Provider>
    );
};