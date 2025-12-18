import { TIMEZONE_OFFSET } from "../../constants/event-constants/event.constants";
import { HTTP_STATUS } from "../../constants/http-status/http-status";
import { RequestFunction } from "../../hooks/useRequest.types";
import { EventService } from "../../services/event.service";

type FetchEventsParams = {
  eventName: string;
  eventDate: string;
  currentPage: number;
  pageSize: number;
  request: RequestFunction;
  setIsAuth: (isAuth: boolean) => void;
  i18next: (key: string) => string;
};

export const loaderEventsWithAuth = async ({
  eventName,
  eventDate,
  currentPage,
  pageSize,
  request,
  setIsAuth,
  i18next,
}: FetchEventsParams) => {
  try {
    const response = await request(
      EventService.getEventsPublicWithAuth(
        eventName,
        eventDate,
        TIMEZONE_OFFSET,
        currentPage,
        pageSize
      ),
      {
        errorMessage: i18next("common.not_logged_in"),
      }
    );

    setIsAuth(true);
    return response;
  } catch (error: any) {
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
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
    }
    throw error;
  }
};