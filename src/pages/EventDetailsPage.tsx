import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  EventDto,
  EventFormat,
  EventInnerRegisterDto,
  EventService,
} from "../services/event.service.js";
import styles from "../pages/administration/styles/AdminEventsPage.module.css";
import defaultAvatar from "../assets/jpg/default_avatar.jpg";

import { formatDate } from "../components/admin/EventCard.js";
import MapView from "../components/admin/MapView.js";
import { useRequest } from "../hooks/useRequest.js";
import { RegisterModal } from "../components/events/RegisterModal.js";
import {
  BREADCRUMB_SEPARATOR,
  EMPTY_STRING,
  FORMAT_TEXTS,
} from "../constants/event-constants/event.constants.js";
import { PUBLIC_ROUTES } from "../constants/routes/routes.js";
import { HTTP_STATUS } from "../constants/http-status/http-status.js";
import {
  loadEventData,
  loadEventImage,
} from "../helpers/event-loaders/loader-event.js";

export const EventDetailsPage = () => {
  const { t: i18next } = useTranslation("common");
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [eventImageUrl, setEventImageUrl] = useState<string | undefined>();

  const [isParticipant, setIsParticipant] = useState(false);
  const [isAuth, setIsAuth] = useState(true);
  const [isRegisterWindowOpen, setIsRegisterWindowOpen] = useState(false);

  const { request } = useRequest();

  const loadEventWithDetails = async () => {
    try {
      if (!eventId) {
        console.error("Event ID is missing");
        return;
      }

      const event = await loadEventData(eventId);
      const image = await loadEventImage(event);

      setEvent(event);
      setEventImageUrl(image);
      await validateUserParticipation(eventId);

      return () => {
        if (image && image !== defaultAvatar) {
          URL.revokeObjectURL(image);
        }
      };
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      setEventImageUrl(defaultAvatar);
    }
  };

  useEffect(() => {
    loadEventWithDetails();
  }, [eventId, isParticipant]);

  const validateUserParticipation = async (eventId: string) => {
    try {
      const { data } = await EventService.checkIsUserParticipant(eventId);
      setIsParticipant(data.isParticipating);
      setIsAuth(true);
    } catch (error: any) {
      if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
        setIsAuth(false);
      }
    }
  };

  const registerAsInnerParticipant = async (eventId: string) => {
    if (!eventId) return;

    const eventInnerRegisterId: EventInnerRegisterDto = { eventId };
    await request(EventService.registerInner(eventInnerRegisterId), {
      successMessage: i18next("events.success_register"),
      errorMessage: i18next("events.failed_register"),
      onSuccess: () => setIsParticipant(true),
    });
  };

  const handleParticipateClick = async () => {
    if (!eventId) return;

    await validateUserParticipation(eventId);
    if (isAuth) {
      await registerAsInnerParticipant(eventId);
    } else {
      setIsRegisterWindowOpen(true);
    }
  };

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
        <p className={styles.breadcrumb_active}>{event?.title}</p>
      </div>

      <div className={styles.item_page_container}>
        <div className={styles.header_item_event}>
          <h2 className={styles.item_event_title}>{event?.title}</h2>

          {event &&
            new Date(event.registrationLastDate).getTime() > Date.now() &&
            (isParticipant ? (
              <button
                type="button"
                className={styles.already_participant_button}
                disabled
              >
                {i18next("events.participate")}
              </button>
            ) : (
              <button
                type="button"
                className={styles.participant_button}
                onClick={handleParticipateClick}
              >
                {i18next("events.will_participate")}
              </button>
            ))}
        </div>

        {event && !isAuth ? (
          <RegisterModal
            isOpen={isRegisterWindowOpen}
            onClose={() => {
              setIsRegisterWindowOpen(false);
            }}
            onSuccess={() => {
              setIsRegisterWindowOpen(false);
              loadEventWithDetails();
              setIsParticipant(true);
            }}
            eventId={event.id}
          />
        ) : (
          <></>
        )}

        <div className={styles.section}>
          <p>{i18next("events.desc")}</p>
          <div
            dangerouslySetInnerHTML={{
              __html: event?.description || EMPTY_STRING,
            }}
          />
          <label>
            <img
              src={eventImageUrl}
              alt="avatar"
              className={styles.image_item_event}
            />
          </label>

          {event?.format == EventFormat.Online ? ( // online register required
            <>
              {event?.isRegistrationRequired ? (
                <>
                  <div className={styles.section_item_block}>
                    <div className={styles.section_name_text}>
                      {i18next("events.date_end_register")}
                    </div>
                    <div className={styles.section_base_text}>
                      {formatDate(event.registrationLastDate)}
                    </div>
                  </div>

                  {event?.dateTimeTo ? (
                    <div className={styles.section_item_block}>
                      <div className={styles.section_name_text}>
                        {i18next("events.date")}
                      </div>
                      <div className={styles.section_base_text}>
                        {event.dateTimeTo
                          ? formatDate(event.dateTimeFrom) +
                            " - " +
                            formatDate(event.dateTimeTo)
                          : formatDate(event.dateTimeFrom)}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className={styles.section_row}>
                    {event?.format ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.format")}
                        </div>
                        <div className={styles.section_base_text}>
                          {event.format == EventFormat.Online
                            ? FORMAT_TEXTS.Online
                            : FORMAT_TEXTS.Offline}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}

                    {event?.link ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.link")}
                        </div>
                        <div className={styles.section_base_text}>
                          {event.link}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              ) : (
                // online register not required
                <>
                  {event?.dateTimeTo ? (
                    <div className={styles.section_item_block}>
                      <div className={styles.section_name_text}>
                        {i18next("events.date")}
                      </div>
                      <div className={styles.section_base_text}>
                        {event.dateTimeTo
                          ? formatDate(event.dateTimeFrom) +
                            " - " +
                            formatDate(event.dateTimeTo)
                          : formatDate(event.dateTimeFrom)}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}

                  <div className={styles.section_row}>
                    {event?.format ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.format")}
                        </div>
                        <div className={styles.section_base_text}>
                          {event.format == EventFormat.Online
                            ? FORMAT_TEXTS.Online
                            : FORMAT_TEXTS.Offline}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}

                    {event?.link ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.link")}
                        </div>
                        <div className={styles.section_base_text}>
                          {event.link}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              )}
            </> //offline register required
          ) : (
            <>
              {event?.isRegistrationRequired ? (
                <div className={styles.content}>
                  <div className={styles.section_row}>
                    <div className={styles.section_item_block}>
                      <div className={styles.section_name_text}>
                        {i18next("events.date_end_register")}
                      </div>
                      <div className={styles.section_base_text}>
                        {formatDate(event.registrationLastDate)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.section_row}>
                    {event?.dateTimeTo ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.date")}
                        </div>
                        <div className={styles.section_base_text}>
                          {event.dateTimeTo
                            ? formatDate(event.dateTimeFrom) +
                              " - " +
                              formatDate(event.dateTimeTo)
                            : formatDate(event.dateTimeFrom)}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}

                    {event?.format ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.format")}
                        </div>
                        <div className={styles.section_base_text}>Оффлайн</div>
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.main_part}>
                    <div className={styles.left_part}>
                      {event?.addressName ? (
                        <div className={styles.section_item_block}>
                          <div className={styles.section_name_text}>
                            {i18next("profile.address")}
                          </div>
                          <div className={styles.section_base_text}>
                            {event.addressName}
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

                    <div className={styles.map_container}>
                      {event ? (
                        <MapView
                          addressName={event.addressName}
                          latitude={event.latitude}
                          longitude={event.longitude}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // offline register not required
                <div className={styles.content}>
                  <div className={styles.section_row}>
                    {event?.dateTimeTo ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.date")}
                        </div>
                        <div className={styles.section_base_text}>
                          {event.dateTimeTo
                            ? formatDate(event.dateTimeFrom) +
                              " - " +
                              formatDate(event.dateTimeTo)
                            : formatDate(event.dateTimeFrom)}
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}

                    {event?.format ? (
                      <div className={styles.section_item_block}>
                        <div className={styles.section_name_text}>
                          {i18next("events.format")}
                        </div>
                        <div className={styles.section_base_text}>Оффлайн</div>
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.main_part}>
                    <div className={styles.left_part}>
                      {event?.addressName ? (
                        <div className={styles.section_item_block}>
                          <div className={styles.section_name_text}>
                            {i18next("profile.address")}
                          </div>
                          <div className={styles.section_base_text}>
                            {event.addressName}
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>

                    <div className={styles.map_container}>
                      {event ? (
                        <MapView
                          addressName={event.addressName}
                          latitude={event.latitude}
                          longitude={event.longitude}
                        />
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
