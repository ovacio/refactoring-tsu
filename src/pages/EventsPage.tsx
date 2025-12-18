import styles from "./administration/styles/AdminEventsPage.module.css";
import { useTranslation } from "react-i18next";
import { useRequest } from "../hooks/useRequest.ts";
import { Link, useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { EventShortDto } from "../services/event.service.ts";
import { PagedListMetaData } from "../services/user.service.ts";
import { ItemInput } from "../components/common/ui/input/ItemInput.tsx";
import { Pagination } from "@mui/material";
import { EventPublicCard } from "../components/events/EventPublicCard.tsx";
import { useProfile } from "../context/ProfileContext.tsx";
import { PUBLIC_ROUTES } from "../constants/routes/routes.ts";
import {
  BREADCRUMB_SEPARATOR,
  PAGE_DEFAULT,
  PAGE_SIZE,
} from "../constants/event-constants/event.constants.ts";
import {
  buildSearchParams,
  getNumberUrlParam,
  getUrlParam,
} from "../helpers/url-params/url-params.ts";
import { filterEventsByAuditory } from "../helpers/event-filters/event-filters.ts";
import { loaderEventsWithAuth } from "../helpers/event-loaders/loader-events-with-auth.ts";

export const EventsPage = () => {
  const { t: i18next } = useTranslation("common");
  const { request } = useRequest();
  const { profile } = useProfile();

  const [allEvents, setAllEvents] = useState<EventShortDto[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventShortDto[]>([]);
  const [metadata, setMetadata] = useState<PagedListMetaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const pageSize = PAGE_SIZE;

  const [searchParams, setSearchParams] = useSearchParams();

  const [eventName, setEventName] = useState<string>(() =>
    getUrlParam(searchParams, "name")
  );

  const [eventDate, setEventDate] = useState<string>(() =>
    getUrlParam(searchParams, "date")
  );

  const [currentPage, setCurrentPage] = useState<number>(() =>
    getNumberUrlParam(searchParams, "page", PAGE_DEFAULT)
  );

  const [isAuth, setIsAuth] = useState(false);

  const handleEventsResponse = (response: any) => {
    setAllEvents(response.data.results);
    setMetadata(response.data.metaData);
    setCurrentPage(response.data.metaData.pageNumber);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await loaderEventsWithAuth({
        eventName,
        eventDate,
        currentPage,
        pageSize,
        request,
        setIsAuth,
        i18next,
      });
      handleEventsResponse(response);
    } catch (e) {
      console.error("Ошибка загрузки событий:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = filterEventsByAuditory(
      allEvents,
      isAuth,
      profile?.userTypes
    );
    setFilteredEvents(filtered);
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
    const params: any = buildSearchParams({
      eventName,
      eventDate,
      page: currentPage,
    });

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
        <span className={styles.breadcrumb_separator}>
          {BREADCRUMB_SEPARATOR}
        </span>
        <Link to={PUBLIC_ROUTES.EVENTS} className={styles.breadcrumb_active}>
          {i18next("administration.events")}
        </Link>
      </div>

      <div className={styles.section}>
        <p className={styles.base_text}>{i18next("events.search")}</p>

        <div className={styles.row_container}>
          <ItemInput
            label={i18next("events.name")}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          ></ItemInput>
          <button
            type="button"
            className={styles.search_button}
            onClick={fetchEvents}
          >
            {i18next("administration.search")}
          </button>
        </div>

        <div className={styles.input_wrapper}>
          <label className={styles.label_choose}>
            {i18next("events.search_date")}
          </label>
          <input
            className={styles.item_input_choose}
            value={eventDate}
            type="date"
            onChange={(e) => setEventDate(e.target.value)}
          ></input>
        </div>
      </div>

      <div className={styles.events_grid}>
        {loading ? (
          <p>{i18next("common.loading")}</p>
        ) : filteredEvents.length === 0 ? (
          <p style={{ padding: 16 }}>{i18next("administration.no_events")}</p>
        ) : (
          filteredEvents.map((event) => (
            <EventPublicCard
              key={event.id}
              event={event}
              isFilter={eventDate.length > 0 || eventName.length > 0}
            />
          ))
        )}
      </div>

      <div className={styles.pagination_container}>
        <Pagination
          count={metadata?.pageCount || PAGE_DEFAULT}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};
