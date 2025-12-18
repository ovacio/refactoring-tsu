import styles from "./administration/styles/AdminEventsPage.module.css"
import {useTranslation} from "react-i18next";
import {useRequest} from "../hooks/useRequest.ts";
import {Link, useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {EventAuditory, EventService, EventShortDto} from "../services/event.service.ts";
import {PagedListMetaData} from "../services/user.service.ts";
import {ItemInput} from "../components/common/ui/input/ItemInput.tsx";
import {Pagination} from "@mui/material";
import {EventPublicCard} from "../components/events/EventPublicCard.tsx";
import {useProfile} from "../context/ProfileContext.tsx";
import {UserType} from "../services/profile.service.ts";
import { PUBLIC_ROUTES } from "../constants/routes/routes.ts";
import { BREADCRUMB_SEPARATOR, EMPTY_STRING, PAGE_DEFAULT, PAGE_SIZE } from "../constants/event-constants/event.constants.ts";

export const EventsPage = () => {
    const { t: i18next } = useTranslation('common');
    const { request } = useRequest();
    const { profile } = useProfile();

    const [allEvents, setAllEvents] = useState<EventShortDto[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<EventShortDto[]>([]);
    const [metadata, setMetadata] = useState<PagedListMetaData | null>(null);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const pageSize = PAGE_SIZE;

    const [searchParams, setSearchParams] = useSearchParams();
    const getParam = (key: string) => searchParams.get(key) || EMPTY_STRING;

    const [eventName, setEventName] = useState<string>(() => getParam("name"));
    const [eventDate, setEventDate] = useState<string>(() => getParam("date"));
    const [currentPage, setCurrentPage] = useState<number>(() =>
        parseInt(searchParams.get("page") || String(PAGE_DEFAULT))
    );

    const [isAuth, setIsAuth] = useState(false);

    const filterEvents = (events: EventShortDto[]) => {
        if (!isAuth) {
            return events.filter(event => event.auditory === EventAuditory.All);
        }

        if (!profile?.userTypes) {
            return events.filter(event => event.auditory === EventAuditory.All);
        }

        return events.filter(event => {
            if (event.auditory === EventAuditory.All) {
                return true;
            }

            if (profile.userTypes) {
                return profile.userTypes.some(userType => {
                    if (userType === UserType.Student) {
                        return event.auditory === EventAuditory.Students;
                    }
                    if (userType === UserType.Employee) {
                        return event.auditory === EventAuditory.Employees;
                    }
                    return false;
                });
            }
        });
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const fetchFn = async () => {
                try {
                    const response = await request(
                        EventService.getEventsPublicWithAuth(
                            eventName,
                            eventDate,
                            420,
                            currentPage,
                            pageSize
                        ),
                        {
                            errorMessage: i18next("common.not_logged_in")
                        }
                    );
                    setIsAuth(true);
                    return response;
                }
                catch (error: any) {
                    if (error.response?.status === 401) {
                        setIsAuth(false);
                        return await request(
                            EventService.getEventsPublic(
                                eventName,
                                eventDate,
                                420,
                                currentPage,
                                pageSize
                            )
                        );
                    } else {
                        throw error;
                    }
                }
            };

            const response = await fetchFn();
            setAllEvents(response.data.results);
            setMetadata(response.data.metaData);
            setCurrentPage(response.data.metaData.pageNumber);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setFilteredEvents(filterEvents(allEvents));
    }, [allEvents, profile, isAuth]);

    useEffect(() => {
        updateSearchParams();
        fetchEvents();
    }, [eventName, eventDate, currentPage]);

    useEffect(() => {
        if (profile !== undefined) {
            setProfileLoading(false);
        }
    }, [profile]);

    const updateSearchParams = () => {
        const params: any = {
            eventName,
            eventDate,
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

    if (profileLoading) {
        return <p>{i18next("common.loading")}</p>;
    }

    return (
        <div className={styles.admin_events_page}>
            <h1 className={styles.title}>{i18next("events.events")}</h1>

            <div className={styles.breadcrumb}>
                <Link to={PUBLIC_ROUTES.EVENTS} className={styles.breadcrumb_link}>
                    {i18next("common.main")}
                </Link>
                <span className={styles.breadcrumb_separator}>{BREADCRUMB_SEPARATOR}</span>
                <Link to={PUBLIC_ROUTES.EVENTS} className={styles.breadcrumb_active}>
                    {i18next("administration.events")}
                </Link>
            </div>

            <div className={styles.section}>
                <p className={styles.base_text}>{i18next("events.search")}</p>

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

                <div className={styles.input_wrapper}>
                    <label className={styles.label_choose}>{i18next("events.search_date")}</label>
                    <input className={styles.item_input_choose} value={eventDate} type="date"
                           onChange={(e) => setEventDate(e.target.value)}>
                    </input>
                </div>
            </div>

            <div className={styles.events_grid}>
                {loading ? (
                    <p>{i18next("common.loading")}</p>
                ) : filteredEvents.length === 0 ? (
                    <p style={{padding: 16}}>{i18next("administration.no_events")}</p>
                ) : filteredEvents.map((event) => (
                    <EventPublicCard
                        key={event.id}
                        event={event}
                        isFilter={eventDate.length > 0 || eventName.length > 0}
                    />
                ))}
            </div>

            <div className={styles.pagination_container}>
                <Pagination
                    count={metadata?.pageCount || PAGE_DEFAULT}
                    page={currentPage}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    )
}