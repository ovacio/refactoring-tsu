import { EventAuditory, EventShortDto } from "../../services/event.service";
import { UserType } from "../../services/profile.service";

export const filterEventsByAuditory = (
  events: EventShortDto[],
  isAuth: boolean,
  userTypes?: UserType[] | null
): EventShortDto[] => {
  if (!isAuth) {
    return events.filter((event) => event.auditory === EventAuditory.All);
  }

  if (!userTypes || userTypes.length === 0) {
    return events.filter((event) => event.auditory === EventAuditory.All);
  }

  return events.filter((event) => {
    if (event.auditory === EventAuditory.All) {
      return true;
    }

    return userTypes.some((userType) => {
      if (userType === UserType.Student) {
        return event.auditory === EventAuditory.Students;
      }
      if (userType === UserType.Employee) {
        return event.auditory === EventAuditory.Employees;
      }
      return false;
    });
  });
};
