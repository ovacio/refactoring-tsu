import {useTranslation} from "react-i18next";
import {useRequest} from "../../hooks/useRequest.ts";
import React, {useEffect, useState} from "react";
import {PagedListMetaData} from "../../services/user.service.ts";
import styles from "./styles/AdminEventsPage.module.css";
import {Link, useNavigate} from "react-router-dom";
import AddService from "../../assets/icons/AddService.tsx";
import {Pagination} from "@mui/material";
import {EventFormat, EventService, EventShortDto, EventStatus, EventType} from "../../services/event.service.ts";
import {EventCard} from "../../components/admin/EventCard.tsx";
import {ItemInput} from "../../components/common/ui/input/ItemInput.tsx";
import SvgFilter from "../../assets/icons/Filter.tsx";
import { useSearchParams } from "react-router-dom";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "../../constants/routes/routes.ts";
import { BREADCRUMB_SEPARATOR, EMPTY_STRING, FORMAT_TEXTS } from "../../constants/event-constants/event.constants.ts";
import { ADMIN_USERS_CONSTANTS } from "../../constants/admin-users-constants/admin-users-constants.ts";

export const AdminEventsPage = () => {
    const { t: i18next } = useTranslation('common');
    const { request } = useRequest();
    const navigate = useNavigate();

    const [events, setEvents] = useState<EventShortDto[]>([]);
    const [metadata, setMetadata] = useState<PagedListMetaData | null>(null);

    const [loading, setLoading] = useState(false);
    const pageSize = ADMIN_USERS_CONSTANTS.PAGE_SIZE;

    const [isOpen, setIsOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    const getParam = (key: string) => searchParams.get(key) || EMPTY_STRING;

    const [eventName, setEventName] = useState<string>(() => getParam("name"));
    const [eventStatus, setEventStatus] = useState<string>(() => getParam("status"));
    const [eventType, setEventType] = useState<string>(() => getParam("type"));
    const [eventFormat, setEventFormat] = useState<string>(() => getParam("format"));
    const [eventDate, setEventDate] = useState<string>(() => getParam("date"));
    const [currentPage, setCurrentPage] = useState<number>(() =>
        parseInt(searchParams.get("page") || String(ADMIN_USERS_CONSTANTS.DEFAULT_PAGE))
    );

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await request(
                EventService.getEvents(
                    eventStatus,
                    eventType,
                    eventName,
                    eventFormat,
                    eventDate,
                    420,
                    currentPage,
                    pageSize
                ),
                {
                    errorMessage: i18next("common.access_denied"),
                }
            );

            setEvents(response.data.results);
            setMetadata(response.data.metaData);
            setCurrentPage(response.data.metaData.pageNumber);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        updateSearchParams();
        fetchEvents();
    }, [eventName, eventStatus, eventType, eventFormat, eventDate, currentPage]);

    const updateSearchParams = () => {
        const params: any = {
            eventName, eventStatus, eventType, eventFormat, eventDate,
            page: currentPage,
        };

        Object.keys(params).forEach(
            key => (params[key] === EMPTY_STRING || params[key] == null) && delete params[key]
        );

        setSearchParams(params);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleDeleteEvent = async (eventId: string) => {
        try {
            await request(
               EventService.deleteEvent(eventId),
                {
                    successMessage: i18next("events.event_delete_success"),
                    errorMessage: i18next("events.event_delete_error")
                }
            );
            setEvents(prev => prev.filter(event => event.id !== eventId));

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (event: EventShortDto) => {
        navigate(ADMIN_ROUTES.ADMIN_EVENTS_EDIT(event.id));
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
                <Link to={ADMIN_ROUTES.ADMIN_EVENTS} className={styles.breadcrumb_active}>
                    {i18next("administration.events")}
                </Link>
            </div>

            <h2 className={`${styles.title_name}`}>
                {i18next("administration.events")}
            </h2>

            <button
                className={styles.add_event_button}
                onClick={() => navigate(ADMIN_ROUTES.ADMIN_EVENTS_CREATE)}
            >
                {i18next("events.add")} <AddService/>
            </button>


            <div className={styles.section}>
                <div className={styles.row_container}>
                    <p className={styles.base_text}>{i18next("events.search_bar")}</p>
                    <button className={styles.filter_button} onClick={() => {
                        setIsOpen(!isOpen)
                    }}>{i18next("events.filters")}<SvgFilter/></button>

                </div>
                <div className={styles.row_container}>
                    <ItemInput label={i18next("events.name")} value={eventName}
                               onChange={(e) => setEventName(e.target.value)}></ItemInput>
                    <button
                        type="button"
                        className={styles.search_button}
                        onClick={fetchEvents}
                    >
                        {i18next("administration.search")}
                    </button>
                </div>

                {isOpen ? <div className={styles.hidden_section}>
                    <div className={styles.row_container}>
                        <div className={styles.input_wrapper}>
                            <label className={styles.label_choose}>{i18next("events.status")}</label>
                            <select className={styles.item_input_choose} value={status}
                                    onChange={(e) => setEventStatus(e.target.value)}>
                                <option value={undefined}></option>
                                <option value={EventStatus.Actual}>Активное</option>
                                <option value={EventStatus.Finished}>Завершилось</option>
                                <option value={EventStatus.Draft}>Черновик</option>
                                <option value={EventStatus.Archive}>Архив</option>
                            </select>
                        </div>

                        <div className={styles.input_wrapper}>
                            <label className={styles.label_choose}>{i18next("events.type")}</label>
                            <select className={styles.item_input_choose} value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}>
                                <option value={undefined}></option>
                                <option value={EventType.Open}>Открытое</option>
                                <option value={EventType.Close}>Закрытое</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.row_container}>
                        <div className={styles.input_wrapper}>
                            <label className={styles.label_choose}>{i18next("events.format")}</label>
                            <select className={styles.item_input_choose} value={eventFormat}
                                    onChange={(e) => setEventFormat(e.target.value)}>
                                <option value={undefined}></option>
                                <option value={EventFormat.Online}>{FORMAT_TEXTS.Online}</option>
                                <option value={EventFormat.Offline}>{FORMAT_TEXTS.Offline}</option>
                            </select>
                        </div>

                        <div className={styles.input_wrapper}>
                            <label className={styles.label_choose}>{i18next("events.search_date")}</label>
                            <input className={styles.item_input_choose} value={eventDate} type="date"
                                    onChange={(e) => setEventDate(e.target.value)}>

                            </input>
                        </div>

                    </div>
                </div> : <></>}


            </div>


            <div className={styles.events_container}>
                {loading ? (
                    <p>{i18next("common.loading")}</p>
                ) : events.length === 0 ? (
                    <p style={{padding: 16}}>{i18next("administration.no_events")}</p>
                ) : events.map((event) => (
                    <EventCard event={event} onDelete={handleDeleteEvent} onEdit={handleEditEvent}></EventCard>
                ))}
            </div>

            <div className={styles.pagination_container}>
                <Pagination
                    count={metadata?.pageCount || Number(ADMIN_USERS_CONSTANTS.DEFAULT_PAGE)}
                    page={currentPage}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    )
}