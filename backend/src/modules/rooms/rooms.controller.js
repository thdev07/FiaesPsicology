import * as roomsService from './rooms.service.js';

export async function listRooms(req, res, next) {
  try {
    const { data, error } = await roomsService.listRoomsService();
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function getRoomById(req, res, next) {
  try {
    const { data, error } = await roomsService.getRoomByIdService(req.params.id);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function createRoom(req, res, next) {
  try {
    const { data, error } = await roomsService.createRoomService(req.body);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateRoom(req, res, next) {
  try {
    const { data, error } = await roomsService.updateRoomService(req.params.id, req.body);
    if (error) throw error;
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteRoom(req, res, next) {
  try {
    const { error } = await roomsService.deleteRoomService(req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) { next(err); }
}
