import styles from './styles/AddServiceModal.module.css';
import CloseModal from "../../assets/icons/CloseModal.tsx";
import {useTranslation} from "react-i18next";
import {ItemInput} from "../common/ui/input/ItemInput.tsx";
import {useEffect, useState} from "react";
import {
    UsefulServiceCategory, UsefulServiceDto,
    UsefulServiceEditCreateDto,
    UsefulServicesService
} from "../../services/useful_services.service.ts";
import {useRequest} from "../../hooks/useRequest.ts";
import ImageUpload from "./ImageUpload.tsx";
import {useNotification} from "../../context/NotificationContext.tsx";
import {fetchFileById} from "../../pages/administration/AdminItemUserPage.tsx";
import { EMPTY_STRING } from '../../constants/event-constants/event.constants.ts';

export const AddServiceModal = ({ isOpen, onClose, onSuccess, serviceToEdit}: { isOpen: boolean, onClose: () => void, onSuccess: () => void, serviceToEdit?: UsefulServiceDto | null;}) => {
    const { t: i18next } = useTranslation('common');
    const { request } = useRequest();
    const { notify } = useNotification();

    const [title, setTitle] = useState(EMPTY_STRING);
    const [link, setLink] = useState(EMPTY_STRING);
    const [category, setCategory] = useState("ForAll");
    const [description, setDescription] = useState(EMPTY_STRING);
    const [termsOfDisctribution, setTermsOfDisctribution] = useState(EMPTY_STRING);
    const [logoId, setLogoId] = useState<string | null>(null);

    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoName, setLogoName] = useState<string | null>(null);

    const [havePhoto, setHavePhoto] = useState<boolean>(false);

    useEffect(() => {
        const loadImage = async () => {
            if (serviceToEdit?.logo?.id) {
                try {
                    const pictureObjectUrl = await fetchFileById(serviceToEdit.logo.id);
                    setLogoUrl(pictureObjectUrl);
                    setLogoName(serviceToEdit.logo.name);
                    setHavePhoto(true);
                } catch (err) {
                    console.error("Ошибка при получении логотипа", err);
                }
            } else {
                setLogoUrl(null);
                setLogoName(null);
            }
        };

        loadImage();
    }, [serviceToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (title.length <= 0) {
            notify('warning', i18next("services.title_validation"));
            return;
        }


        const finalLogo = havePhoto ? logoId ? logoId : serviceToEdit?.logo?.id? serviceToEdit?.logo?.id  : null : null

        const dto: UsefulServiceEditCreateDto = {
            category,
            title,
            description,
            link,
            termsOfDisctribution,
            logoId: finalLogo,
        };

        if (serviceToEdit?.id) if (serviceToEdit.logo?.id) setHavePhoto(true)

        const requestFn = serviceToEdit
            ? UsefulServicesService.editService(serviceToEdit.id, dto)
            : UsefulServicesService.createService(dto);

        await request(
            requestFn,
            {
                successMessage: i18next("services.success"),
                onSuccess: () => {
                    onClose();
                    onSuccess();
                }
            }
        );
    };


    useEffect(() => {
        if (serviceToEdit) {
            setTitle(serviceToEdit.title);
            setLink(serviceToEdit.link || EMPTY_STRING);
            setCategory(serviceToEdit.category);
            setDescription(serviceToEdit.description || EMPTY_STRING);
            setTermsOfDisctribution(serviceToEdit.termsOfDisctribution || EMPTY_STRING);
            setLogoId(logoId || null);
        } else {
            setTitle(EMPTY_STRING);
            setLink(EMPTY_STRING);
            setCategory("ForAll");
            setDescription(EMPTY_STRING);
            setTermsOfDisctribution(EMPTY_STRING);
            setLogoId(null);
        }
    }, [serviceToEdit, isOpen]);

    if (!isOpen) return null;

    const handlePhoto = (id: string | null) => {
        setLogoId(id);
        if (id == null) {
            setHavePhoto(false)
        }
        else {
            setHavePhoto(true);
        }
    }

    return (
        <div className={styles.modal_overlay}>
            <div className={styles.modal}>
                <CloseModal onClick={onClose} className={styles.close_button}/>

                <p className={styles.modal_title}>{i18next("services.adding")}</p>

                <form onSubmit={handleSubmit} className={styles.modal_form}>
                    <ItemInput
                        label={i18next("services.name")}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <ItemInput
                        label={i18next("services.link")}
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />

                    <div className={styles.input_wrapper}>
                        <label className={styles.label_choose}>{i18next("services.type")}</label>
                        <select className={styles.item_input_choose} value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value={UsefulServiceCategory.ForAll}>Общий</option>
                            <option value={UsefulServiceCategory.Students}>Для студентов</option>
                            <option value={UsefulServiceCategory.Employees}>Для сотрудников</option>
                        </select>
                    </div>

                    <ItemInput
                        label={i18next("services.description")}
                        type="textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <ItemInput
                        label={i18next("services.condition")}
                        type="textarea"
                        value={termsOfDisctribution}
                        onChange={(e) => setTermsOfDisctribution(e.target.value)}
                    />
                    <ImageUpload
                        onUpload={handlePhoto}
                        initialImageUrl={logoUrl}
                        initialFileName={logoName}
                    />


                    <div className={styles.buttons_container}>
                        <button className={styles.button_primary} type="submit">{i18next("common.save")}</button>
                        <button className={styles.button_outlined} onClick={onClose}>{i18next("common.cancel")}</button>
                    </div>

                </form>
            </div>
        </div>
    );
};

