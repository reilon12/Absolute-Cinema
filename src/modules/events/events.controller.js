const prisma = require('../../config/db');

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { startDate: 'asc' },
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron obtener los eventos' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo obtener el evento' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, category, imageUrl, isOnline, status } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const event = await prisma.event.create({
      data: {
        title,
        description,
        slug,
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl,
        isOnline: Boolean(isOnline),
        status: status || 'ACTIVE',
      },
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear el evento' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, category, imageUrl, isOnline, status } = req.body;
    const existing = await prisma.event.findUnique({ where: { id: Number(id) } });

    if (!existing) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const slug = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : existing.slug;

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        slug,
        category,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        imageUrl,
        isOnline: typeof isOnline === 'boolean' ? isOnline : existing.isOnline,
        status: status || existing.status,
      },
    });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo actualizar el evento' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: Number(req.params.id) } });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await prisma.event.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo eliminar el evento' });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
