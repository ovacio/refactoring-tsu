import {useTranslation} from "react-i18next";
import {useRequest} from "../../hooks/useRequest.ts";
import styles from "./styles/AdminAddEventPage.module.css";
import {Link, useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {ItemInput} from "../../components/common/ui/input/ItemInput.tsx";
import {ItemSwitch} from "../../components/common/ui/switch/ItemSwitch.tsx";
import {EventAuditory, EventCreateDto, EventFormat, EventService, EventType} from "../../services/event.service.ts";
import ItemEditor from "../../components/admin/ItemEditor.tsx";
import ImageUpload from "../../components/admin/ImageUpload.tsx";
import {DateTimePicker} from "../../components/admin/DateTimePicker.tsx";
import {useNotification} from "../../context/NotificationContext.tsx";
import {AddressInput} from "../../components/admin/AddressInput.tsx";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "../../constants/routes/routes.ts";
import { BREADCRUMB_SEPARATOR, EMPTY_STRING, FORMAT_TEXTS } from "../../constants/event-constants/event.constants.ts";

export const AdminAddEventPage = () => {
    const { t: i18next } = useTranslation('common');
    const { request } = useRequest();
    const navigate = useNavigate();
    const { notify } = useNotification();

    const [eventName, setEventName] = useState<string>(EMPTY_STRING);
    const [eventDescription, setEventDescription] = useState<string>(EMPTY_STRING);
    const [isRegistrationRequired, setIsRegistrationRequired] = useState<boolean>(false);
    const [eventAddress, setEventAddress] = useState<string>(EMPTY_STRING);

    const [eventType, setEventType] = useState<EventType | undefined>(undefined);
    const [eventFormat, setEventFormat] = useState<EventFormat | undefined>(EventFormat.Online);
    const [eventAudience, setEventAudience] = useState<EventAuditory | undefined>(undefined);

    const [eventLongitude, setEventLongitude] = useState<number>();
    const [eventLatitude, setEventLatitude] = useState<number>();

    const [eventLink, setEventLink] = useState<string>(EMPTY_STRING);
    const [eventNotification, setEventNotification] = useState<string>(EMPTY_STRING);
    const [isDigestNeeded, setIsDigestNeeded] = useState<boolean>(false);
    const [eventDigest, setEventDigest] = useState<string>(EMPTY_STRING);
    const [eventStartDate, setEventStartDate] = useState<Date | null>(null);
    const [eventEndDate, setEventEndDate] = useState<Date | null>(null);
    const [isTimeFromNeeded, setIsTimeFromNeeded] = useState(true);
    const [isTimeToNeeded, setIsTimeToNeeded] = useState(false);
    const [registrationLastDate, setRegistrationLastDate] = useState<Date | null>(null);

    const [eventLogoId, setEventLogoId] = useState<string | null>(null);
    const [, setHavePhoto] = useState<boolean>(false);

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

    const handlePhoto = (id: string | null) => {
        setEventLogoId(id);
        if (id == null) {
            setHavePhoto(false)
        }
        else {
            setHavePhoto(true);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (eventName.length <= 0) {
            notify('warning', i18next("services.title_validation"));
            return;
        }

        const finalLogo = eventLogoId ? eventLogoId : null;
        const finalLatitude = eventLatitude ? eventLatitude : null;
        const finalLongitude = eventLongitude ? eventLongitude : null;

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

        const eventCreateBody: EventCreateDto = {
            title: eventName,
            description: eventDescription,
            digestText: eventDigest,
            pictureId: finalLogo,
            isTimeFromNeeded: isTimeFromNeeded,
            dateTimeFrom: eventStartDate,
            isTimeToNeeded: isTimeToNeeded,
            dateTimeTo: eventEndDate,
            link: eventLink,
            addressName: eventAddress,
            latitude: finalLatitude,
            longitude: finalLongitude,
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
        console.log(eventCreateBody)


        //if (serviceToEdit?.id) if (serviceToEdit.logo?.id) setHavePhoto(true)


        await request(
            EventService.createEvent(eventCreateBody),
            {
                successMessage: i18next("events.success"),
                onSuccess: () => {
                    navigate(ADMIN_ROUTES.ADMIN_EVENTS);
                }
            }
        );
    };

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
                <Link to={ADMIN_ROUTES.ADMIN_EVENTS_CREATE} className={styles.breadcrumb_active}>
                    {i18next("events.creating")}
                </Link>
            </div>

            <h2 className={`${styles.title_name}`}>
                {i18next("events.creating")}
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
                />

                <div className={styles.buttons_container}>
                    <button className={styles.button_primary} type="submit" onClick={handleSubmit}>{i18next("common.save")}</button>
                    <button className={styles.button_outlined} onClick={() => navigate(ADMIN_ROUTES.ADMIN_EVENTS)}>{i18next("common.cancel")}</button>
                </div>

            </div>
        </div>
    )
}