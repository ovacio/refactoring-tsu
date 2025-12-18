import {useTranslation} from "react-i18next";
import {useRequest} from "../../hooks/useRequest.ts";
import styles from "./styles/AdminAddEventPage.module.css";
import {Link, useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    EventAuditory,
    EventEditDto,
    EventFormat,
    EventService,
    EventType
} from "../../services/event.service.ts";
import {useNotification} from "../../context/NotificationContext.tsx";
import {ItemInput} from "../../components/common/ui/input/ItemInput.tsx";
import ItemEditor from "../../components/admin/ItemEditor.tsx";
import {DateTimePicker} from "../../components/admin/DateTimePicker.tsx";
import {ItemSwitch} from "../../components/common/ui/switch/ItemSwitch.tsx";
import ImageUpload from "../../components/admin/ImageUpload.tsx";
import {fetchFileById} from "./AdminItemUserPage.tsx";
import {AddressInput} from "../../components/admin/AddressInput.tsx";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "../../constants/routes/routes.ts";
import { BREADCRUMB_SEPARATOR, EMPTY_STRING, FORMAT_TEXTS } from "../../constants/event-constants/event.constants.ts";

export const AdminEditEventPage = () => {
    const { t: i18next } = useTranslation('common');
    const { request } = useRequest();
    const navigate = useNavigate();
    const { notify } = useNotification();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);

    const [eventName, setEventName] = useState(EMPTY_STRING);
    const [eventDescription, setEventDescription] = useState(EMPTY_STRING);
    const [isRegistrationRequired, setIsRegistrationRequired] = useState(false);
    const [eventAddress, setEventAddress] = useState(EMPTY_STRING);

    const [eventType, setEventType] = useState<EventType | undefined>();
    const [eventFormat, setEventFormat] = useState<EventFormat | undefined>();
    const [eventAudience, setEventAudience] = useState<EventAuditory | undefined>();

    const [eventLongitude, setEventLongitude] = useState<number>();
    const [eventLatitude, setEventLatitude] = useState<number>();

    const [eventLink, setEventLink] = useState(EMPTY_STRING);
    const [eventNotification, setEventNotification] = useState(EMPTY_STRING);
    const [isDigestNeeded, setIsDigestNeeded] = useState(false);
    const [eventDigest, setEventDigest] = useState(EMPTY_STRING);
    const [eventStartDate, setEventStartDate] = useState<Date | null>(null);
    const [eventEndDate, setEventEndDate] = useState<Date | null>(null);
    const [isTimeFromNeeded, setIsTimeFromNeeded] = useState(true);
    const [isTimeToNeeded, setIsTimeToNeeded] = useState(false);
    const [registrationLastDate, setRegistrationLastDate] = useState<Date | null>(null);

    const [eventLogoId, setEventLogoId] = useState<string | null>(null);
    const [eventLogoUrl, setEventLogoUrl] = useState<string | null>(null);
    const [eventLogoName, setEventLogoName] = useState<string | null>(null);
    const [havePhoto, setHavePhoto] = useState<boolean>(false);

    const handlePhoto = (id: string | null) => {
        setEventLogoId(id);
        setHavePhoto(!!id);
    };

    const handleAddressChange = (selected: any) => {
        setEventAddress(selected.value);

        if (selected?.data?.geo_lat && selected?.data?.geo_lon) {
            setEventLatitude(selected.data.geo_lat);
            setEventLongitude(selected.data.geo_lon);
        } else {
            setEventLatitude(undefined);
            setEventLongitude(undefined);
        }

        if (!selected || selected === EMPTY_STRING) {
            setEventLatitude(undefined);
            setEventLongitude(undefined);
        }
    };

    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                const data = await request(EventService.getEventById(id));

                console.log(data)

                if (data) {
                    setEventName(data.data.title);
                    setEventDescription(data.data.description);
                    setEventDigest(data.data.digestText ?? EMPTY_STRING);
                    setEventLogoId(data.data.picture?.id ?? null);
                    setHavePhoto(!!data.data.picture);
                    setIsTimeFromNeeded(data.data.isTimeFromNeeded);
                    setEventStartDate(data.data.dateTimeFrom ? new Date(data.data.dateTimeFrom) : null);
                    setIsTimeToNeeded(data.data.isTimeToNeeded);
                    setEventEndDate(data.data.dateTimeTo ? new Date(data.data.dateTimeTo) : null);
                    setEventLink(data.data.link ?? EMPTY_STRING);
                    setEventAddress(data.data.addressName ?? EMPTY_STRING);
                    setEventLatitude(data.data.latitude ?? undefined);
                    setEventLongitude(data.data.longitude ?? undefined);
                    setIsRegistrationRequired(data.data.isRegistrationRequired);
                    setRegistrationLastDate(data.data.registrationLastDate ? new Date(data.data.registrationLastDate) : null);
                    setIsDigestNeeded(data.data.isDigestNeeded);
                    setEventNotification(data.data.notificationText ?? EMPTY_STRING);
                    setEventType(data.data.type);
                    setEventFormat(data.data.format);
                    setEventAudience(data.data.auditory);

                    const loadImage = async () => {
                        if (data.data.picture.id) {
                            try {
                                const pictureObjectUrl = await fetchFileById(data.data.picture.id);
                                setEventLogoUrl(pictureObjectUrl);
                                setEventLogoName(data.data.picture.name);
                                setHavePhoto(true);
                            } catch (err) {
                                console.error("Ошибка при получении логотипа события", err);
                            }
                        }
                    };

                    try {
                        loadImage();
                    }
                    catch (error) {
                        setEventLogoUrl(null)
                    }
                }
            }
            catch (err) {
                console.error("Ошибка загрузки данных события", err);
            } finally {
                setLoading(false);
            }

        })();


    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName) {
            notify("warning", i18next("services.title_validation"));
            return;
        }

        if (!eventStartDate) {
            notify("warning", i18next("events.required_date"))
            return;
        }

        if ( (eventFormat == EventFormat.Online && !eventLink)) {
            notify("warning", i18next("events.required_link"));
            return;
        }

        if (eventFormat == EventFormat.Offline && (eventAddress == EMPTY_STRING) && (!eventLatitude) && (!eventLongitude)) {
            notify("warning", i18next("events.required_address"))
            return;
        }

        if (eventStartDate && eventEndDate && (eventStartDate > eventEndDate)) {
            notify("warning", i18next("events.uncorrected_date"))
            return;
        }

        if (eventStartDate && registrationLastDate && (registrationLastDate > eventStartDate)) {
            notify("warning", i18next("events.uncorrected_register_date"))
            return;
        }

        if (eventLongitude && (eventAddress == EMPTY_STRING) || eventLatitude && (eventAddress == EMPTY_STRING)) {
            notify("warning", i18next("events.required_address"))
            return;
        }

        const finalLogo = havePhoto ? eventLogoId : null;

        const dto: EventEditDto = {
            id: id!,
            title: eventName,
            description: eventDescription,
            digestText: eventDigest,
            pictureId: finalLogo,
            isTimeFromNeeded: isTimeFromNeeded,
            dateTimeFrom: eventStartDate,
            isTimeToNeeded: isTimeToNeeded,
            dateTimeTo: eventEndDate,
            link: eventFormat == EventFormat.Online ? eventLink : EMPTY_STRING,
            addressName: eventFormat == EventFormat.Offline ? eventAddress : EMPTY_STRING,
            latitude: eventFormat == EventFormat.Offline ? eventLatitude ?? null : null,
            longitude: eventFormat == EventFormat.Offline ? eventLongitude ?? null : null,
            isRegistrationRequired: isRegistrationRequired,
            registrationLastDate: registrationLastDate
                ? registrationLastDate
                : null,
            isDigestNeeded: isDigestNeeded,
            notificationText: eventNotification,
            type: eventType,
            format: eventFormat,
            auditory: eventAudience
        };

        await request(
            EventService.editEvent(dto),
            {
                successMessage: i18next("events.success"),
                onSuccess: () => navigate(ADMIN_ROUTES.ADMIN_EVENTS)
            }
        );
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className={styles.admin_events_page}>
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
                <Link to={ADMIN_ROUTES.ADMIN_EVENTS} className={styles.breadcrumb_link}>
                    {i18next("administration.events")}
                </Link>
                <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                <Link to={ADMIN_ROUTES.ADMIN_EVENTS_EDIT()} className={styles.breadcrumb_active}>
                    {i18next("events.edit_event")}
                </Link>
            </div>

            <h2 className={`${styles.title_name}`}>
                {i18next("events.edit_event")}
            </h2>

            <div className={styles.section}>
                <ItemInput label={i18next("events.name")} value={eventName}
                           onChange={(e) => setEventName(e.target.value)}></ItemInput>

                <p className={styles.base_text_for_adding}>{i18next("events.describe")}</p>
                <ItemEditor value={eventDescription} onChange={setEventDescription}/>

                <div className={styles.row_container}>
                    <DateTimePicker
                        label={i18next("events.start_time")}
                        date={eventStartDate}
                        onDateChange={setEventStartDate}
                        withTime={isTimeFromNeeded}
                        onToggleTime={() => setIsTimeFromNeeded(!isTimeFromNeeded)}
                        required={true}
                    />
                    <DateTimePicker
                        label={i18next("events.end_time")}
                        date={eventEndDate}
                        onDateChange={setEventEndDate}
                        withTime={isTimeToNeeded}
                        onToggleTime={() => setIsTimeToNeeded(!isTimeToNeeded)}
                    />
                </div>

                <div className={styles.row_container}>
                    <div className={styles.input_wrapper}>
                        <label className={styles.label_choose}>{i18next("events.type")}</label>
                        <select className={styles.item_input_choose} value={eventType ?? EMPTY_STRING}
                                onChange={(e) => setEventType(e.target.value ? EventType[e.target.value as keyof typeof EventType] : undefined)}>
                            <option value={undefined}></option>
                            <option value={EventType.Open}>Открытое</option>
                            <option value={EventType.Close}>Закрытое</option>
                        </select>
                    </div>

                    <div className={styles.input_wrapper}>
                        <label className={styles.label_choose}>{i18next("events.audience")}</label>
                        <select className={styles.item_input_choose} value={eventAudience ?? EMPTY_STRING}
                                onChange={(e) => setEventAudience(e.target.value ? EventAuditory[e.target.value as keyof typeof EventAuditory] : undefined)}>
                            <option value={undefined}></option>
                            <option value={EventAuditory.All}>Все</option>
                            <option value={EventAuditory.Students}>Студенты</option>
                            <option value={EventAuditory.Employees}>Преподаватели</option>
                        </select>
                    </div>
                </div>

                <div className={styles.near_container}>
                    <p className={styles.base_text_for_adding}>{i18next("events.register")}</p>
                    <ItemSwitch checked={isRegistrationRequired} onChange={() => setIsRegistrationRequired(!isRegistrationRequired)}/>
                </div>

                {isRegistrationRequired ? <div className={styles.input_wrapper_full}>
                    <label className={styles.label_choose}>{i18next("events.date_end_register")}</label>
                    <input className={styles.item_input_choose}
                           value={registrationLastDate ? registrationLastDate.toISOString().slice(0, 10) : EMPTY_STRING} type="date"
                           onChange={(e) => setRegistrationLastDate(new Date(e.target.value))}>

                    </input>
                </div> : <></>}

                <div className={styles.input_wrapper_full}>
                    <label className={styles.label_choose}>{i18next("events.format")}</label>
                    <select className={styles.item_input_choose} value={eventFormat ?? EMPTY_STRING}
                            onChange={(e) => setEventFormat(e.target.value ? EventFormat[e.target.value as keyof typeof EventFormat] : undefined)}>
                        <option value={EventFormat.Online}>{FORMAT_TEXTS.Online}</option>
                        <option value={EventFormat.Offline}>{FORMAT_TEXTS.Offline}</option>
                    </select>
                </div>

                {eventFormat == EventFormat.Online ? <div className={styles.hidden_container}>
                    <ItemInput label={i18next("events.link")} value={eventLink}
                               onChange={(e) => setEventLink(e.target.value)}></ItemInput>

                </div> : <div className={styles.hidden_container}>
                    <p className={styles.text_info}>{i18next("events.address_info")}</p>

                    <AddressInput
                        label={i18next("events.address")}
                        value={eventAddress}
                        onChange={setEventAddress}
                        onSelect={handleAddressChange}
                    />

                    <div className={styles.row_container}>
                        <div className={styles.input_wrapper}>
                            <label className={styles.label_choose}>{i18next("events.longitude")}</label>
                            <input className={styles.item_input_choose} value={eventLongitude} type="number"
                                   onChange={(e) => setEventLongitude(Number(e.target.value))}/>
                        </div>

                        <div className={styles.input_wrapper}>
                            <label className={styles.label_choose}>{i18next("events.latitude")}</label>
                            <input className={styles.item_input_choose} value={eventLatitude} type="number"
                                   onChange={(e) => setEventLatitude(Number(e.target.value))}>

                            </input>
                        </div>
                    </div>
                </div>
                }

                <div className={styles.near_container}>
                    <p className={styles.base_text_for_adding}>{i18next("events.digest")}</p>
                    <ItemSwitch checked={isDigestNeeded} onChange={() => setIsDigestNeeded(!isDigestNeeded)}/>
                </div>
                {isDigestNeeded ? <ItemEditor value={eventDigest} onChange={setEventDigest}/> : <></>}


                <p className={styles.base_text_for_adding}>{i18next("events.notification")}</p>
                <ItemEditor value={eventNotification} onChange={setEventNotification}/>

                <p className={styles.base_text_for_adding}>{i18next("events.files")}</p>
                <ImageUpload
                    onUpload={handlePhoto}
                    initialImageUrl={eventLogoUrl}
                    initialFileName={eventLogoName}
                />

                <div className={styles.buttons_container}>
                    <button className={styles.button_primary} type="submit"
                            onClick={handleSubmit}>{i18next("common.save")}</button>
                    <button className={styles.button_outlined}
                            onClick={() => navigate(ADMIN_ROUTES.ADMIN_EVENTS)}>{i18next("common.cancel")}</button>
                </div>


            </div>
        </div>
    );
};