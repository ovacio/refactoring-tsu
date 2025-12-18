import { fetchFileById } from "../../pages/administration/AdminItemUserPage";
import { EventDto, EventService } from "../../services/event.service";
import defaultAvatar from "../../assets/jpg/default_avatar.jpg";

export const loadEventData = async (id: string) => {
  const response = await EventService.getEventByIdPublic(id);
  return response.data;
};

export const loadEventImage = async (event: EventDto) => {
  if (!event.picture?.id) return defaultAvatar;
  return await fetchFileById(event.picture.id);
};
